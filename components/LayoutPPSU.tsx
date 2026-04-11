import React from 'react';
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
import { User } from '../types';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

interface LayoutPPSUProps {
  user: User;
  onLogout: () => void;
  onSosClick: () => void;
  isSosLoading: boolean;
  isSosSent: boolean;
  isSosActive: boolean;
  onSosCancel: () => void;
  isDangerMode: boolean;
  onResolveSos: (key: string) => void;
  sosAlertKey?: string;
  setIsSosSent: (val: boolean) => void;
}

const LayoutPPSU: React.FC<LayoutPPSUProps> = ({
  user,
  onLogout,
  onSosClick,
  isSosLoading,
  isSosSent,
  isSosActive,
  onSosCancel,
  isDangerMode,
  onResolveSos,
  sosAlertKey,
  setIsSosSent
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <Home size={24} /> },
    { id: 'absen', label: 'Absen', icon: <Camera size={24} /> },
    { id: 'tugas', label: 'Tugas', icon: <ClipboardList size={24} /> },
    { id: 'history', label: 'History', icon: <History size={24} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {/* Top Header Mobile */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
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
      <main className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
         <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 h-24 px-2 flex items-center justify-around z-[100] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
         {/* Home & Absen */}
         {navItems.slice(0, 2).map(item => (
            <button
               key={item.id}
               onClick={() => navigate(`/ppsu/${item.id}`)}
               className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentPath === item.id ? 'text-orange-500' : 'text-slate-400'}`}
            >
               <div className={`${currentPath === item.id ? 'scale-110' : 'scale-100'} transition-transform`}>
                  {item.icon}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
         ))}
         
         {/* SOS Action - Centered & Red */}
         <div className="flex-1 flex justify-center">
            <button 
               onClick={onSosClick}
               className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center shadow-xl -translate-y-8 border-[6px] border-white transition-all active:scale-95
                 ${isSosActive ? 'bg-orange-500' : 'bg-red-600'} relative`}
            >
               {isSosLoading ? (
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
               ) : isSosSent ? (
                  <ShieldCheck size={28} className="text-white animate-bounce" />
               ) : (
                  <Power size={28} className="text-white" />
               )}
               <span className="text-[8px] font-black text-white mt-0.5 tracking-tighter">SOS</span>
            </button>
         </div>

         {/* Tugas & History */}
         {navItems.slice(2).map(item => (
            <button
               key={item.id}
               onClick={() => navigate(`/ppsu/${item.id}`)}
               className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentPath === item.id ? 'text-orange-500' : 'text-slate-400'}`}
            >
               <div className={`${currentPath === item.id ? 'scale-110' : 'scale-100'} transition-transform`}>
                  {item.icon}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
         ))}
      </nav>

      {/* SOS Active Modal Confirmation Dialog */}
      {isSosActive && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[2000] p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative overflow-hidden border-t-8 border-red-600">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-50">
                    <AlertTriangle size={40} />
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">KIRIM SINYAL SOS?</h2>
                <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                    Apakah Anda sedang dalam keadaan darurat? <br/> Lokasi GPS Anda akan segera dikirim ke Pimpinan.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => onSosClick()} 
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-200 uppercase tracking-widest text-sm transition-all active:scale-95"
                    >
                        Ya, Kirim Sekarang!
                    </button>
                    <button 
                        onClick={() => onSosCancel()} 
                        className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-sm"
                    >
                        Tidak, Batalkan
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* SOS Sent Confirmation Overlay */}
      {isSosSent && !isDangerMode && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[3000] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] rotate-12">
                <ShieldCheck size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">LAPORAN DARURAT TERKIRIM</h3>
            <p className="text-emerald-100 font-bold text-lg leading-relaxed max-w-xs mb-10">
                Status Bahaya anda sudah terkirim dan akan ada petugas menjemput anda.
            </p>
            <button 
                onClick={() => setIsSosSent(false)}
                className="bg-white/20 hover:bg-white/30 text-white px-10 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
            >
                MENGERTI
            </button>
            <div className="mt-8 w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 animate-progress origin-left"></div>
            </div>
        </div>
      )}

      {/* FULL SCREEN DANGER MODE */}
      {isDangerMode && (
         <div className="fixed inset-0 bg-red-600 z-[5000] flex flex-col items-center justify-center p-10 text-center text-white overflow-hidden">
            {/* Pulsing Background Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full animate-ping opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/10 rounded-full animate-ping opacity-40 delay-300"></div>

            <AlertTriangle size={120} className="mb-10 animate-bounce" />
            
            <h1 className="text-6xl font-black mb-6 tracking-tighter leading-none"> STATUS <br/> BAHAYA </h1>
            
            <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20 mb-12">
               <p className="text-xl font-black uppercase tracking-widest text-white">BANTUAN SEDANG DIJEMPUT</p>
            </div>

            <p className="text-lg font-bold opacity-90 max-w-sm mb-16 leading-relaxed">
               Pimpinan telah menerima koordinat GPS anda. Tetap tenang di lokasi anda sekarang.
            </p>
            
            <button 
               onClick={() => {
                  setIsSosSent(false); // Clear the local success state
                  if (sosAlertKey) {
                     onResolveSos(sosAlertKey);
                  }
               }}
               className="bg-white text-red-600 w-full max-w-xs py-6 rounded-[2rem] font-black text-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] active:scale-95 transition-all uppercase tracking-tight"
            >
               SAYA SUDAH AMAN
            </button>

            <div className="absolute bottom-10 left-0 right-0 p-8">
                <div className="flex items-center justify-center gap-2 opacity-60">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS Tracking Active</span>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default LayoutPPSU;
