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
    <div className="flex h-screen bg-white font-sans overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 fixed lg:static inset-y-0 left-0 z-[70] shadow-xl lg:shadow-none
          ${isMobileMenuOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0'} 
          ${isSidebarOpen ? 'lg:w-72' : 'lg:w-24'}
          ${isSidebarHidden ? 'hidden' : 'block'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">P</span>
                </div>
              )}
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <h1 className="font-bold text-slate-800 leading-tight truncate">{settings.systemName}</h1>
                <p className="text-xs text-slate-500 font-medium truncate">{settings.subName}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 custom-scrollbar">
          {menuGroups.map((group, groupIndex) => {
            const isGroupExpanded = expandedGroups[group.title] !== false;
            return (
              <div key={groupIndex}>
                {(isSidebarOpen || isMobileMenuOpen) && (
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
                <div className={`space-y-1 transition-all duration-300 ${((isSidebarOpen || isMobileMenuOpen) && !isGroupExpanded) ? 'hidden' : 'block'}`}>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(`/admin/${item.id}`);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                        ${currentPath === item.id 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                      title={!(isSidebarOpen || isMobileMenuOpen) ? item.label : ''}
                    >
                      <div className={`p-2 rounded-lg transition-colors shadow-sm
                        ${currentPath === item.id ? item.color + ' text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'}`}>
                        {item.icon}
                      </div>
                      {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
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
              {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold text-sm uppercase tracking-widest text-[11px]">Logout Account</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-0 overflow-hidden">
         {/* Top Header */}
         <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
               {/* Mobile Menu Toggle */}
               <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all lg:hidden"
               >
                  <Menu size={20} />
               </button>

               {/* Desktop Sidebar Toggle */}
               <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hidden lg:block"
               >
                  <PanelLeftClose size={20} className={`transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
               </button>

               <h2 className="text-sm md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-1 md:gap-2 truncate">
                  <Activity size={18} className="text-indigo-600 shrink-0 hidden xs:block" />
                  <span className="truncate">{currentPath.replace(/_/g, ' ').toUpperCase()}</span>
               </h2>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden md:flex flex-col items-end">
                   <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{user.name || user.username}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{user.role}</p>
                </div>
                <div 
                   onClick={() => navigate('/admin/settings')}
                   className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm relative group cursor-pointer shrink-0"
                >
                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full p-2 text-slate-400" />}
                </div>
            </div>
         </header>

         {/* Inner Content Scroller */}
         <div className={`flex-1 flex flex-col min-h-0 ${currentPath === 'map' ? '' : 'p-4 md:p-8 overflow-y-auto overflow-x-hidden'} custom-scrollbar`}>
            <Outlet />
         </div>
      </main>
    </div>
  );
};

export default LayoutAdmin;
