import React, { useState } from 'react';
import { 
  Home, 
  Camera, 
  ClipboardList, 
  FileText, 
  UserCircle, 
  LogOut, 
  Power,
  ShieldCheck,
  AlertTriangle,
  History,
  Activity,
  User as UserIcon
} from 'lucide-react';
import { User, TugasPPSU, Staff, Announcement, AttendanceRecord } from '../types';
import PPSUSection from './PPSUSection';
import AttendanceSection from './AttendanceSection';
import PPSUTaskInputSection from './PPSUTaskInputSection';
import PPSUMyReportsSection from './PPSUMyReportsSection';

interface LayoutPPSUProps {
  user: User;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  tugasList: TugasPPSU[];
  setTugasList: React.Dispatch<React.SetStateAction<TugasPPSU[]>>;
  announcements: Announcement[];
  attendanceRecords: AttendanceRecord[];
  onRecordAttendance: (rec: AttendanceRecord) => void;
  onLogout: () => void;
  onSosClick: () => void;
  isSosLoading: boolean;
  isSosSent: boolean;
  isSosActive: boolean;
}

const LayoutPPSU: React.FC<LayoutPPSUProps> = ({
  user,
  staffList,
  setStaffList,
  tugasList,
  setTugasList,
  announcements,
  attendanceRecords,
  onRecordAttendance,
  onLogout,
  onSosClick,
  isSosLoading,
  isSosSent,
  isSosActive
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string>('PPSU');

  const renderContent = () => {
    switch (activeSubmenu) {
      case 'PPSU':
        return <PPSUSection user={user} staffList={staffList} setStaffList={setStaffList} />;
      case 'ABSENSI':
        return (
          <AttendanceSection 
            user={user} 
            attendanceRecords={attendanceRecords}
            onRecord={onRecordAttendance} 
          />
        );
      case 'INPUT_TUGAS':
        return <PPSUTaskInputSection user={user} tugasList={tugasList} setTugasList={setTugasList} />;
      case 'STATS':
        return <PPSUMyReportsSection user={user} tugasList={tugasList} />;
      default:
        return <PPSUSection user={user} staffList={staffList} setStaffList={setStaffList} />;
    }
  };

  const navItems = [
    { id: 'PPSU', label: 'Home', icon: <Home size={24} />, color: 'bg-orange-500' },
    { id: 'ABSENSI', label: 'Absen', icon: <Camera size={24} />, color: 'bg-purple-500' },
    { id: 'INPUT_TUGAS', label: 'Tugas', icon: <ClipboardList size={24} />, color: 'bg-indigo-500' },
    { id: 'STATS', label: 'History', icon: <History size={24} />, color: 'bg-green-500' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Top Header Mobile */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">P</div>
            <div>
               <h1 className="text-sm font-black text-slate-800 tracking-tight">SIPETUT MOBILE</h1>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role} Aktif</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={onLogout}
              className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100"
            >
               <LogOut size={20} />
            </button>
         </div>
      </header>

      {/* Main Content PPSU */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar">
         {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 h-20 px-4 flex items-center justify-around z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
         {navItems.map(item => (
            <button
               key={item.id}
               onClick={() => setActiveSubmenu(item.id)}
               className={`flex flex-col items-center gap-1 transition-all ${activeSubmenu === item.id ? 'text-orange-500' : 'text-slate-400'}`}
            >
               <div className={`${activeSubmenu === item.id ? 'scale-110' : 'scale-100'} transition-transform`}>
                  {item.icon}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
         ))}
         
         {/* SOS Action - Floating Style in Bottom Nav */}
         <button 
            onClick={onSosClick}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg -translate-y-6 border-4 border-slate-50 transition-all active:scale-95
              ${isSosActive ? 'bg-red-600' : 'bg-slate-900'} relative`}
         >
            {isSosLoading ? (
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : isSosSent ? (
               <ShieldCheck size={28} className="text-white animate-bounce" />
            ) : (
               <Power size={28} className="text-white" />
            )}
            {!isSosLoading && !isSosSent && (
               <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            )}
         </button>
      </nav>

      {/* SOS Active Modal Header Overlay if visible in App.tsx (or move here) */}
      {isSosActive && (
        <div className="fixed inset-0 bg-red-600 z-[1000] p-8 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertTriangle size={64} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Sinyal Bahaya</h2>
            <p className="text-red-100 font-bold max-w-xs mb-10">Kami akan mengirimkan lokasi GPS Anda ke Pimpinan dan Tim Keamanan segera.</p>
            
            <button 
                onClick={onSosClick}
                className="w-full max-w-xs py-4 bg-white text-red-600 font-black rounded-2xl shadow-xl shadow-red-900/40 uppercase tracking-widest text-sm"
            >
                Kirim Sinyal SOS
            </button>
            <button 
                onClick={() => onSosClick()} 
                className="mt-8 text-white/60 font-bold uppercase text-xs tracking-widest"
            >
                Batal
            </button>
        </div>
      )}
    </div>
  );
};

export default LayoutPPSU;
