import React, { useState, useMemo } from 'react';
import { AttendanceRecord, TugasPPSU, User, AttendanceType, ReportStatus, Staff } from '../types';
import { Camera, ClipboardList, MapPin, Search, Calendar, Filter, FileText, ChevronRight, Eye, CheckCircle2, X } from 'lucide-react';
import { apiService } from '../services/api';

interface AdminReportsSectionProps {
   mode: 'ABSEN' | 'TUGAS' | 'FULL_REPORT';
   attendanceRecords: AttendanceRecord[];
   tugasList: TugasPPSU[];
   onUpdateTugas?: (updated: TugasPPSU) => void;
   user: User;
   users: User[];
   staff: Staff[];
   settings: any;
   schedules: any[];
}

const AdminReportsSection: React.FC<AdminReportsSectionProps> = ({ mode, attendanceRecords, tugasList, onUpdateTugas, user, users, staff, settings, schedules }) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [filterType, setFilterType] = useState<string>('ALL');
   const [filterZona, setFilterZona] = useState<string>('ALL');
   const [filterShift, setFilterShift] = useState<string>('ALL');
   const [filterDate, setFilterDate] = useState<string>('');
   const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
   const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
   const [selectedTask, setSelectedTask] = useState<TugasPPSU | null>(null);
   const [showMapModal, setShowMapModal] = useState<{ lat: number; lng: number; address: string } | null>(null);
   const [attendanceRequests, setAttendanceRequests] = useState<any[]>([]);
   const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'REQUESTS'>('LIST');

   const fetchRequests = async () => {
      try {
         const data = await apiService.getAttendanceRequests();
         setAttendanceRequests(data || []);
      } catch (err) {
         console.error("Failed to fetch attendance requests", err);
      }
   };

   React.useEffect(() => {
      if (mode === 'ABSEN') {
         fetchRequests();
      }
   }, [mode]);

   const handleUpdateRequestStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
      try {
          await apiService.updateAttendanceRequest(id, {
              status,
              approved_by: user.name || user.username
          });
          alert(`Permintaan berhasil ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}!`);
          fetchRequests();
      } catch (err) {
          alert("Gagal mengupdate status permintaan.");
      }
   };

   const getPPSUID = (nik?: string) => {
      if (!nik) return '-';
      const u = users.find(usr => usr.nik === nik);
      return u ? u.username.toUpperCase() : nik;
   };

   const getPPSUAvatar = (nik?: string) => {
      if (!nik) return null;
      const s = staff.find(st => st.nik === nik);
      return s ? s.fotoProfile : null;
   };

   const handleVerifyTask = async (task: TugasPPSU) => {
      if (!['Administrator', 'Pimpinan'].includes(user.role)) {
          alert('Hanya Pimpinan atau Administrator yang memiliki hak akses untuk memverifikasi tugas.');
          return;
      }
      
      try {
          const timestampStr = new Date().toISOString();
          const updated: TugasPPSU = { 
             ...task, 
             status: ReportStatus.VERIFIED,
             logs: [
                ...task.logs,
                {
                   status: ReportStatus.VERIFIED,
                   timestamp: timestampStr,
                   actor: user.name || user.username,
                   note: 'Tugas telah diverifikasi.'
                }
             ]
          };
          
          await apiService.updateTugasPPSU(updated);
          if (onUpdateTugas) onUpdateTugas(updated);
          setSelectedTask(updated);
          alert('Tugas berhasil diverifikasi!');
      } catch (err: any) {
          alert('Gagal melakukan verifikasi: ' + err.message);
      }
   };

   const filteredAttendance = attendanceRecords.filter(rec => {
      const name = rec.userName || '';
      const nik = rec.userNik || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || nik.includes(searchTerm);
      const matchesType = filterType === 'ALL' || rec.type === filterType;
      const recDate = new Date(rec.timestamp).toISOString().split('T')[0];
      const matchesDate = !filterDate || recDate === filterDate;
      
      // Get Day name for schedule matching
      const dayName = new Date(rec.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      const staffMember = staff.find(s => s.nik === rec.userNik);
      const schedule = schedules.find(s => s.staff_id === staffMember?.id && s.day === dayName);

      const matchesZona = filterZona === 'ALL' || (schedule && schedule.area === filterZona);
      const matchesShift = filterShift === 'ALL' || (schedule && schedule.shift === filterShift);

      return matchesSearch && matchesType && matchesDate && matchesZona && matchesShift;
   });

   const groupedTasks = useMemo(() => {
      const groups = new Map();
      tugasList.forEach(t => {
         const date = new Date(t.timestamp).toISOString().split('T')[0];
         const key = `${t.reporterNik}-${t.judulTugas}-${date}`;
         if (!groups.has(key)) {
            groups.set(key, t);
         } else {
            const current = groups.get(key);
            if (new Date(t.timestamp) > new Date(current.timestamp)) {
               groups.set(key, t);
            }
         }
      });
      return Array.from(groups.values()) as TugasPPSU[];
   }, [tugasList]);

   const filteredTasks = groupedTasks.filter(t => {
      const reporter = t.reporterName || '';
      const title = t.judulTugas || '';
      const ppsuId = getPPSUID(t.reporterNik);
      
      const matchesSearch = reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
         title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         ppsuId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const taskDate = new Date(t.timestamp).toISOString().split('T')[0];
      const matchesDate = !filterDate || taskDate === filterDate;
      
      const dayName = new Date(t.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      const staffMember = staff.find(s => s.nik === t.reporterNik);
      const schedule = schedules.find(s => s.staff_id === staffMember?.id && s.day === dayName);

      const matchesZona = filterZona === 'ALL' || (schedule && schedule.area === filterZona);
      const matchesShift = filterShift === 'ALL' || (schedule && schedule.shift === filterShift);

      return matchesSearch && matchesDate && matchesZona && matchesShift;
   });

   const renderAttendanceView = () => (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-black text-slate-800">Data Absen PPSU</h2>
               <p className="text-slate-500 text-sm">Rekapitulasi kehadiran personil pasukan orange hari ini.</p>
            </div>
            
            <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0">
               <button 
                  onClick={() => setActiveSubTab('LIST')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'LIST' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Tabel Absensi
               </button>
               <button 
                  onClick={() => setActiveSubTab('REQUESTS')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeSubTab === 'REQUESTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  Request Buka Absen
                  {attendanceRequests.filter(r => r.status === 'PENDING').length > 0 && (
                     <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full animate-bounce border-2 border-white">
                        {attendanceRequests.filter(r => r.status === 'PENDING').length}
                     </span>
                  )}
               </button>
            </div>
         </div>

         <div className="flex flex-wrap gap-2 items-center">
               <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                     type="date"
                     className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-44 font-bold"
                     value={filterDate}
                     onChange={(e) => setFilterDate(e.target.value)}
                  />
               </div>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                     type="text"
                     placeholder="Cari Nama / ID..."
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

                <select
                   className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                   value={filterZona}
                   onChange={(e) => setFilterZona(e.target.value)}
                >
                   <option value="ALL">Semua Zona</option>
                   {settings.zonaList && settings.zonaList.map((z: string, idx: number) => (
                      <option key={idx} value={z}>{z}</option>
                   ))}
                </select>

                <select
                   className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                   value={filterShift}
                   onChange={(e) => setFilterShift(e.target.value)}
                >
                   <option value="ALL">Semua Shift</option>
                   {settings.shiftConfig && settings.shiftConfig.map((s: any, idx: number) => (
                      <option key={idx} value={s.name}>{s.name}</option>
                   ))}
                </select>
              </div>

         {activeSubTab === 'LIST' ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
               {/* Desktop Table View */}
               <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                           <th className="py-4 px-4 text-center w-16">No</th>
                           <th className="py-4 px-4">Nama Personil</th>
                           <th className="py-4 px-4 text-center">Jenis Absen</th>
                           <th className="py-4 px-4 text-center">Zona</th>
                           <th className="py-4 px-4 text-center">Shift</th>
                           <th className="py-4 px-4 text-center">Tanggal</th>
                           <th className="py-4 px-4 text-center">Waktu</th>
                           <th className="py-4 px-4">Lokasi & Alamat</th>
                           <th className="py-4 px-4 text-center">Foto</th>
                           <th className="py-4 px-4 text-center">Detail</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {filteredAttendance.length === 0 ? (
                           <tr>
                              <td colSpan={10} className="py-20 text-center text-slate-400">
                                 <Camera size={48} className="mx-auto mb-3 opacity-20" />
                                 <p className="font-bold uppercase tracking-widest text-xs">Belum Ada Data Absensi</p>
                              </td>
                           </tr>
                        ) : (
                           filteredAttendance.map((rec, idx) => (
                              <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                                 <td className="py-4 px-4 text-center font-black text-slate-300 group-hover:text-indigo-400 transition-colors">{idx + 1}</td>
                                 <td className="py-4 px-4">
                                    <p className="font-black text-slate-800 uppercase text-xs tracking-tight">{rec.userName}</p>
                                    <p className="text-[10px] font-bold font-mono text-slate-400">NIK: {rec.userNik}</p>
                                 </td>
                                 <td className="py-4 px-4 text-center">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${rec.type === 'Absen Masuk' ? 'bg-emerald-50 text-emerald-600' :
                                          rec.type === 'Absen Pulang' ? 'bg-rose-50 text-rose-600' :
                                             rec.type === 'Istirahat' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                       }`}>
                                       {rec.type}
                                    </span>
                                 </td>
                                 <td className="py-4 px-4 text-center">
                                    {(() => {
                                       const dayName = new Date(rec.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
                                       const staffMember = staff.find(s => s.nik === rec.userNik);
                                       const schedule = schedules.find(s => s.staff_id === staffMember?.id && s.day === dayName);
                                       return <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-1 rounded-md">{schedule ? schedule.area : (rec as any).jadwal_id?.startsWith('REQ') ? 'Zona Terbuka (Manual)' : '-'}</span>;
                                    })()}
                                 </td>
                                 <td className="py-4 px-4 text-center">
                                    {(() => {
                                       const dayName = new Date(rec.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
                                       const staffMember = staff.find(s => s.nik === rec.userNik);
                                       const schedule = schedules.find(s => s.staff_id === staffMember?.id && s.day === dayName);
                                       return <span className="text-[10px] font-black text-indigo-600 uppercase">{schedule ? schedule.shift : (rec as any).jadwal_id?.startsWith('REQ') ? 'MANUAL' : '-'}</span>;
                                    })()}
                                 </td>
                                 <td className="py-4 px-4 text-center font-bold text-slate-500 text-xs text-nowrap">
                                    {new Date(rec.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                 </td>
                                 <td className="py-4 px-4 text-center font-black text-slate-800 text-xs">
                                    {new Date(rec.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
                                 </td>
                                 <td className="py-4 px-4 max-w-xs">
                                    <div className="flex items-start gap-2">
                                       <button 
                                          onClick={() => setShowMapModal({ lat: rec.latitude, lng: rec.longitude, address: rec.address })}
                                          className="text-indigo-500 hover:text-indigo-700 p-1.5 hover:bg-indigo-50 rounded-lg transition-all shrink-0"
                                       >
                                          <MapPin size={16} />
                                       </button>
                                       <div>
                                          <p className="text-[10px] font-mono font-bold text-indigo-500 mb-0.5">{rec.latitude.toFixed(6)}, {rec.longitude.toFixed(6)}</p>
                                          <p className="text-[10px] text-slate-500 leading-normal line-clamp-2" title={rec.address}>{rec.address}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="py-4 px-6 text-center">
                                    <button
                                       onClick={() => setSelectedPhoto(rec.photo)}
                                       className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-indigo-500 transition-all mx-auto shadow-sm"
                                    >
                                       <img src={rec.photo} className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center text-white">
                                          <Eye size={14} />
                                       </div>
                                    </button>
                                 </td>
                                 <td className="py-4 px-6 text-center">
                                    <button
                                       onClick={() => setSelectedAttendance(rec)}
                                       className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all border border-indigo-100 shadow-sm"
                                    >
                                       <FileText size={18} />
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
                </div>

                {/* Mobile Card View (Attendance) */}
                <div className="lg:hidden divide-y divide-slate-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {filteredAttendance.map((rec) => (
                    <div key={rec.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={rec.photo} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm" onClick={() => setSelectedPhoto(rec.photo)} />
                          <div>
                            <p className="font-black text-slate-800 uppercase text-xs">{rec.userName}</p>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              rec.type === 'Absen Masuk' ? 'bg-emerald-50 text-emerald-600' :
                              rec.type === 'Absen Pulang' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {rec.type}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => setSelectedAttendance(rec)} className="p-2 text-indigo-500 bg-indigo-50 rounded-lg">
                          <FileText size={18} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-slate-400 font-bold uppercase mb-0.5">Waktu</p>
                          <p className="text-slate-700 font-black">{new Date(rec.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-slate-400 font-bold uppercase mb-0.5">ID</p>
                          <p className="text-slate-700 font-black">{getPPSUID(rec.userNik)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                        <MapPin size={14} className="text-rose-400 shrink-0" />
                        <span className="line-clamp-1">{rec.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
         ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                           <th className="py-4 px-4 text-center w-16">No</th>
                           <th className="py-4 px-4">Nama Personil</th>
                           <th className="py-4 px-4 text-center">Tanggal Request</th>
                           <th className="py-4 px-4 text-center">Created At</th>
                           <th className="py-4 px-4 text-center">Status</th>
                           <th className="py-4 px-4 text-center">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {attendanceRequests.length === 0 ? (
                           <tr>
                              <td colSpan={6} className="py-20 text-center text-slate-400">
                                 <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                 <p className="font-bold uppercase tracking-widest text-xs">Tidak Ada Permintaan Buka Absen</p>
                              </td>
                           </tr>
                        ) : (
                           attendanceRequests.map((req, idx) => (
                              <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                 <td className="py-4 px-4 text-center font-black text-slate-300">{idx + 1}</td>
                                 <td className="py-4 px-4">
                                    <p className="font-black text-slate-800 uppercase text-xs">{req.staff_name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">NIK: {req.nik} • ID: {getPPSUID(req.nik)}</p>
                                 </td>
                                 <td className="py-4 px-4 text-center font-bold text-slate-600">
                                    {new Date(req.request_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                 </td>
                                 <td className="py-4 px-4 text-center text-xs text-slate-400">
                                    {new Date(req.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                 </td>
                                 <td className="py-4 px-4 text-center uppercase tracking-widest text-[10px] font-black">
                                    <span className={`px-3 py-1 rounded-full ${
                                       req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                       req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                    }`}>
                                       {req.status}
                                    </span>
                                 </td>
                                 <td className="py-4 px-4 text-center">
                                    {req.status === 'PENDING' && (
                                       <div className="flex items-center justify-center gap-2">
                                          <button 
                                             onClick={() => handleUpdateRequestStatus(req.id, 'APPROVED')}
                                             className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all"
                                          >
                                             Approve
                                          </button>
                                          <button 
                                             onClick={() => handleUpdateRequestStatus(req.id, 'REJECTED')}
                                             className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all"
                                          >
                                             Reject
                                          </button>
                                       </div>
                                    )}
                                    {req.status !== 'PENDING' && (
                                       <span className="text-[9px] font-bold text-slate-400">Oleh: {req.approved_by || '-'}</span>
                                    )}
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
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
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                     type="date"
                     className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-44 font-bold"
                     value={filterDate}
                     onChange={(e) => setFilterDate(e.target.value)}
                  />
               </div>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                     type="text"
                     placeholder="Nama / ID / Tugas..."
                     className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
                <select
                   className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                   value={filterZona}
                   onChange={(e) => setFilterZona(e.target.value)}
                >
                   <option value="ALL">Semua Zona</option>
                   {settings.zonaList && settings.zonaList.map((z: any, idx: number) => (
                      <option key={idx} value={z}>{z}</option>
                   ))}
                </select>

                <select
                   className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                   value={filterShift}
                   onChange={(e) => setFilterShift(e.target.value)}
                >
                   <option value="ALL">Semua Shift</option>
                   {settings.shiftConfig && settings.shiftConfig.map((s: any, idx: number) => (
                      <option key={idx} value={s.name}>{s.name}</option>
                   ))}
                </select>
            </div>
         </div>

         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto custom-scrollbar">
               <table className="w-full text-left text-sm border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                        <th className="py-4 px-6 text-center w-16">No</th>
                        <th className="py-4 px-4">Tugas</th>
                        <th className="py-4 px-4">Petugas</th>
                        <th className="py-4 px-4 text-center">Zona</th>
                        <th className="py-4 px-4 text-center">Shift</th>
                        <th className="py-4 px-4">Alamat & Lokasi</th>
                        <th className="py-4 px-4">Waktu & Tanggal</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredTasks.length === 0 ? (
                        <tr>
                           <td colSpan={7} className="py-20 text-center text-slate-400">
                              <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
                              <p className="font-bold uppercase tracking-widest text-xs">Belum Ada Riwayat Tugas</p>
                           </td>
                        </tr>
                     ) : (
                        filteredTasks.map((t, idx) => (
                           <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-4 px-6 text-center font-black text-slate-300 group-hover:text-indigo-400 transition-colors">{idx + 1}</td>
                              <td className="py-4 px-4">
                                 <p className="font-black text-slate-800 text-xs tracking-tight line-clamp-1 uppercase">{t.judulTugas}</p>
                              </td>
                              <td className="py-4 px-4">
                                 <p className="font-bold text-slate-700 text-xs">{t.reporterName}</p>
                                 <p className="text-[9px] font-mono text-slate-400 font-bold">ID: {getPPSUID(t.reporterNik)}</p>
                              </td>
                               <td className="py-4 px-4 text-center">
                                  {(() => {
                                      const dayName = new Date(t.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
                                      const staffMember = staff.find(s => s.nik === t.reporterNik);
                                      const schedule = schedules.find(s => s.staff_id === staffMember?.id && s.day === dayName);
                                      return <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-1 rounded-md">{schedule ? schedule.area : '-'}</span>;
                                  })()}
                               </td>
                               <td className="py-4 px-4 text-center">
                                  {(() => {
                                      const dayName = new Date(t.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
                                      const staffMember = staff.find(s => s.nik === t.reporterNik);
                                      const schedule = schedules.find(s => s.staff_id === staffMember?.id && s.day === dayName);
                                      return <span className="text-[10px] font-black text-indigo-600 uppercase">{schedule ? schedule.shift : '-'}</span>;
                                  })()}
                               </td>
                              <td className="py-4 px-4 max-w-[250px]">
                                 <div className="flex items-start gap-2">
                                    <button 
                                       onClick={() => setShowMapModal({ lat: t.latitude, lng: t.longitude, address: t.lokasi })}
                                       className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all shadow-sm border border-rose-100 shrink-0"
                                       title="Buka Map"
                                    >
                                       <MapPin size={14} />
                                    </button>
                                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 font-medium" title={t.lokasi}>{t.lokasi}</p>
                                 </div>
                              </td>
                              <td className="py-4 px-4 font-bold text-slate-600 text-[10px]">
                                 {new Date(t.timestamp).toLocaleDateString('id-ID')} <br />
                                 <span className="text-[9px] text-slate-400">{new Date(t.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                 <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${t.status === ReportStatus.COMPLETED || t.status === ReportStatus.VERIFIED ? 'bg-emerald-500 text-white' :
                                       t.status === ReportStatus.VERIFICATION ? 'bg-orange-400 text-white' :
                                          'bg-slate-200 text-slate-600'
                                    }`}>
                                    {t.status === ReportStatus.VERIFICATION ? 'Pending' :
                                       t.status === ReportStatus.COMPLETED || t.status === ReportStatus.VERIFIED ? 'Verified' : t.status}
                                 </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                 <button
                                    onClick={() => setSelectedTask(t)}
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

             {/* Mobile Card View (Tasks) */}
             <div className="lg:hidden divide-y divide-slate-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
               {filteredTasks.map((t) => (
                 <div key={t.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <ClipboardList size={20} />
                         </div>
                         <div className="min-w-0">
                            <p className="font-black text-slate-800 text-xs uppercase truncate">{t.judulTugas}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase truncate line-clamp-1">{t.reporterName}</p>
                         </div>
                      </div>
                      <button onClick={() => setSelectedTask(t)} className="p-2 text-indigo-500 bg-indigo-50 rounded-lg shrink-0">
                        <Eye size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                       <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                         t.status === ReportStatus.VERIFIED || t.status === ReportStatus.COMPLETED ? 'bg-emerald-500 text-white' : 'bg-orange-400 text-white'
                       }`}>
                         {t.status === ReportStatus.VERIFICATION ? 'Pending' : t.status}
                       </span>
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                          <Calendar size={12} />
                          {new Date(t.timestamp).toLocaleDateString('id-ID', {day: '2-digit', month: 'short' })}
                       </div>
                    </div>
                 </div>
               ))}
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
                        {tugasList.slice(0, 3).map(t => (
                           <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                    <FileText size={14} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-700 line-clamp-1">{t.judulTugas}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{t.kategori}</p>
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
                  <div className="bg-indigo-600 p-8 text-white flex items-center justify-between shrink-0">
                     <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full border border-white/20 mb-3 inline-block">Detail Tugas PPSU</span>
                        <div className="flex items-center gap-6">
                           <h2 className="text-3xl font-black uppercase leading-tight">{selectedTask.judulTugas}</h2>
                           
                           {/* Staff Info in Header */}
                           <div className="flex items-center gap-3 bg-white/10 p-2 pr-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                              {getPPSUAvatar(selectedTask.reporterNik) ? (
                                 <img src={getPPSUAvatar(selectedTask.reporterNik)!} className="w-10 h-10 rounded-xl object-cover border border-white/20" />
                              ) : (
                                 <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-black uppercase shadow-lg">
                                    {selectedTask.reporterName.charAt(0)}
                                 </div>
                              )}
                              <div>
                                 <p className="font-black text-white text-xs uppercase leading-none mb-1">{selectedTask.reporterName}</p>
                                 <p className="text-[9px] font-bold text-white/50">ID PPSU: {getPPSUID(selectedTask.reporterNik)}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/20 rounded-full transition-all shrink-0 ml-4">
                        <ChevronRight size={24} className="rotate-45" />
                     </button>
                  </div>

                  <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                               <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase">Selesai Pekerjaan</p>
                                  {(selectedTask.fotoSesudah || (selectedTask as any).photo_url) ? (
                                     <img src={selectedTask.fotoSesudah || (selectedTask as any).photo_url} className="w-full h-48 object-cover rounded-3xl border border-slate-100 shadow-sm" />
                                  ) : (
                                     <div className="w-full h-48 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 border border-dashed border-slate-200">
                                        <Camera size={48} />
                                     </div>
                                  )}
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <p className="text-[10px] font-black text-slate-400 uppercase">Sebelum</p>
                                     {selectedTask.fotoSebelum ? (
                                        <img src={selectedTask.fotoSebelum} className="w-full h-32 object-cover rounded-2xl border border-slate-100 shadow-sm" />
                                     ) : (
                                        <div className="w-full h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-dashed border-slate-200">
                                           <Camera size={24} />
                                        </div>
                                     )}
                                  </div>
                                  <div className="space-y-2">
                                     <p className="text-[10px] font-black text-slate-400 uppercase">Sedang</p>
                                     {selectedTask.fotoSedang ? (
                                        <img src={selectedTask.fotoSedang} className="w-full h-32 object-cover rounded-2xl border border-slate-100 shadow-sm" />
                                     ) : (
                                        <div className="w-full h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-dashed border-slate-200">
                                           <Camera size={24} />
                                        </div>
                                     )}
                                  </div>
                               </div>
                            </div>
                         </div>

                        <div className="space-y-6">


                           <section>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi & Catatan</h4>
                              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                                 "{selectedTask.deskripsi || 'Tidak ada catatan tambahan.'}"
                              </p>
                           </section>

                           <section>
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lokasi & Kordinat GPS</h4>
                               <div className="mb-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                  <button 
                                     onClick={() => setShowMapModal({ lat: selectedTask.latitude, lng: selectedTask.longitude, address: selectedTask.lokasi })}
                                     className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
                                     title="Lihat Map"
                                  >
                                     <MapPin size={24} />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                     <p className="text-[10px] font-black text-slate-400 uppercase">Input GPS</p>
                                     <p className="text-xs font-mono font-bold text-slate-800 line-clamp-1">{selectedTask.latitude}, {selectedTask.longitude}</p>
                                  </div>
                               </div>
                               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 font-bold leading-relaxed">
                                  {selectedTask.lokasi}
                               </div>
                            </section>

                           <section>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Saat Ini</h4>
                              <div className={`p-4 rounded-2xl border flex items-center justify-between ${selectedTask.status === ReportStatus.VERIFIED || selectedTask.status === ReportStatus.COMPLETED ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-orange-50 border-orange-100 text-orange-700'
                                 }`}>
                                 <span className="text-sm font-black uppercase tracking-widest">{selectedTask.status === ReportStatus.VERIFICATION ? 'Pending' : selectedTask.status}</span>
                                 <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                              </div>
                           </section>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                     <button onClick={() => setSelectedTask(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase text-xs tracking-widest">Tutup</button>
                     
                     {selectedTask.status !== ReportStatus.VERIFIED && selectedTask.status !== ReportStatus.COMPLETED && (
                        <button 
                           onClick={() => handleVerifyTask(selectedTask)}
                           className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 uppercase text-xs tracking-widest"
                        >
                           Verifikasi Tugas
                        </button>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Attendance Detail Modal */}
         {selectedAttendance && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6">
               <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col">
                  <div className="bg-indigo-600 p-8 text-white flex justify-between items-start shrink-0">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full border border-white/20 mb-3 inline-block">Detail Absensi Personil</span>
                        <h2 className="text-2xl font-black uppercase leading-tight">{selectedAttendance.userName}</h2>
                        <p className="text-indigo-200 text-xs font-bold mt-1">NIK: {selectedAttendance.userNik}</p>
                     </div>
                     <button onClick={() => setSelectedAttendance(null)} className="p-2 hover:bg-white/20 rounded-full transition-all">
                        <ChevronRight size={24} className="rotate-45" />
                     </button>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="flex gap-6">
                        <div className="w-40 h-48 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
                           <img src={selectedAttendance.photo} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-4">
                           <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipe Absensi</h4>
                              <span className={`text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider inline-block ${selectedAttendance.type === 'Absen Masuk' ? 'bg-emerald-50 text-emerald-600' :
                                 selectedAttendance.type === 'Absen Pulang' ? 'bg-rose-50 text-rose-600' :
                                 selectedAttendance.type === 'Istirahat' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                 {selectedAttendance.type}
                              </span>
                           </div>
                           <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu & Tanggal</h4>
                              <p className="text-sm font-black text-slate-800">
                                 {new Date(selectedAttendance.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                              <p className="text-lg font-black text-indigo-600 mt-0.5">
                                 {new Date(selectedAttendance.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
                              </p>
                           </div>
                        </div>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                           <button 
                              onClick={() => setShowMapModal({ lat: selectedAttendance.latitude, lng: selectedAttendance.longitude, address: selectedAttendance.address })}
                              className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 hover:bg-indigo-200 transition-all"
                           >
                              <MapPin size={16} />
                           </button>
                           <div className="min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Koordinat GPS</p>
                              <p className="text-xs font-mono font-bold text-slate-800">{selectedAttendance.latitude}, {selectedAttendance.longitude}</p>
                           </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                           <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{selectedAttendance.address}</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-100">
                     <button 
                        onClick={() => setSelectedAttendance(null)} 
                        className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase text-xs tracking-widest shadow-sm"
                     >
                        Tutup Detail
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Map Modal Popup */}
         {showMapModal && (
            <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
               <div className="bg-white rounded-3xl w-full max-w-4xl h-[70vh] flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
                            <MapPin size={24} />
                         </div>
                         <div className="min-w-0">
                            <h3 className="font-black text-slate-800 text-sm">{showMapModal.address.split(',')[0]}</h3>
                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-xs">{showMapModal.address}</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => setShowMapModal(null)}
                         className="p-2 bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-all"
                      >
                         <X size={20} /> 
                      </button>
                  </div>
                  <div className="flex-1 relative bg-slate-50">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        src={`https://maps.google.com/maps?q=${showMapModal.lat},${showMapModal.lng}&z=16&output=embed`}
                        title="Location Map"
                        className="grayscale hover:grayscale-0 transition-all duration-700"
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default AdminReportsSection;

