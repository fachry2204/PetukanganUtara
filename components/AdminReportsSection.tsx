import React, { useState } from 'react';
import { AttendanceRecord, Report, User, AttendanceType } from '../types';
import { Camera, ClipboardList, MapPin, Search, Calendar, Filter, FileText, ChevronRight, Eye } from 'lucide-react';

interface AdminReportsSectionProps {
  mode: 'ABSEN' | 'TUGAS' | 'FULL_REPORT';
  attendanceRecords: AttendanceRecord[];
  reports: Report[];
}

const AdminReportsSection: React.FC<AdminReportsSectionProps> = ({ mode, attendanceRecords, reports }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Report | null>(null);

  // Filter logic for Attendance
  const filteredAttendance = attendanceRecords.filter(rec => {
    const matchesSearch = rec.userName.toLowerCase().includes(searchTerm.toLowerCase()) || rec.userNik.includes(searchTerm);
    const matchesType = filterType === 'ALL' || rec.type === filterType;
    return matchesSearch && matchesType;
  });

  // Filter logic for Tasks
  const filteredTasks = reports.filter(rep => {
    const matchesSearch = rep.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         rep.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || rep.category === filterType;
    return matchesSearch && matchesType;
  });

  const renderAttendanceView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Data Absen PPSU</h2>
          <p className="text-slate-500 text-sm">Rekapitulasi kehadiran personil pasukan orange hari ini.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari Nama / NIK..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <select 
             className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
           >
              <option value="ALL">Semua Tipe</option>
              <option value="Absen Masuk">Masuk</option>
              <option value="Istirahat">Istirahat</option>
              <option value="Selesai Istirahat">Selesai Istirahat</option>
              <option value="Absen Pulang">Pulang</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <th className="py-4 px-6 text-center w-16">No</th>
                <th className="py-4 px-4">Nama Personil</th>
                <th className="py-4 px-4">Jenis Absen</th>
                <th className="py-4 px-4">Waktu</th>
                <th className="py-4 px-4">Lokasi & Alamat</th>
                <th className="py-4 px-6 text-center">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    <Camera size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Belum Ada Data Absensi</p>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-center font-black text-slate-300 group-hover:text-indigo-400 transition-colors">{idx + 1}</td>
                    <td className="py-4 px-4">
                       <p className="font-black text-slate-800 uppercase text-xs tracking-tight">{rec.userName}</p>
                       <p className="text-[10px] font-bold font-mono text-slate-400">NIK: {rec.userNik}</p>
                    </td>
                    <td className="py-4 px-4">
                       <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                         rec.type === 'Absen Masuk' ? 'bg-emerald-50 text-emerald-600' :
                         rec.type === 'Absen Pulang' ? 'bg-rose-50 text-rose-600' :
                         rec.type === 'Istirahat' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                       }`}>
                         {rec.type}
                       </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-600 text-xs">
                       {new Date(rec.timestamp).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                       <div className="flex items-start gap-2">
                          <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-mono font-bold text-indigo-500 mb-0.5">{rec.latitude.toFixed(6)}, {rec.longitude.toFixed(6)}</p>
                            <p className="text-[10px] text-slate-500 leading-normal line-clamp-2" title={rec.address}>{rec.address}</p>
                          </div>
                       </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <button 
                         onClick={() => setSelectedPhoto(rec.photo)}
                         className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-indigo-500 transition-all mx-auto"
                       >
                          <img src={rec.photo} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center text-white">
                             <Eye size={14} />
                          </div>
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTasksView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Data Tugas PPSU</h2>
          <p className="text-slate-500 text-sm">Monitor seluruh aktivitas dan laporan tugas personil di lapangan.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari Judul / Pelapor..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <select 
             className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
           >
              <option value="ALL">Semua Kategori</option>
              {Array.from(new Set(reports.map(r => r.category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <th className="py-4 px-6 text-center w-16">No</th>
                <th className="py-4 px-4">Tugas</th>
                <th className="py-4 px-4">Petugas</th>
                <th className="py-4 px-4">Alamat</th>
                <th className="py-4 px-4 text-center">Map</th>
                <th className="py-4 px-4">Waktu & Tanggal</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-slate-400">
                    <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Belum Ada Riwayat Tugas</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((rep, idx) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-center font-black text-slate-300 group-hover:text-indigo-400 transition-colors">{idx + 1}</td>
                    <td className="py-4 px-4">
                       <p className="font-black text-slate-800 text-xs tracking-tight line-clamp-1 uppercase">{rep.title}</p>
                       <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 uppercase tracking-widest">{rep.category}</span>
                    </td>
                    <td className="py-4 px-4">
                       <p className="font-bold text-slate-700 text-xs">{rep.reporterName}</p>
                       <p className="text-[9px] font-mono text-slate-400 font-bold">{rep.reporterNik}</p>
                    </td>
                    <td className="py-4 px-4 max-w-[200px]">
                       <p className="text-[10px] text-slate-500 leading-normal line-clamp-1 font-medium" title={rep.location}>{rep.location}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                       <button className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all shadow-sm border border-rose-100">
                          <MapPin size={16} />
                       </button>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-600 text-[10px]">
                       {new Date(rep.timestamp).toLocaleDateString('id-ID')} <br/>
                       <span className="text-[9px] text-slate-400">{new Date(rep.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="py-4 px-4">
                       <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                         rep.status === 'Laporan Selesai' || rep.status === 'Verified' ? 'bg-emerald-500 text-white' :
                         rep.status === 'Menunggu Verifikasi' || rep.status === 'Pending' ? 'bg-orange-400 text-white' :
                         'bg-slate-200 text-slate-600'
                       }`}>
                         {rep.status === 'Menunggu Verifikasi' || rep.status === 'Pending' ? 'Pending' : 
                          rep.status === 'Laporan Selesai' || rep.status === 'Verified' ? 'Verified' : rep.status}
                       </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <button 
                         onClick={() => setSelectedTask(rep)}
                         className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all border border-indigo-100 shadow-sm" title="Lihat Detail Tugas">
                          <Eye size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300">
      {mode === 'ABSEN' && renderAttendanceView()}
      {mode === 'TUGAS' && renderTasksView()}
      {mode === 'FULL_REPORT' && (
        <div className="space-y-8">
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                 <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Pusat Laporan & Statistik</h2>
                 <p className="opacity-80 font-medium">Rekapitulasi performa dan aktivitas PPSU secara menyeluruh.</p>
              </div>
              <FileText size={180} className="absolute -right-12 -bottom-12 opacity-10" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                       <Camera size={20} className="text-emerald-500" /> Absensi Harian Terbanyak
                    </h3>
                    <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Lihat Semua</button>
                 </div>
                 {/* Small Summary List */}
                 <div className="space-y-3">
                    {attendanceRecords.slice(0, 3).map(rec => (
                       <div key={rec.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                {rec.userName.charAt(0)}
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-700">{rec.userName}</p>
                                <p className="text-[10px] font-bold text-slate-400">{rec.type}</p>
                             </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400">{new Date(rec.timestamp).toLocaleTimeString('id-ID')}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                       <ClipboardList size={20} className="text-orange-500" /> Tugas Terbaru
                    </h3>
                    <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Lihat Semua</button>
                 </div>
                 <div className="space-y-3">
                    {reports.slice(0, 3).map(rep => (
                       <div key={rep.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <FileText size={14} />
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-700 line-clamp-1">{rep.title}</p>
                                <p className="text-[10px] font-bold text-slate-400">{rep.category}</p>
                             </div>
                          </div>
                          <ChevronRight size={14} className="text-slate-300" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={() => setSelectedPhoto(null)}>
           <div className="max-w-2xl w-full relative animate-in zoom-in duration-300">
              <img src={selectedPhoto} className="w-full h-auto rounded-[2rem] shadow-2xl border-4 border-white/20" />
              <button 
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-all backdrop-blur-md"
                onClick={() => setSelectedPhoto(null)}
              >
                <ChevronRight size={24} className="rotate-45" />
              </button>
           </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[90vh]">
               <div className="bg-indigo-600 p-8 text-white flex justify-between items-start shrink-0">
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full border border-white/20 mb-3 inline-block">Detail Tugas PPSU</span>
                     <h2 className="text-2xl font-black uppercase leading-tight">{selectedTask.title}</h2>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/20 rounded-full transition-all">
                     <ChevronRight size={24} className="rotate-45" />
                  </button>
               </div>
               
               <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        {selectedTask.photoUrl ? (
                           <img src={selectedTask.photoUrl} className="w-full h-64 object-cover rounded-3xl border border-slate-100 shadow-sm" />
                        ) : (
                           <div className="w-full h-64 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                              <Camera size={48} />
                           </div>
                        )}
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <MapPin size={20} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Input GPS</p>
                              <p className="text-xs font-mono font-bold text-slate-800 line-clamp-1">{selectedTask.latitude}, {selectedTask.longitude}</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <section>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Informasi Petugas</h4>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black uppercase">
                                 {selectedTask.reporterName.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-slate-800 text-sm uppercase">{selectedTask.reporterName}</p>
                                 <p className="text-xs font-bold text-slate-500">{selectedTask.reporterNik}</p>
                              </div>
                           </div>
                        </section>
                        
                        <section>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi & Catatan</h4>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              {selectedTask.description || 'Tidak ada catatan tambahan.'}
                           </p>
                        </section>

                        <section className="grid grid-cols-2 gap-4">
                           <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori</h4>
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">{selectedTask.category}</span>
                           </div>
                           <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prioritas</h4>
                              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">{selectedTask.priority}</span>
                           </div>
                        </section>

                        <section>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Saat Ini</h4>
                           <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                              selectedTask.status === 'Verified' || selectedTask.status === 'Laporan Selesai' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-orange-50 border-orange-100 text-orange-700'
                           }`}>
                              <span className="text-sm font-black uppercase tracking-widest">{selectedTask.status}</span>
                              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                           </div>
                        </section>
                     </div>
                  </div>
               </div>
               
               <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                  <button onClick={() => setSelectedTask(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase text-xs tracking-widest">Tutup</button>
                  <button className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 uppercase text-xs tracking-widest">Verifikasi Tugas</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminReportsSection;
