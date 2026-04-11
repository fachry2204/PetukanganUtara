import React, { useState, useEffect } from 'react';
import { 
  UserCircle,
  AlertTriangle,
  MapPinned
} from 'lucide-react';
import { 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { 
  User, 
  SystemSettings, 
  TugasPPSU, 
  Staff, 
  Announcement, 
  AttendanceRecord 
} from './types';
import { apiService } from './services/api';
import LoginPage from './components/LoginPage';
import LayoutAdmin from './components/LayoutAdmin';
import LayoutPPSU from './components/LayoutPPSU';

// Section Components
import StaffDashboardSection from './components/StaffDashboardSection';
import AnnouncementSection from './components/AnnouncementSection';
import PPSUSection from './components/PPSUSection';
import AdminReportsSection from './components/AdminReportsSection';
import MapSection from './components/MapSection';
import UserManagementSection from './components/UserManagementSection';
import SettingsSection from './components/SettingsSection';
import AttendanceSection from './components/AttendanceSection';
import PPSUTaskInputSection from './components/PPSUTaskInputSection';
import PPSUMyReportsSection from './components/PPSUMyReportsSection';
import ScheduleManagementSection from './components/ScheduleManagementSection';

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

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadData('app_session', null)); 
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: 'SiPetut',
    subName: 'Kelurahan Petukangan Utara',
    footerText: '\u00A9 2026 Kelurahan Petukangan Utara. All Rights Reserved.',
    appVersion: '1.0.0',
    themeColor: '#f97316',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Jakarta.svg',
    loginBackground: null,
  });

  const [tugasList, setTugasList] = useState<TugasPPSU[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [receivedSosAlerts, setReceivedSosAlerts] = useState<any[]>([]);
  
  const [showSosAlertModal, setShowSosAlertModal] = useState(false);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  // SOS PPSU Local States
  const [isSosActive, setIsSosActive] = useState(false);
  const [isSosSent, setIsSosSent] = useState(false);
  const [isSosLoading, setIsSosLoading] = useState(false);

  const fetchAllData = async () => {
    try {
      const [dataTugas, dataStaff, dataUsers, dataAnn, dataAtt, dataSos, dataSettings] = await Promise.all([
        apiService.getTugasPPSU(),
        apiService.getStaff(),
        apiService.getUsers(),
        apiService.getAnnouncements(),
        apiService.getAttendance(),
        apiService.getSos(),
        apiService.getSettings()
      ]);

      if (dataTugas) setTugasList(dataTugas);
      if (dataStaff) setStaffList(dataStaff);
      if (dataUsers) setUsers(dataUsers);
      if (dataAnn) setAnnouncements(dataAnn);
      if (dataAtt) setAttendanceRecords(dataAtt);
      if (dataSos) setReceivedSosAlerts(dataSos.map((s: any) => ({ key: s.alert_key, ...s })));
      if (dataSettings) setSettings(dataSettings);
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { 
    if (currentUser) {
        saveData('app_session', currentUser); 
    } else {
        localStorage.removeItem('app_session');
    }
  }, [currentUser]);
  
    // Settings now handled by API and onUpdate in SettingsSection
  
  // Admin SOS Detection
  useEffect(() => {
    if (!currentUser || currentUser.role === 'PPSU') return;
    if (receivedSosAlerts.length > lastAlertCount) {
        setShowSosAlertModal(true);
    }
    setLastAlertCount(receivedSosAlerts.length);
  }, [receivedSosAlerts, currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'PPSU') {
        navigate('/ppsu/dashboard');
    } else {
        navigate('/admin/dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const handleResolveSos = async (key: string) => {
    try {
        await apiService.resolveSos(key);
        setReceivedSosAlerts(prev => prev.filter(a => a.key !== key));
    } catch (error) {
        console.error('Failed to resolve SOS:', error);
    }
  };

  const handlePPSUSosClick = () => {
    if (isSosSent) return;
    if (!isSosActive) {
        setIsSosActive(true);
    } else {
        triggerSosSignal();
    }
  };

  const handlePPSUSosCancel = () => {
    setIsSosActive(false);
  };

  const triggerSosSignal = () => {
    setIsSosLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            await apiService.createSos({
                key: `sos_alert_${Date.now()}`,
                nik: currentUser?.nik,
                name: currentUser?.name || currentUser?.username,
                time: new Date().toISOString(),
                latitude,
                longitude
            });
            setIsSosLoading(false);
            setIsSosSent(true);
            // We no longer auto-reset isSosSent here because we want to show the confirmation
            // and then transition to Danger Mode.
            setTimeout(() => {
                setIsSosActive(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to send SOS:', error);
            setIsSosLoading(false);
            setIsSosActive(false);
        }
    }, (err) => {
        setIsSosActive(false);
        setIsSosLoading(false);
        alert('Gagal mendapatkan lokasi GPS. SOS tidak dapat dikirim.');
    });
  };

  const isAdmin = currentUser && currentUser.role !== 'PPSU';
  const isPPSU = currentUser && currentUser.role === 'PPSU';

  return (
    <>
      <Routes>
        <Route path="/login" element={
            currentUser ? 
            <Navigate to={isPPSU ? '/ppsu/dashboard' : '/admin/dashboard'} replace /> : 
            <LoginPage onLogin={handleLoginSuccess} settings={settings} users={users} />
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
            isAdmin ? 
            <LayoutAdmin 
                user={currentUser!}
                settings={settings}
                setSettings={setSettings}
                onLogout={handleLogout}
            /> : 
            <Navigate to="/login" replace />
        }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={
              <StaffDashboardSection 
                user={currentUser!} 
                staff={staffList} 
                tugasList={tugasList} 
                announcements={announcements} 
                sosAlerts={receivedSosAlerts}
                onResolveSos={handleResolveSos}
                onViewLocation={() => navigate('/admin/map')}
              />
            } />
            <Route path="pengumuman" element={<AnnouncementSection user={currentUser!} users={users} announcements={announcements} setAnnouncements={setAnnouncements} />} />
            <Route path="ppsu" element={<PPSUSection user={currentUser!} staffList={staffList} setStaffList={setStaffList} />} />
            <Route path="absen" element={<AdminReportsSection mode="ABSEN" attendanceRecords={attendanceRecords} tugasList={tugasList} user={currentUser!} users={users} staff={staffList} />} />
            <Route path="tugas" element={<AdminReportsSection mode="TUGAS" attendanceRecords={attendanceRecords} tugasList={tugasList} onUpdateTugas={(updated) => setTugasList(prev => prev.map(t => t.id === updated.id ? updated : t))} user={currentUser!} users={users} staff={staffList} />} />
            <Route path="jadwal" element={<ScheduleManagementSection staffList={staffList} settings={settings} />} />
            <Route path="report" element={<AdminReportsSection mode="FULL_REPORT" attendanceRecords={attendanceRecords} tugasList={tugasList} user={currentUser!} users={users} staff={staffList} />} />
            <Route path="users" element={<UserManagementSection users={users} setUsers={setUsers} initialTab="SEMUA" />} />
            <Route path="settings" element={<SettingsSection settings={settings} onUpdate={setSettings} />} />
        </Route>

        {/* PPSU Routes */}
        <Route path="/ppsu" element={
            isPPSU ? 
            <LayoutPPSU 
                user={currentUser!}
                onLogout={handleLogout}
                onSosClick={handlePPSUSosClick}
                isSosLoading={isSosLoading}
                isSosSent={isSosSent}
                isSosActive={isSosActive}
                onSosCancel={handlePPSUSosCancel}
                isDangerMode={!!receivedSosAlerts.find(a => a.nik === currentUser?.nik)}
                onResolveSos={handleResolveSos}
                sosAlertKey={receivedSosAlerts.find(a => a.nik === currentUser?.nik)?.key}
                setIsSosSent={setIsSosSent}
            /> : 
            <Navigate to="/login" replace />
        }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={
              <PPSUSection user={currentUser!} staffList={staffList} setStaffList={setStaffList} attendanceRecords={attendanceRecords} announcements={announcements} />
            } />
            <Route path="absen" element={
              <AttendanceSection 
                user={currentUser!} 
                attendanceRecords={attendanceRecords} 
                onRecord={(rec) => setAttendanceRecords([rec, ...attendanceRecords])} 
              />
            } />
            <Route path="tugas" element={
              <PPSUTaskInputSection 
                user={currentUser!} 
                tugasList={tugasList} 
                setTugasList={setTugasList} 
                attendanceRecords={attendanceRecords}
              />
            } />
            <Route path="history" element={
              <PPSUMyReportsSection 
                user={currentUser!} 
                tugasList={tugasList} 
                attendanceRecords={attendanceRecords}
              />
            } />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* SOS Alert Modal */}
      {showSosAlertModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 relative border-4 border-red-500">
               <div className="bg-red-600 p-10 flex flex-col items-center text-center relative">
                   <div className="w-24 h-24 rounded-full bg-white text-red-600 flex items-center justify-center mb-6 relative z-10 shadow-lg">
                       <AlertTriangle size={56} className="animate-pulse" />
                   </div>
                   <h2 className="text-3xl font-black text-white relative z-10 mb-2 leading-tight tracking-tight uppercase">Peringatan Darurat!</h2>
                   <div className="space-y-3 w-full relative z-10 mb-8 max-h-64 overflow-y-auto custom-scrollbar">
                       {receivedSosAlerts.map(alert => (
                           <div key={alert.key} className="bg-white rounded-2xl p-4 text-left shadow-xl border border-red-100 flex items-center justify-between">
                               <div>
                                   <p className="font-black text-slate-800 text-lg uppercase">{alert.name}</p>
                                   <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">{new Date(alert.time).toLocaleTimeString('id-ID')}</p>
                               </div>
                               <button onClick={() => { setShowSosAlertModal(false); navigate('/admin/map'); }} className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl transition-all shadow-sm border border-red-100">
                                   <MapPinned size={20} />
                               </button>
                           </div>
                       ))}
                   </div>
                   <button onClick={() => setShowSosAlertModal(false)} className="w-full py-4 bg-red-800 hover:bg-red-900 text-white font-black rounded-xl transition-all uppercase tracking-widest text-sm shadow-xl">Tutup</button>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default App;
