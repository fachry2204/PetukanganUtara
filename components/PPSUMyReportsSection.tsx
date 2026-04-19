import React, { useState, useMemo } from 'react';
import { User, TugasPPSU, AttendanceRecord } from '../types';
import { Calendar, ClipboardList, CheckCircle2, MapPin, Clock, FileText, ChevronRight, X, AlertTriangle, Camera, MapPinned } from 'lucide-react';
import LocationMiniMap from './LocationMiniMap';

interface PPSUMyReportsSectionProps {
  user: User;
  tugasList: TugasPPSU[];
  attendanceRecords: AttendanceRecord[];
}

const PPSUMyReportsSection: React.FC<PPSUMyReportsSectionProps> = ({ user, tugasList, attendanceRecords: rawAttendance }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'tasks'>('attendance');
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<any | null>(null);
  
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenMap, setFullscreenMap] = useState<{lat: number, lng: number} | null>(null);

  const renderAttendanceThumbnails = (stageData: any, typeName: string, colorClass: string) => {
      if (!stageData || !stageData.photo) return null;
      return (
         <div className="flex gap-2 ml-auto shrink-0">
             <button 
                 onClick={(e) => { e.stopPropagation(); setFullscreenImage(stageData.photo) }}
                 className={`w-12 h-12 rounded-lg border-2 ${colorClass} overflow-hidden bg-slate-100 relative group transition-transform hover:scale-105 shadow-sm`}
             >
                 <img src={stageData.photo} alt={typeName} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Camera size={16} className="text-white drop-shadow-md" />
                 </div>
             </button>
             {stageData.lat && stageData.lng && (
                 <button 
                     onClick={(e) => { e.stopPropagation(); setFullscreenMap({ lat: parseFloat(stageData.lat), lng: parseFloat(stageData.lng) }) }}
                     className={`w-12 h-12 rounded-lg border-2 ${colorClass} flex flex-col items-center justify-center bg-white text-slate-500 group transition-transform hover:scale-105 shadow-sm`}
                     title="Lihat Peta"
                 >
                     <MapPin size={18} className="mb-0.5 group-hover:text-emerald-500 transition-colors" />
                     <span className="text-[8px] font-black uppercase tracking-widest leading-none">MAP</span>
                 </button>
             )}
         </div>
      );
  };

  // Group Attendance from API Data
  const attendanceRecords = useMemo(() => {
    if (!rawAttendance) return [];
    
    // Filter only for current user
    const myRecords = rawAttendance.filter(r => r.userNik === user.nik);
    
    // Group by Date
    const groups: Record<string, any> = {};
    
    // Sort records by timestamp ASC to ensure logic order (Masuk -> Pulang)
    const sortedRecords = [...myRecords].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    sortedRecords.forEach(r => {
        // Use local date for grouping instead of raw UTC string split
        const date = new Date(r.timestamp).toLocaleDateString('en-CA');
        if (!groups[date]) {
            groups[date] = {
                date,
                hasMasuk: false,
                hasIstirahat: false,
                hasSelesaiIstirahat: false,
                hasPulang: false,
                timeMasuk: null,
                timeIstirahat: null,
                timeSelesaiIstirahat: null,
                timePulang: null,
                durasiIstirahat: '',
                dataMasuk: { photo: null, lat: null, lng: null },
                dataIstirahat: { photo: null, lat: null, lng: null },
                dataSelesaiIstirahat: { photo: null, lat: null, lng: null },
                dataPulang: { photo: null, lat: null, lng: null },
                totalWorkDuration: ''
            };
        }
        
        const g = groups[date];
        if (r.type === 'Absen Masuk') {
            g.hasMasuk = true;
            g.timeMasuk = r.timestamp;
            g.dataMasuk = { photo: r.photo, lat: r.latitude, lng: r.longitude };
        } else if (r.type === 'Istirahat') {
            g.hasIstirahat = true;
            g.timeIstirahat = r.timestamp;
            g.dataIstirahat = { photo: r.photo, lat: r.latitude, lng: r.longitude };
        } else if (r.type === 'Selesai Istirahat') {
            g.hasSelesaiIstirahat = true;
            g.timeSelesaiIstirahat = r.timestamp;
            g.dataSelesaiIstirahat = { photo: r.photo, lat: r.latitude, lng: r.longitude };
            
            // Calculate Durasi Istirahat
            if (g.timeIstirahat) {
                const start = new Date(g.timeIstirahat).getTime();
                const end = new Date(r.timestamp).getTime();
                const diffMin = Math.floor((end - start) / 60000);
                g.durasiIstirahat = `${Math.floor(diffMin / 60)} Jam ${diffMin % 60} Menit`;
            }
        } else if (r.type === 'Absen Pulang') {
            g.hasPulang = true;
            g.timePulang = r.timestamp;
            g.dataPulang = { photo: r.photo, lat: r.latitude, lng: r.longitude };

            // Calculate Total Work Duration
            if (g.timeMasuk) {
                const startWork = new Date(g.timeMasuk).getTime();
                const endWork = new Date(r.timestamp).getTime();
                const diffMin = Math.floor((endWork - startWork) / 60000);
                g.totalWorkDuration = `${Math.floor(diffMin / 60)} Jam ${diffMin % 60} Menit`;
            }
        }
    });

    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [rawAttendance, user.nik]);

  const groupedTasks = useMemo(() => {
    const userReports = tugasList.filter(t => t.reporterNik === user.nik || t.staffId === user.id)
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Grouping logic by title if multiple entries exist (migration pattern)
    const groups: Record<string, TugasPPSU[]> = {};
    userReports.forEach(t => {
        const title = t.judulTugas;
        if (!groups[title]) groups[title] = [];
        groups[title].push(t);
    });

    return Object.entries(groups).map(([title, tasks]) => {
        return {
           title,
           tasks,
           latestTask: tasks[0]
        };
    });
  }, [tugasList, user.nik, user.id]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <FileText className="text-indigo-600" /> Histori Laporan Saya
        </h2>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
           <button 
             onClick={() => setActiveTab('attendance')}
             className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Riwayat Absensi
           </button>
           <button 
             onClick={() => setActiveTab('tasks')}
             className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Riwayat Tugas Lapangan
           </button>
        </div>
      </div>

      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendanceRecords.length === 0 ? (
             <div className="col-span-full py-16 text-center text-slate-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">Belum ada riwayat absensi.</p>
             </div>
          ) : (
            attendanceRecords.map((record, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedAttendance(record)}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
              >
                 <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                          <Calendar size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Absensi</p>
                          <p className="font-bold text-slate-800">{new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {record.totalWorkDuration && (
                            <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex flex-col items-end shrink-0">
                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Total Kerja</p>
                                <p className="text-xs font-black text-emerald-700 leading-none">{record.totalWorkDuration}</p>
                            </div>
                        )}
                        {!record.totalWorkDuration && record.hasMasuk && (
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse shrink-0">On Duty</span>
                        )}
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                 </div>
                 
                 <div className="flex justify-between gap-1 mt-4">
                    <div className={`h-1.5 flex-1 rounded-full ${record.hasMasuk ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 flex-1 rounded-full ${record.hasIstirahat ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 flex-1 rounded-full ${record.hasSelesaiIstirahat ? 'bg-cyan-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 flex-1 rounded-full ${record.hasPulang ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 mt-2 text-right">
                    {record.hasPulang ? 'Siklus Selesai' : 'Sedang Berjalan'}
                 </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 gap-4">
          {groupedTasks.length === 0 ? (
             <div className="col-span-full py-16 text-center text-slate-400">
                <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">Belum ada riwayat tugas.</p>
             </div>
          ) : (
            groupedTasks.map((group, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedTaskGroup(group)}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group flex gap-4"
              >
                  {group.latestTask.fotoSebelum ? (
                    <img src={group.latestTask.fotoSebelum} alt="Cover Tugas" className="w-20 h-24 object-cover rounded-xl shrink-0" />
                  ) : (
                    <div className="w-20 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                       <Camera size={24} />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                      {group.latestTask.status === 'Verified' ? (
                          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                 <CheckCircle2 size={10} /> Verified
                              </span>
                          </div>
                      ) : (
                          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                 <Clock size={10} /> {group.latestTask.status}
                              </span>
                          </div>
                      )}
                      <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight text-sm mb-2">{group.title}</h3>
                      <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 truncate">
                          <Clock size={12} /> {new Date(group.latestTask.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                  </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Attendance Modal */}
      {selectedAttendance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex justify-center items-end md:items-center p-4 sm:p-6 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden flex flex-col max-h-[85vh] mb-[80px] md:mb-0 pb-6 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
              <div className="bg-indigo-600 p-6 text-white relative">
                  <button onClick={() => setSelectedAttendance(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <X size={20} />
                  </button>
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Detail Absensi harian</p>
                  <h3 className="text-xl font-black">{new Date(selectedAttendance.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
              </div>

              {/* SUMMARY BAR (Sesuai Permintaan) */}
              {(selectedAttendance.totalWorkDuration || selectedAttendance.durasiIstirahat) && (
                  <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex gap-3 shrink-0">
                      {selectedAttendance.totalWorkDuration && (
                          <div className="flex-1 bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                  <Clock size={16} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Kerja</p>
                                  <p className="text-xs font-black text-emerald-700 truncate">{selectedAttendance.totalWorkDuration}</p>
                              </div>
                          </div>
                      )}
                      {selectedAttendance.durasiIstirahat && (
                          <div className="flex-1 bg-white p-3 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                                  <Clock size={16} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Istirahat</p>
                                  <p className="text-xs font-black text-amber-700 truncate">{selectedAttendance.durasiIstirahat}</p>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  <div className={`p-4 rounded-xl border flex items-center gap-4 relative transition-all ${selectedAttendance.hasMasuk ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAttendance.hasMasuk ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                          <p className={`font-bold ${selectedAttendance.hasMasuk ? 'text-indigo-900' : 'text-slate-500'}`}>Absen Masuk</p>
                          <p className={`text-[10px] font-bold ${selectedAttendance.hasMasuk ? 'text-indigo-400' : 'text-slate-400'}`}>
                              {selectedAttendance.timeMasuk ? new Date(selectedAttendance.timeMasuk).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}
                          </p>
                          <p className={`text-sm ${selectedAttendance.timeMasuk ? 'text-indigo-600 font-black' : 'text-slate-500'}`}>
                              {selectedAttendance.timeMasuk ? new Date(selectedAttendance.timeMasuk).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : 'Belum dilakukan'}
                          </p>
                      </div>
                      {renderAttendanceThumbnails(selectedAttendance.dataMasuk, 'Absen Masuk', 'border-indigo-200 hover:border-indigo-400')}
                  </div>
                  
                  <div className={`p-4 rounded-xl border flex items-center gap-4 relative transition-all ${selectedAttendance.hasIstirahat ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAttendance.hasIstirahat ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                          <p className={`font-bold ${selectedAttendance.hasIstirahat ? 'text-amber-900' : 'text-slate-500'}`}>Mulai Istirahat</p>
                          <p className={`text-[10px] font-bold ${selectedAttendance.hasIstirahat ? 'text-amber-400' : 'text-slate-400'}`}>
                              {selectedAttendance.timeIstirahat ? new Date(selectedAttendance.timeIstirahat).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}
                          </p>
                          <p className={`text-sm ${selectedAttendance.timeIstirahat ? 'text-amber-600 font-black' : 'text-slate-500'}`}>
                              {selectedAttendance.timeIstirahat ? new Date(selectedAttendance.timeIstirahat).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : 'Belum dilakukan'}
                          </p>
                      </div>
                      {renderAttendanceThumbnails(selectedAttendance.dataIstirahat, 'Mulai Istirahat', 'border-amber-200 hover:border-amber-400')}
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center gap-4 relative transition-all ${selectedAttendance.hasSelesaiIstirahat ? 'bg-cyan-50 border-cyan-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAttendance.hasSelesaiIstirahat ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                          <p className={`font-bold ${selectedAttendance.hasSelesaiIstirahat ? 'text-cyan-900' : 'text-slate-500'} mb-0.5`}>Selesai Istirahat</p>
                          <div className="flex flex-col items-start gap-1">
                              <p className={`text-[10px] font-bold ${selectedAttendance.hasSelesaiIstirahat ? 'text-cyan-400' : 'text-slate-400'}`}>
                                  {selectedAttendance.timeSelesaiIstirahat ? new Date(selectedAttendance.timeSelesaiIstirahat).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}
                              </p>
                              <p className={`text-sm ${selectedAttendance.timeSelesaiIstirahat ? 'text-cyan-600 font-black' : 'text-slate-500'}`}>
                                  {selectedAttendance.timeSelesaiIstirahat ? new Date(selectedAttendance.timeSelesaiIstirahat).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : 'Belum dilakukan'}
                              </p>
                              {selectedAttendance.durasiIstirahat && <span className="bg-cyan-100 text-cyan-800 text-[10px] px-2 py-0.5 rounded-md font-bold inline-block leading-tight">{selectedAttendance.durasiIstirahat}</span>}
                          </div>
                      </div>
                      {renderAttendanceThumbnails(selectedAttendance.dataSelesaiIstirahat, 'Selesai Istirahat', 'border-cyan-200 hover:border-cyan-400')}
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center gap-4 relative transition-all ${selectedAttendance.hasPulang ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAttendance.hasPulang ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                          <p className={`font-bold ${selectedAttendance.hasPulang ? 'text-emerald-900' : 'text-slate-500'}`}>Absen Pulang</p>
                          <p className={`text-[10px] font-bold ${selectedAttendance.hasPulang ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {selectedAttendance.timePulang ? new Date(selectedAttendance.timePulang).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}
                          </p>
                          <div className="flex flex-col items-start gap-1">
                              <p className={`text-sm ${selectedAttendance.timePulang ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>
                                  {selectedAttendance.timePulang ? new Date(selectedAttendance.timePulang).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':') : 'Belum dilakukan'}
                              </p>
                              {selectedAttendance.totalWorkDuration && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest inline-block border border-emerald-200 shadow-sm animate-pulse">
                                      Total Jam Kerja: {selectedAttendance.totalWorkDuration}
                                  </span>
                              )}
                          </div>
                      </div>
                      {renderAttendanceThumbnails(selectedAttendance.dataPulang, 'Absen Pulang', 'border-emerald-200 hover:border-emerald-400')}
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Task Group Modal */}
      {selectedTaskGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex justify-center items-end md:items-center p-4 sm:p-6 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden flex flex-col max-h-[85vh] mb-[80px] md:mb-0 pb-6 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 relative">
              <div className="bg-orange-600 p-6 text-white shrink-0">
                  <button onClick={() => setSelectedTaskGroup(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10">
                      <X size={20} />
                  </button>
                  <p className="text-orange-200 text-[10px] font-black uppercase tracking-widest mb-1">Detail Eksekusi Tugas</p>
                  <h3 className="text-xl font-black leading-tight pr-10">{selectedTaskGroup.title}</h3>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 space-y-6">
                 
                 <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm">Deskripsi Tugas</h4>
                    <p className="text-sm text-slate-500 font-medium mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm leading-relaxed">{selectedTaskGroup.latestTask.deskripsi || 'Tidak ada deskripsi spesifik.'}</p>
                    
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full shrink-0 flex items-center justify-center"><Clock size={16} /></div>
                       <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Waktu Terakhir Diperbarui</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{new Date(selectedTaskGroup.latestTask.timestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}</p>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                       <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full shrink-0 flex items-center justify-center"><MapPin size={16} /></div>
                       <div className="min-w-0 text-left w-full">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lokasi & GPS (Terakhir)</p>
                          <p className="text-xs font-bold text-slate-700 truncate mb-1">Lat: {selectedTaskGroup.latestTask.latitude}, Lng: {selectedTaskGroup.latestTask.longitude}</p>
                          <p className="text-[11px] font-medium text-slate-500 whitespace-normal leading-tight">{selectedTaskGroup.latestTask.lokasi}</p>
                       </div>
                    </div>

                    {selectedTaskGroup.latestTask.latitude && (
                        <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm h-32 w-full overflow-hidden shrink-0 mt-3 relative">
                            <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl ring-1 ring-inset ring-black/5" />
                            <LocationMiniMap lat={selectedTaskGroup.latestTask.latitude} lng={selectedTaskGroup.latestTask.longitude} />
                        </div>
                    )}
                 </div>
                 
                 <div className="space-y-4 border-t border-slate-200 pt-6">
                    <h4 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                         <Camera size={18} className="text-orange-500" /> Bukti Foto Pelaksanaan
                    </h4>
                        {(() => {
                            const getLogInfo = (status: string) => {
                                return selectedTaskGroup.latestTask.logs?.find((l: any) => 
                                    (status === 'Sebelum' && (l.status === 'Laporan Baru' || l.note?.includes('Sebelum'))) ||
                                    (status === 'Sedang' && (l.status === 'Sedang Dikerjakan' || l.note?.includes('Sedang'))) ||
                                    (status === 'Selesai' && (l.status === 'Menunggu Verifikasi' || l.note?.includes('Selesai')))
                                );
                            };

                            const renderPhotoMeta = (statusLabel: string) => {
                                const log = getLogInfo(statusLabel);
                                const time = log ? new Date(log.timestamp) : new Date(selectedTaskGroup.latestTask.timestamp);
                                return (
                                    <div className="mt-3 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Calendar size={12} className="text-indigo-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{time.toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Clock size={12} className="text-indigo-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-1.5 pt-2 border-t border-slate-200">
                                            <MapPinned size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black text-emerald-700 uppercase leading-none mb-1">
                                                    GPS: {selectedTaskGroup.latestTask.latitude.toFixed(6)}, {selectedTaskGroup.latestTask.longitude.toFixed(6)}
                                                </p>
                                                <p className="text-[10px] text-slate-600 font-medium leading-tight line-clamp-2 italic">
                                                    "{selectedTaskGroup.latestTask.lokasi}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            };

                            return (
                                <div className="grid grid-cols-1 gap-6">
                                    {selectedTaskGroup.latestTask.fotoSebelum && (
                                       <div className="bg-white border rounded-2xl overflow-hidden p-4 shadow-sm border-slate-200">
                                          <p className="text-sm font-black uppercase tracking-widest mb-3 text-rose-500 flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Foto Sebelum
                                          </p>
                                          <div 
                                              className="w-full h-48 rounded-xl border border-slate-100 overflow-hidden relative group cursor-pointer"
                                              onClick={() => setFullscreenImage(selectedTaskGroup.latestTask.fotoSebelum)}
                                          >
                                              <img src={selectedTaskGroup.latestTask.fotoSebelum} alt="Sebelum" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                   <Camera size={32} className="text-white drop-shadow-lg" />
                                              </div>
                                          </div>
                                          {renderPhotoMeta('Sebelum')}
                                       </div>
                                    )}
                                    {selectedTaskGroup.latestTask.fotoSedang && (
                                       <div className="bg-white border rounded-2xl overflow-hidden p-4 shadow-sm border-slate-200">
                                          <p className="text-sm font-black uppercase tracking-widest mb-3 text-orange-500 flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Foto Sedang Mengerjakan
                                          </p>
                                          <div 
                                              className="w-full h-48 rounded-xl border border-slate-100 overflow-hidden relative group cursor-pointer"
                                              onClick={() => setFullscreenImage(selectedTaskGroup.latestTask.fotoSedang)}
                                          >
                                              <img src={selectedTaskGroup.latestTask.fotoSedang} alt="Sedang" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                   <Camera size={32} className="text-white drop-shadow-lg" />
                                              </div>
                                          </div>
                                          {renderPhotoMeta('Sedang')}
                                       </div>
                                    )}
                                    {selectedTaskGroup.latestTask.fotoSesudah && (
                                       <div className="bg-white border rounded-2xl overflow-hidden p-4 shadow-sm border-slate-200">
                                          <p className="text-sm font-black uppercase tracking-widest mb-3 text-emerald-500 flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Foto Sesudah
                                          </p>
                                          <div 
                                              className="w-full h-48 rounded-xl border border-slate-100 overflow-hidden relative group cursor-pointer"
                                              onClick={() => setFullscreenImage(selectedTaskGroup.latestTask.fotoSesudah)}
                                          >
                                              <img src={selectedTaskGroup.latestTask.fotoSesudah} alt="Sesudah" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                   <Camera size={32} className="text-white drop-shadow-lg" />
                                              </div>
                                          </div>
                                          {renderPhotoMeta('Selesai')}
                                       </div>
                                    )}
                                </div>
                            );
                         })()}
                 </div>
              </div>
           </div>
        </div>
      )}

       {/* Fullscreen Map Preview */}
       {fullscreenMap && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[600] flex justify-center items-center p-4 sm:p-6 animate-in fade-in duration-200" onClick={() => setFullscreenMap(null)}>
            <div className="bg-white w-full max-w-3xl h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col" onClick={e => e.stopPropagation()}>
               <div className="flex items-center gap-4 p-5 border-b border-slate-100 bg-white z-10 shrink-0 shadow-sm relative">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                     <MapPin size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <h3 className="font-black text-slate-800 text-xl leading-tight">Detail Lokasi GPS</h3>
                     <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">
                        LAT: {fullscreenMap.lat.toFixed(6)} <span className="mx-1.5 text-slate-300">|</span> LNG: {fullscreenMap.lng.toFixed(6)}
                     </p>
                  </div>
                  <button onClick={() => setFullscreenMap(null)} className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors shrink-0 border border-slate-100 shadow-sm">
                      <X size={20} />
                  </button>
               </div>
               <div className="flex-1 relative bg-slate-50">
                  <div className="absolute inset-0">
                     <LocationMiniMap lat={fullscreenMap.lat} lng={fullscreenMap.lng} />
                  </div>
               </div>
            </div>
         </div>
       )}

       {/* Fullscreen Image Preview */}
       {fullscreenImage && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex justify-center items-center p-4 animate-in fade-in duration-200" onClick={() => setFullscreenImage(null)}>
            <div className="relative w-full max-w-3xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white/20" onClick={e => e.stopPropagation()}>
               <img src={fullscreenImage} alt="Preview Foto" className="w-full h-full object-contain bg-black/80" />
               <button onClick={() => setFullscreenImage(null)} className="absolute top-6 right-6 p-3 bg-black/60 text-white hover:bg-black/80 rounded-full transition-colors backdrop-blur-md border border-white/20 shadow-xl">
                   <X size={24} />
               </button>
            </div>
         </div>
       )}
    </div>
  );
};

export default PPSUMyReportsSection;
