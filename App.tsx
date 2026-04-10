
import React, { useState, useEffect, useMemo } from 'react';
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
  Map as MapIcon,
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
import { User, SystemSettings, Report, Staff, Citizen, ServiceRequest, Role, ServiceRating, Announcement, AttendanceRecord, AttendanceType } from './types';
import { MOCK_USERS, MOCK_REPORTS, MOCK_STAFF, MOCK_CITIZENS, MOCK_SERVICE_REQUESTS } from './constants';
import PPSUSection from './components/PPSUSection';
import DutySection from './components/DutySection';
import StatisticsSection from './components/StatisticsSection';
import AttendanceSection from './components/AttendanceSection';
import MapSection from './components/MapSection';
import DashboardSection from './components/DashboardSection';
import MainDashboardSection from './components/MainDashboardSection';
import SettingsSection from './components/SettingsSection';
import UserManagementSection from './components/UserManagementSection';
import WargaProfileSection from './components/WargaProfileSection';
import WargaSuratSection from './components/WargaSuratSection';
import WargaMainDashboard from './components/WargaMainDashboard'; 
import LoginPage from './components/LoginPage';
import PPSUTaskInputSection from './components/PPSUTaskInputSection';
import PPSUMyReportsSection from './components/PPSUMyReportsSection';
import AnnouncementSection from './components/AnnouncementSection';
import AdminReportsSection from './components/AdminReportsSection';

// Updated Submenu Types
type Submenu = string;

const loadData = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return fallback;
  }
};

const saveData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    console.error(`Error saving ${key}`, e);
  }
};

