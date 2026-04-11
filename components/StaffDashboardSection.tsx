import React from 'react';
import { User, Staff, TugasPPSU, Announcement, DutyStatus } from '../types';
import { 
  UserCircle, 
  ShieldCheck, 
  Fingerprint, 
  Briefcase, 
  Mail, 
  Calendar, 
  Building2, 
  AlertTriangle, 
  MapPinned 
} from 'lucide-react';

interface StaffDashboardSectionProps {
  user: User;
  staff: Staff[];
  tugasList: TugasPPSU[];
  announcements: Announcement[];
  sosAlerts: any[];
  onResolveSos: (key: string) => void;
  onViewLocation: () => void;
}

const StaffDashboardSection: React.FC<StaffDashboardSectionProps> = ({ 
  user, 
  staff, 
  tugasList, 
  announcements, 
  sosAlerts, 
  onResolveSos, 
  onViewLocation 
}) => {
  const pendingTugas = tugasList.filter(r => r.status === 'Menunggu Verifikasi');
  const malePPSU = staff.filter(s => s.jenisKelamin === 'Laki-Laki').length;
  const femalePPSU = staff.filter(s => s.jenisKelamin === 'Perempuan').length;
  const recentAnnouncements = announcements.slice(0, 3); // show latest 3

  return (
    <div className="space-y-6">
      {/* Welcome & Profile Header */}
      <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5">
           <div className="shrink-0 relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 overflow-hidden flex items-center justify-center">
                 {user.avatar ? (
                   <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                 ) : (
                   <UserCircle size={40} className="text-white/50" />
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-indigo-600">
                 <ShieldCheck size={16} />
              </div>
           </div>
           
           <div className="flex-1 text-center md:text-left">
              <p className="text-indigo-200 font-medium uppercase tracking-[0.2em] text-[10px] mb-1">Profil {user.role}</p>
              <h2 className="text-xl md:text-xl font-bold mb-1">{user.name || user.username}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                 <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <Fingerprint size={16} className="text-indigo-300" />
                    <span className="text-xs font-bold font-mono tracking-wider">{user.nik || 'NIK Belum Teratur'}</span>
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <Briefcase size={16} className="text-indigo-300" />
                    <span className="text-xs font-bold uppercase tracking-widest">{user.role}</span>
                 </div>
                 {user.email && (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                       <Mail size={16} className="text-indigo-300" />
                       <span className="text-xs font-bold">{user.email}</span>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center shrink-0 hidden lg:block self-center">
              <Calendar size={24} className="mx-auto mb-2 text-indigo-200" />
              <p className="text-[10px] font-black uppercase opacity-60">Hari Ini</p>
              <p className="text-sm font-bold">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
           </div>
        </div>
        <Building2 className="absolute -right-16 -bottom-16 size-64 opacity-10" />
      </div>

      {/* SOS Active Cards */}
      {sosAlerts.length > 0 && (
         <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
            
            <h3 className="text-xl font-black text-red-700 mb-4 flex items-center gap-2 relative z-10">
              <AlertTriangle size={24} className="animate-pulse" /> Petugas Dalam Bahaya!
              <span className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold ml-auto shadow-sm animate-pulse">
                 {sosAlerts.length} Sinyal Darurat Aktif
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
               {sosAlerts.map(alert => (
                  <div key={alert.key} className="bg-white p-5 rounded-2xl shadow-lg shadow-red-900/5 border border-red-100 flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                           <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
                              <UserCircle size={28} />
                           </div>
                           <div>
                              <p className="font-black text-slate-800 text-lg uppercase leading-tight">{alert.name}</p>
                              <p className="text-sm text-slate-500 font-bold font-mono text-[10px]">NIK: {alert.nik}</p>
                              <p className="text-xs text-red-600 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
                                 Waktu Sinyal: {new Date(alert.time).toLocaleTimeString('id-ID')}
                              </p>
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button 
                           onClick={() => onResolveSos(alert.key)} 
                           className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 rounded-xl border border-red-200 transition-all text-sm shadow-sm"
                        >
                           Selesai
                        </button>
                        <button 
                           onClick={onViewLocation} 
                           className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-red-900/20 text-sm flex items-center justify-center gap-2"
                        >
                           <MapPinned size={16} /> Detail Lokasi
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase size={24} />
             </div>
             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Personil</p>
             <h3 className="text-2xl font-bold text-slate-800">{staff.length}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
             </div>
             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Online & Aktif</p>
             <h3 className="text-2xl font-bold text-slate-800">{staff.filter(s => s.status === DutyStatus.BERTUGAS).length}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
             </div>
             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pending Laporan</p>
             <h3 className="text-2xl font-bold text-slate-800">{pendingTugas.length}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                <MapPinned size={24} />
             </div>
             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tugas Selesai</p>
             <h3 className="text-2xl font-bold text-slate-800">{tugasList.filter(t => t.status === 'Verified').length}</h3>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Announcements History */}
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
               <MapPinned className="text-indigo-600" /> Pengumuman Terbaru
            </h3>
            <div className="space-y-4">
               {recentAnnouncements.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 font-bold italic">Belum ada pengumuman.</p>
               ) : (
                  recentAnnouncements.map(ann => (
                     <div key={ann.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white text-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                           <Calendar size={20} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-800">{ann.title}</h4>
                           <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ann.content}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2">
                              {new Date(ann.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} • Oleh {ann.authorName}
                           </p>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Quick Stats Distribution */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-6">Distribusi Gender</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                  <span className="font-bold text-blue-700">Laki-Laki</span>
                  <span className="text-xl font-black text-blue-900">{malePPSU}</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-pink-50 rounded-2xl">
                  <span className="font-bold text-pink-700">Perempuan</span>
                  <span className="text-xl font-black text-pink-900">{femalePPSU}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StaffDashboardSection;
