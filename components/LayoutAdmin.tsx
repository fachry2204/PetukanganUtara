import React, { useState } from 'react';
import { 
  Users, 
  Map, 
  BarChart3, 
  Menu, 
  Bell, 
  Search, 
  ChevronRight, 
  ChevronDown,
  UserCircle,
  LogOut,
  Camera,
  Activity,
  MapPinned,
  LayoutDashboard,
  Settings,
  UserCog,
  Wrench,
  UsersRound,
  X,
  Home,
  PieChart,
  Maximize, 
  PanelLeftClose,
  MessageSquareWarning,
  FileText,
  History,
  ChevronsUp,
  FileBadge,
  Stamp,
  Briefcase,
  Monitor,
  ShieldCheck,
  ClipboardList,
  Mail,
  Fingerprint,
  Calendar,
  Building2,
  RefreshCw,
  UserCheck,
  HardHat,
  Star,
  Power,
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  Megaphone
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { User, SystemSettings } from '../types';

interface LayoutAdminProps {
  user: User;
  settings: SystemSettings;
  setSettings: (s: SystemSettings) => void;
  onLogout: () => void;
}

const LayoutAdmin: React.FC<LayoutAdminProps> = ({
  user,
  settings,
  setSettings,
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'MANAJEMEN PPSU': true,
    'PENGATURAN': true
  });

  const menuGroups = [
    {
      title: 'MANAJEMEN PPSU',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <Activity size={20} />, color: 'bg-indigo-600' },
        { id: 'pengumuman', label: 'Pengumuman', icon: <Megaphone size={20} />, color: 'bg-amber-500' },
        { id: 'ppsu', label: 'Data PPSU', icon: <UsersRound size={20} />, color: 'bg-blue-500' },
        { id: 'absen', label: 'Data Absen PPSU', icon: <Camera size={20} />, color: 'bg-emerald-500' },
        { id: 'map', label: 'MAP ANGGOTA', icon: <MapPinned size={20} />, color: 'bg-orange-500' },
        { id: 'tugas', label: 'Data Tugas PPSU', icon: <ClipboardList size={20} />, color: 'bg-purple-500' },
        { id: 'jadwal', label: 'Jadwal PPSU', icon: <Calendar size={20} />, color: 'bg-cyan-500' },
        { id: 'report', label: 'Report', icon: <FileText size={20} />, color: 'bg-rose-500' },
      ]
    },
    {
      title: 'PENGATURAN',
      items: [
        { id: 'users', label: 'User Management', icon: <UserCog size={20} />, color: 'bg-slate-600' },
        { id: 'settings', label: 'Setting Aplikasi', icon: <Settings size={20} />, color: 'bg-slate-600' },
        { id: 'wa-logs', label: 'WhatsApp Logs', icon: <History size={20} />, color: 'bg-indigo-600' },
      ]
    }
  ];

  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-30 shadow-sm
          ${isSidebarOpen ? 'w-72' : 'w-24'} 
          ${isSidebarHidden ? 'hidden' : 'block'}`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-slate-200">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <h1 className="font-bold text-slate-800 leading-tight truncate">{settings.systemName}</h1>
              <p className="text-xs text-slate-500 font-medium truncate">{settings.subName}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 custom-scrollbar">
          {menuGroups.map((group, groupIndex) => {
            const isGroupExpanded = expandedGroups[group.title] !== false;
            return (
              <div key={groupIndex}>
                {isSidebarOpen && (
                  <button 
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 mb-2 group/header focus:outline-none"
                  >
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover/header:text-slate-600 transition-colors">
                      {group.title}
                    </h3>
                    {isGroupExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                  </button>
                )}
                <div className={`space-y-1 transition-all duration-300 ${(isSidebarOpen && !isGroupExpanded) ? 'hidden' : 'block'}`}>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(`/admin/${item.id}`);
                        if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                        ${currentPath === item.id 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                      title={!isSidebarOpen ? item.label : ''}
                    >
                      <div className={`p-2 rounded-lg transition-colors shadow-sm
                        ${currentPath === item.id ? item.color + ' text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'}`}>
                        {item.icon}
                      </div>
                      {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all group"
           >
              <div className="p-2 rounded-lg bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                 <LogOut size={20} />
              </div>
              {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-widest text-[10px]">Logout Account</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-0">
         {/* Top Header */}
         <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hidden md:block"
               >
                  <PanelLeftClose size={20} className={`transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
               </button>
               <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600" />
                  {currentPath.replace('_', ' ').toUpperCase()}
               </h2>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex flex-col items-end">
                   <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{user.name || user.username}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{user.role}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm relative group cursor-pointer">
                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full p-2 text-slate-400" />}
                </div>
            </div>
         </header>

         {/* Inner Content Scroller */}
         <div className={`flex-1 flex flex-col min-h-0 ${currentPath === 'map' ? '' : 'p-4 md:p-8 overflow-y-auto'} custom-scrollbar`}>
            <Outlet />
         </div>
      </main>
    </div>
  );
};

export default LayoutAdmin;