// Component for Staff Dashboard with Profile and All Stats
const StaffDashboardSection: React.FC<{ 
  user: User, 
  staff: Staff[], 
  reports: Report[], 
  announcements: Announcement[],
  sosAlerts: any[],
  onResolveSos: (key: string) => void,
  onViewLocation: () => void 
}> = ({ user, staff, reports, announcements, sosAlerts, onResolveSos, onViewLocation }) => {
  const pendingReports = reports.filter(r => r.status === 'Menunggu Verifikasi');
  const malePPSU = staff.filter(s => s.jenisKelamin === 'Laki-Laki').length;
  const femalePPSU = staff.filter(s => s.jenisKelamin === 'Perempuan').length;
  const recentAnnouncements = announcements.slice(0, 3); // show latest 3

  return (
    <div className="space-y-6">
      {/* Welcome & Profile Header */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
           <div className="shrink-0 relative">
              <div className="w-32 h-32 rounded-3xl bg-white/20 border-4 border-white/30 backdrop-blur-md overflow-hidden flex items-center justify-center">
                 {user.avatar ? (
                   <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                 ) : (
                   <UserCircle size={64} className="text-white/50" />
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-indigo-600">
                 <ShieldCheck size={16} />
              </div>
           </div>
           
           <div className="flex-1 text-center md:text-left">
              <p className="text-indigo-200 font-bold uppercase tracking-[0.2em] text-xs mb-1">Profil {user.role}</p>
              <h2 className="text-3xl md:text-4xl font-black mb-2">{user.name || user.username}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
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

           <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shrink-0 hidden lg:block">
              <Calendar size={24} className="mx-auto mb-2 text-indigo-200" />
              <p className="text-[10px] font-black uppercase opacity-60">Hari Ini</p>
              <p className="text-lg font-black">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
           </div>
        </div>
        <Building2 className="absolute -right-16 -bottom-16 size-64 opacity-10" />
      </div>

      {/* SOS Active Cards */}
      {sosAlerts.length > 0 && (
         <div className="bg-red-50 border border-red-200 p-6 rounded-3xl shadow-sm animate-in fade-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            
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

      {/* Papan Pengumuman */}
      {recentAnnouncements.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-black text-amber-800 mb-4 flex items-center gap-2">
            <Megaphone size={20} className="text-amber-500" /> Papan Pengumuman
          </h3>
          <div className="space-y-4">
            {recentAnnouncements.map(ann => (
              <div key={ann.id} className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                   <Bell size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-slate-800">{ann.title}</h4>
                   <p className="text-sm text-slate-600 mt-1">{ann.content}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{new Date(ann.date).toLocaleDateString('id-ID')} • Diumumkan Oleh: {ann.authorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistik PPSU Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <UsersRound size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Anggota PPSU</p>
          <h3 className="text-3xl font-black text-slate-800">{staff.length} <span className="text-sm font-bold text-slate-400">Personil</span></h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <UsersRound size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PPSU Laki-Laki</p>
          <h3 className="text-3xl font-black text-slate-800">{malePPSU} <span className="text-sm font-bold text-slate-400">Personil</span></h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-all">
            <UsersRound size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PPSU Perempuan</p>
          <h3 className="text-3xl font-black text-slate-800">{femalePPSU} <span className="text-sm font-bold text-slate-400">Personil</span></h3>
        </div>
      </div>

      {/* Tabel Tugas Pending Verifikasi */}
      <div className="bg-white rounded-[2rem] box-border border border-slate-100 shadow-sm p-6 overflow-hidden">
         <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList className="text-orange-500" /> Tugas PPSU - Pending Verifikasi
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-lg ml-auto">{pendingReports.length} Menunggu</span>
         </h3>
         <div className="overflow-x-auto custom-scrollbar pb-2">
            <table className="w-full text-left text-sm border-collapse">
               <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                     <th className="pb-3 px-4 text-center">No</th>
                     <th className="pb-3">Data Pelapor</th>
                     <th className="pb-3">Kategori</th>
                     <th className="pb-3">Judul Masalah</th>
                     <th className="pb-3">Waktu Laporan</th>
                  </tr>
               </thead>
               <tbody>
                  {pendingReports.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                           <ShieldCheck size={48} className="mx-auto mb-3 opacity-20" />
                           <p className="font-semibold">Bagus! Tidak ada laporan yang menunggu verifikasi.</p>
                        </td>
                     </tr>
                  ) : (
                     pendingReports.map((report, idx) => (
                        <tr key={report.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                           <td className="py-4 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                           <td className="py-4">
                              <p className="font-bold text-slate-800">{report.reporterName}</p>
                              {report.reporterNik && <p className="text-[10px] text-slate-400 font-mono">NIK: {report.reporterNik}</p>}
                           </td>
                           <td className="py-4">
                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{report.category}</span>
                           </td>
                           <td className="py-4 font-medium text-slate-700 max-w-xs truncate" title={report.title}>{report.title}</td>
                           <td className="py-4 text-xs font-bold text-slate-500">{new Date(report.timestamp).toLocaleString('id-ID')}</td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeSubmenu, setActiveSubmenu] = useState<Submenu>('PPSU');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserSelectorOpen, setIsUserSelectorOpen] = useState(false);
  const [activeSelectorTab, setActiveSelectorTab] = useState<string>('Administrator');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); 
  
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [staffList, setStaffList] = useState<Staff[]>(MOCK_STAFF);
  const [citizens, setCitizens] = useState<Citizen[]>(MOCK_CITIZENS);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(MOCK_SERVICE_REQUESTS);
  const [ratings, setRatings] = useState<ServiceRating[]>(() => loadData('app_ratings', []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadData('app_announcements', []));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadData('app_attendance', []));
  const [receivedSosAlerts, setReceivedSosAlerts] = useState<any[]>([]);
  const [showSosAlertModal, setShowSosAlertModal] = useState(false);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  // Derive initial users from all data sources (excluding static dummy citizens)
  const initialUsers: User[] = useMemo(() => {
    const internal = MOCK_USERS;
    
    const ppsuUsers = MOCK_STAFF.map(s => ({
      id: `USR-PPSU-${s.id}`,
      name: s.namaLengkap,
      username: s.nomorAnggota.toLowerCase(),
      nik: s.nik,
      role: 'PPSU' as Role,
      avatar: s.fotoProfile,
      password: '123'
    }));

    return [...internal, ...ppsuUsers];
  }, []);

  const [users, setUsers] = useState<User[]>(() => loadData('app_users', initialUsers));
  
  // LOGIN STATE - Initialize as null to show Login Page first
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadData('app_session', null)); 

  const [settings, setSettings] = useState<SystemSettings>(() => loadData('app_settings', {
    systemName: 'SiPetut',
    subName: 'Kelurahan Petukangan Utara',
    footerText: '\u00A9 2026 Kelurahan Petukangan Utara. All Rights Reserved.',
    appVersion: '1.0.0',
    themeColor: '#f97316',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Jakarta.svg',
    loginBackground: null,
    anjunganBackground: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2000'
  }));

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'STAFF KELURAHAN': true,
    'UMUM': true,
    'MENU PASUKAN ORANGE (PPSU)': true, // Updated group name
    'PENGATURAN': true,
    'MENU WARGA': true,
  });

  useEffect(() => {
    if (activeSubmenu === 'ANJUNGAN_MANDIRI') setIsSidebarHidden(true);
  }, [activeSubmenu]);

  useEffect(() => { 
    if (currentUser) {
        saveData('app_session', currentUser); 
    } else {
        localStorage.removeItem('app_session');
    }
  }, [currentUser]);
  
  useEffect(() => { saveData('app_settings', settings); }, [settings]);
  useEffect(() => { saveData('app_users', users); }, [users]);
  useEffect(() => { saveData('app_ratings', ratings); }, [ratings]);
  useEffect(() => { saveData('app_announcements', announcements); }, [announcements]);
  useEffect(() => { saveData('app_attendance', attendanceRecords); }, [attendanceRecords]);

  // Admin SOS Detection Effect
  useEffect(() => {
    const handleStorage = () => {
      if (!currentUser || currentUser.role === 'PPSU') return;

      const keys = Object.keys(localStorage).filter(k => k.startsWith('sos_alert_'));
      const alerts = keys.map(k => {
        const val = localStorage.getItem(k);
        return val ? { key: k, ...JSON.parse(val) } : null;
      }).filter(Boolean);

      // Only show alerts created in the last 15 minutes to avoid obsolete popups
      const recentAlerts = alerts.filter(a => {
         const alertTime = new Date(a.time).getTime();
         return (Date.now() - alertTime) < 15 * 60 * 1000;
      });
      
      setReceivedSosAlerts(recentAlerts);
    };

    handleStorage();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('local-storage-update', handleStorage);
    const interval = setInterval(handleStorage, 3000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('local-storage-update', handleStorage);
      clearInterval(interval);
    };
  }, [currentUser]);
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveSubmenu(user.role === 'PPSU' ? 'PPSU' : 'DASHBOARD');
  };

  const [isSosActive, setIsSosActive] = useState(false);
  const [isSosSent, setIsSosSent] = useState(false);
  const [isSosLoading, setIsSosLoading] = useState(false);

  const confirmLogout = () => {
    setCurrentUser(null);
    setIsLogoutModalOpen(false); // Close modal
    // Reset navigation state so subsequent logins start fresh
    setActiveSubmenu('DASHBOARD');
    setIsSidebarOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleSosClick = () => {
      setIsSosActive(true);
  };

  const sendSosSignal = () => {
      setIsSosLoading(true);
      setTimeout(() => {
          setIsSosLoading(false);
          setIsSosSent(true);
          // Simulate sending to Pimpinan / Admin via localStorage
          localStorage.setItem(`sos_alert_${Date.now()}`, JSON.stringify({ nik: currentUser?.nik, name: currentUser?.name, time: new Date().toISOString() }));
          window.dispatchEvent(new Event('local-storage-update'));
          setTimeout(() => {
              setIsSosActive(false);
              setIsSosSent(false);
          }, 3000);
      }, 1500);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setActiveSubmenu(user.role === 'PPSU' ? 'PPSU' : 'DASHBOARD');
    setIsUserSelectorOpen(false);
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Get unique roles from current users list for the selector tabs
  const availableRoles = useMemo(() => {
    const rolesSet = new Set(users.map(u => u.role));
    // Define a custom sort order for common roles
    const order = ['Administrator', 'Admin', 'Pimpinan', 'Staff Kelurahan', 'Operator', 'PPSU', 'Karang Taruna'];
    /* Fix: Explicitly cast Array.from result to Role[] to resolve 'unknown' type inference in sort callback */
    return (Array.from(rolesSet) as Role[]).sort((a, b) => {
        /* Fix: a and b are correctly typed as strings from the Role union for indexOf and localeCompare */
        const idxA = order.indexOf(a);
        const idxB = order.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });
  }, [users]);

  // IF NOT LOGGED IN, SHOW LOGIN PAGE
  if (!currentUser) {
    return <LoginPage onLogin={handleLoginSuccess} settings={settings} users={users} />;
  }

  const renderContent = () => {
    const handleResolveSos = (key: string) => {
        localStorage.removeItem(key);
        setReceivedSosAlerts(prev => prev.filter(a => a.key !== key));
        window.dispatchEvent(new Event('local-storage-update'));
    };
    
    switch (activeSubmenu) {
      /* Admin/Pimpinan Specific Routes */
      case 'DASHBOARD':
        return (
           <StaffDashboardSection 
              user={currentUser} 
              staff={staffList} 
              reports={reports} 
              announcements={announcements} 
              sosAlerts={receivedSosAlerts}
              onResolveSos={handleResolveSos}
              onViewLocation={() => setActiveSubmenu('MAP_PPSU')}
           />
        );
      case 'PENGUMUMAN': 
        return <AnnouncementSection user={currentUser} users={users} announcements={announcements} setAnnouncements={setAnnouncements} />;
      case 'PPSU': // Data PPSU
        return <PPSUSection user={currentUser} staffList={staffList} setStaffList={setStaffList} />;
      case 'ADMIN_ABSEN': // Data Absen PPSU
        return <AdminReportsSection mode="ABSEN" attendanceRecords={attendanceRecords} reports={reports} />;
      case 'ADMIN_TUGAS': // Data Tugas PPSU
        return <AdminReportsSection mode="TUGAS" attendanceRecords={attendanceRecords} reports={reports} />;
      case 'MONITORING':
        return <DutySection user={currentUser} reports={reports} setReports={setReports} staffList={staffList} setStaffList={setStaffList} />;
      case 'MAP_PPSU': // MAP ANGGOTA
        return <MapSection reports={reports} setReports={setReports} staffList={staffList} setStaffList={setStaffList} sosAlerts={receivedSosAlerts} />;
      case 'STATS': // Report (General for Admin, Specific for PPSU)
        if (currentUser.role === 'PPSU') {
           return <PPSUMyReportsSection user={currentUser} reports={reports} />;
        }
        return <AdminReportsSection mode="FULL_REPORT" attendanceRecords={attendanceRecords} reports={reports} />;
      case 'USER_MANAGEMENT':
        return <UserManagementSection users={users} setUsers={setUsers} initialTab="SEMUA" />;
      case 'SETTINGS':
        return <SettingsSection settings={settings} onUpdate={setSettings} />;

      /* PPSU Mobile Routes */
      case 'INPUT_TUGAS':
        return <PPSUTaskInputSection user={currentUser} reports={reports} setReports={setReports} />;
      case 'ABSENSI':
        return <AttendanceSection user={currentUser} onRecord={(rec) => setAttendanceRecords([rec, ...attendanceRecords])} />;
        
      default:
        // Default fallback to Dashboard for Admin, and PPSUSection for compatibility
        if (currentUser.role === 'PPSU') return <PPSUSection user={currentUser} staffList={staffList} setStaffList={setStaffList} />;
        return (
           <StaffDashboardSection 
              user={currentUser} 
              staff={staffList} 
              reports={reports} 
              announcements={announcements} 
              sosAlerts={receivedSosAlerts}
              onResolveSos={handleResolveSos}
              onViewLocation={() => setActiveSubmenu('MAP_PPSU')}
           />
        );
    }
  };

  // Dynamic Menu Groups based on Role
  const menuGroups = currentUser.role === 'PPSU' ? [
    {
      title: 'MENU PASUKAN ORANGE (PPSU)',
      items: [
        { id: 'PPSU', label: 'Dashboard', icon: <Home size={20} />, color: 'bg-orange-500' },
        { id: 'ABSENSI', label: 'Absen Saya', icon: <Camera size={20} />, color: 'bg-purple-500' },
        { id: 'INPUT_TUGAS', label: 'Tugas', icon: <ClipboardList size={20} />, color: 'bg-indigo-500' },
        { id: 'STATS', label: 'Laporan Saya', icon: <FileText size={20} />, color: 'bg-green-500' },
      ]
    }
  ] : [
    {
      title: 'MANAJEMEN PPSU',
      items: [
        { id: 'DASHBOARD', label: 'Dashboard', icon: <Activity size={20} />, color: 'bg-indigo-600' },
        { id: 'PENGUMUMAN', label: 'Pengumuman', icon: <Megaphone size={20} />, color: 'bg-amber-500' },
        { id: 'PPSU', label: 'Data PPSU', icon: <UsersRound size={20} />, color: 'bg-blue-500' },
        { id: 'ADMIN_ABSEN', label: 'Data Absen PPSU', icon: <Camera size={20} />, color: 'bg-emerald-500' },
        { id: 'MAP_PPSU', label: 'MAP ANGGOTA', icon: <MapPinned size={20} />, color: 'bg-orange-500' },
        { id: 'ADMIN_TUGAS', label: 'Data Tugas PPSU', icon: <ClipboardList size={20} />, color: 'bg-purple-500' },
        { id: 'STATS', label: 'Report', icon: <FileText size={20} />, color: 'bg-rose-500' },
      ]
    },
    {
      title: 'PENGATURAN',
      items: [
        { id: 'USER_MANAGEMENT', label: 'User Management', icon: <UserCog size={20} />, color: 'bg-slate-600' },
        { id: 'SETTINGS', label: 'Setting Aplikasi', icon: <Settings size={20} />, color: 'bg-slate-600' },
      ]
    }
  ];

  const allMenuItems = menuGroups.flatMap(group => group.items);
  const useDefaultPadding = !['MAP_PPSU', 'SETTINGS'].includes(activeSubmenu);

  const renderSidebarContent = (collapsed: boolean) => (
    <>
      <div className="p-4 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
            </div>
          )}
        </div>
        {!collapsed && (
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
              {!collapsed && (
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
              <div className={`space-y-1 transition-all duration-300 ${(!collapsed && !isGroupExpanded) ? 'hidden' : 'block'}`}>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSubmenu(item.id as Submenu);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      activeSubmenu === item.id 
                        ? `${item.color} text-white shadow-md` 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`${activeSubmenu === item.id ? 'text-white' : 'text-slate-500'}`}>{item.icon}</div>
                    {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-white z-10">
        <button 
          onClick={() => setIsUserSelectorOpen(true)}
          className={`w-full flex items-center ${!collapsed ? 'justify-between' : 'justify-center'} p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group`}
        >
          <div className={`flex items-center ${!collapsed ? 'gap-3' : ''}`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-slate-600" />}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                <div className="bg-green-500 w-2 h-2 rounded-full"></div>
              </div>
            </div>
            {!collapsed && (
              <div className="overflow-hidden text-left">
                <p className="text-sm font-black text-slate-800 truncate w-24">{currentUser.username}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate w-24">{currentUser.role}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
              <RefreshCw size={16} />
            </div>
          )}
        </button>
      </div>
    </>
  );

  const getSelectorItems = () => {
    return users.filter(u => u.role === activeSelectorTab);
  };

  return (
    <>
      {/* CUSTOM LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 relative z-[10000]">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-white shadow-md">
                <Power size={32} />
             </div>
             <h3 className="text-xl font-black text-center text-slate-800 mb-2">Konfirmasi Keluar</h3>
             <p className="text-sm text-slate-500 text-center mb-8 font-medium">Apakah Anda yakin ingin mengakhiri sesi ini?</p>
             <div className="flex gap-3">
                <button 
                  onClick={() => setIsLogoutModalOpen(false)} 
                  className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmLogout} 
                  className="flex-1 py-3.5 bg-red-600 text-white text-sm font-black rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform active:scale-95"
                >
                  Keluar
                </button>
             </div>
          </div>
        </div>
      )}

      {currentUser.role === 'PPSU' ? (
        // ==========================================
        //  MOBILE APP LAYOUT (EXCLUSIVE FOR PPSU)
        // ==========================================
        <div className="flex h-screen bg-slate-900 items-center justify-center overflow-hidden">
          {/* Phone Frame Container */}
          <div className="w-full h-full sm:w-[420px] sm:h-[850px] sm:max-h-[95vh] bg-slate-50 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative sm:border-[8px] border-slate-800 ring-1 ring-white/10 mx-auto">
            
            {/* Mobile Header */}
            <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-40 shadow-sm relative pt-safe">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                        <span className="font-black text-lg">P</span>
                    </div>
                    <div>
                        <h2 className="font-black text-slate-800 text-sm leading-tight">{allMenuItems.find(m => m.id === activeSubmenu)?.label || 'Aplikasi PSSU'}</h2>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Petugas Lapangan</p>
                    </div>
                </div>
                <button onClick={handleLogoutClick} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                    <LogOut size={16} />
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 pb-20">
               <div className="p-4 sm:p-5 min-h-full">
                  {renderContent()}
               </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center h-16 sm:h-20 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-50">
               {allMenuItems.filter(item => ['PPSU', 'ABSENSI', 'INPUT_TUGAS', 'STATS'].includes(item.id)).map((item, idx) => {
                   const isActive = activeSubmenu === item.id;
                   return (
                       <React.Fragment key={item.id}>
                         {idx === 2 && (
                             <button 
                                onClick={handleSosClick}
                                className="flex flex-col items-center justify-center -mt-8 z-10 hover:scale-105 transition-transform shrink-0"
                             >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl bg-red-500 animate-pulse opacity-30"></div>
                                    <span className="font-black text-lg sm:text-xl tracking-widest relative z-10 text-white drop-shadow-md">SOS</span>
                                </div>
                             </button>
                         )}
                         <button 
                             onClick={() => setActiveSubmenu(item.id)} 
                             className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${isActive ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-orange-50' : 'bg-transparent'}`}>
                               {item.icon}
                            </div>
                            <span className={`text-[9px] font-black tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
                         </button>
                       </React.Fragment>
                   );
               })}
            </div>
            {/* SafeArea Notch Simulator on Desktop */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-3xl hidden sm:block z-[60]"></div>
          </div>
        </div>
      ) : (
        // ==========================================
        //  WEB DASHBOARD LAYOUT (ADMIN/STAFF/PIMPINAN)
        // ==========================================
        <div className="flex h-screen bg-slate-50 overflow-hidden">
          
          {/* User Selector Modal (Only kept in Web layout for debugging and role switching) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-white shadow-md">
                <Power size={32} />
             </div>
             <h3 className="text-xl font-black text-center text-slate-800 mb-2">Konfirmasi Keluar</h3>
             <p className="text-sm text-slate-500 text-center mb-8 font-medium">Apakah Anda yakin ingin mengakhiri sesi ini? Anda perlu login kembali untuk mengakses sistem.</p>
             <div className="flex gap-3">
                <button 
                  onClick={() => setIsLogoutModalOpen(false)} 
                  className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmLogout} 
                  className="flex-1 py-3.5 bg-red-600 text-white text-sm font-black rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform active:scale-95"
                >
                  Ya, Keluar
                </button>
             </div>
          </div>
        </div>
      )}

      {/* User Selector Modal */}
      {isUserSelectorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Akun Simulasi</h3>
                    <p className="text-sm text-slate-500 font-medium">Beralih antar role pengguna sistem.</p>
                 </div>
                 <button onClick={() => setIsUserSelectorOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
                    <X size={20} />
                 </button>
              </div>
              
              {/* Dynamic Tab Selector */}
              <div className="px-6 pt-4 flex gap-1 overflow-x-auto no-scrollbar pb-1">
                 {availableRoles.map((role) => (
                    <button 
                        key={role}
                        onClick={() => setActiveSelectorTab(role)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeSelectorTab === role ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        {role}
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${activeSelectorTab === role ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {users.filter(u => u.role === role).length}
                        </span>
                    </button>
                 ))}
              </div>

              <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-2">
                 {getSelectorItems().map((user) => (
                    <button 
                      key={user.id}
                      onClick={() => switchUser(user as User)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                        currentUser.id === user.id 
                          ? 'bg-slate-50 border-indigo-200 ring-2 ring-indigo-500/10 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                      } group`}
                    >
                       <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                             {user.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400"><UserCircle size={24} /></div>
                             )}
                          </div>
                          {currentUser.id === user.id && (
                             <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg border-2 border-white">
                                <UserCheck size={10} />
                             </div>
                          )}
                       </div>
                       <div className="text-left flex-1 min-w-0">
                          <p className={`font-black text-sm uppercase tracking-tight truncate ${currentUser.id === user.id ? 'text-indigo-700' : 'text-slate-800'}`}>{user.name || user.username}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest ${
                                user.role === 'Administrator' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                user.role === 'Pimpinan' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                user.role === 'PPSU' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                             }`}>
                                {user.role}
                             </span>
                             {user.nik && <span className="text-[10px] font-mono text-slate-400 font-bold">NIK: {user.nik.slice(0,6)}...</span>}
                          </div>
                       </div>
                       <ChevronRight size={18} className={`text-slate-300 transition-transform ${currentUser.id === user.id ? 'translate-x-1 text-indigo-400' : 'group-hover:translate-x-1'}`} />
                    </button>
                 ))}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Sinkronisasi Realtime</p>
              </div>
           </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative w-64 bg-white shadow-xl flex flex-col h-full animate-in slide-in-from-left duration-200">
             <div className="absolute top-2 right-2"><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
             {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      <aside className={`${isSidebarHidden ? 'w-0 border-r-0 opacity-0' : (isSidebarOpen ? 'w-64' : 'w-20')} transition-all duration-300 bg-white border-r border-slate-200 flex-col no-print hidden md:flex overflow-hidden whitespace-nowrap`}>
        {renderSidebarContent(!isSidebarOpen)}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 no-print shrink-0 z-40`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 md:hidden"><Menu size={20} /></button>
            <button onClick={() => setIsSidebarHidden(!isSidebarHidden)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hidden md:block"><Menu size={20} /></button>
            <h2 className="font-bold text-slate-800 text-lg">{allMenuItems.find(m => m.id === activeSubmenu)?.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogoutClick} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-bold transition-colors">
                <LogOut size={18} /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto flex flex-col ${useDefaultPadding ? 'p-4 md:p-8' : 'p-0'}`}>
          <div className="flex-1 flex flex-col">{renderContent()}</div>
          {useDefaultPadding && (
            <footer className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 no-print shrink-0">
              <div>{settings.footerText}</div>
              <div className="flex items-center gap-2"><span className="bg-slate-100 px-2 py-1 rounded">Versi {settings.appVersion}</span></div>
            </footer>
          )}
        </div>
      </main>
    </div>
    )}

    {/* SOS Emergency Modal */}
    {isSosActive && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-6">
           <div className="bg-red-600 w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="absolute inset-0 bg-red-500 animate-pulse mix-blend-screen opacity-50"></div>
               {isSosSent ? (
                   <>
                       <div className="w-20 h-20 rounded-full bg-white text-emerald-500 flex items-center justify-center mb-6 relative z-10 animate-bounce">
                           <CheckCircle2 size={40} />
                       </div>
                       <h2 className="text-2xl font-black text-white relative z-10 mb-2 leading-tight">Sinyal Bahaya<br/>Telah Dikirim!</h2>
                       <p className="text-red-100 relative z-10 font-medium">Tim Pusat, Admin, dan Pimpinan telah menerima lokasi Anda dan tim bantuan segera dikerahkan.</p>
                   </>
               ) : isSosLoading ? (
                   <>
                       <div className="w-20 h-20 rounded-full border-4 border-red-400 border-t-white animate-spin mb-6 relative z-10"></div>
                       <h2 className="text-2xl font-black text-white relative z-10 mb-2">Mengirim Sinyal...</h2>
                       <p className="text-red-100 relative z-10 font-medium">Mendapatkan lokasi akurat GPS Anda saat ini...</p>
                   </>
               ) : (
                   <>
                       <div className="w-24 h-24 rounded-full bg-white text-red-600 flex items-center justify-center mb-6 relative z-10">
                           <AlertTriangle size={48} className="animate-pulse" />
                       </div>
                       <h2 className="text-2xl font-black text-white relative z-10 mb-3 leading-tight tracking-tight">KIRIM SINYAL<br/>BAHAYA (SOS)?</h2>
                       <p className="text-red-100 relative z-10 font-medium text-sm mb-8 leading-relaxed">
                          Gunakan fitur ini <b className="text-white">HANYA</b> dalam keadaan darurat atau bahaya saat bertugas di lapangan. Koordinat akurat Anda saat ini akan di-broadcast seketika.
                       </p>
                       <div className="flex gap-3 w-full relative z-10">
                           <button onClick={() => setIsSosActive(false)} className="flex-1 py-3.5 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl transition-all">BATAL</button>
                           <button onClick={sendSosSignal} className="flex-1 py-3.5 bg-white text-red-600 hover:bg-slate-100 font-black rounded-xl transition-all shadow-xl shadow-red-900/50">KIRIM SOS</button>
                       </div>
                   </>
               )}
           </div>
        </div>
    )}

    {/* Admin Receiver SOS Modal */}
    {currentUser?.role !== 'PPSU' && receivedSosAlerts.length > 0 && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-6">
           <div className="bg-red-600 w-full max-w-md rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
               <div className="absolute inset-0 bg-red-500 animate-[pulse_1s_infinite] mix-blend-screen opacity-50"></div>
               <div className="w-24 h-24 rounded-full bg-white text-red-600 flex items-center justify-center mb-6 relative z-10 shadow-lg">
                   <AlertTriangle size={56} className="animate-pulse" />
               </div>
               
               <h2 className="text-3xl font-black text-white relative z-10 mb-2 leading-tight tracking-tight uppercase">
                   Peringatan Darurat!
               </h2>
               <div className="bg-white/20 px-4 py-2 rounded-xl border border-white/30 backdrop-blur-md relative z-10 mb-6 flex animate-pulse">
                   <span className="text-white font-black tracking-widest text-sm uppercase">Petugas Terindikasi Dalam Bahaya</span>
               </div>
               
               <div className="space-y-3 w-full relative z-10 mb-8 max-h-64 overflow-y-auto custom-scrollbar">
                   {receivedSosAlerts.map(alert => (
                       <div key={alert.key} className="bg-white rounded-2xl p-4 text-left shadow-xl border border-red-100 flex items-center justify-between">
                          <div>
                              <p className="font-black text-slate-800 text-lg uppercase">{alert.name}</p>
                              <p className="text-sm text-slate-500 font-bold font-mono text-[10px]">NIK: {alert.nik}</p>
                              <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">
                                 {new Date(alert.time).toLocaleTimeString('id-ID')}
                              </p>
                          </div>
                          <button onClick={() => {
                             setActiveSubmenu('MAP_PPSU');
                             localStorage.removeItem(alert.key);
                             setReceivedSosAlerts(prev => prev.filter(a => a.key !== alert.key));
                             window.dispatchEvent(new Event('local-storage-update'));
                          }} className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl transition-all shadow-sm border border-red-100 flex flex-col items-center" title="Lihat Lokasi GPS">
                              <MapPinned size={20} />
                              <span className="text-[8px] font-bold uppercase mt-1">Detail</span>
                          </button>
                       </div>
                   ))}
               </div>

               <div className="flex w-full relative z-10">
                   <button 
                       onClick={() => {
                           receivedSosAlerts.forEach(a => localStorage.removeItem(a.key));
                           setReceivedSosAlerts([]);
                           window.dispatchEvent(new Event('local-storage-update'));
                       }} 
                       className="w-full py-4 bg-red-800 hover:bg-red-900 text-white font-black rounded-xl transition-all uppercase tracking-widest text-sm shadow-xl"
                   >
                       Tutup Semua Peringatan
                   </button>
               </div>
           </div>
        </div>
    )}

    </>
  );
};

export default App;
