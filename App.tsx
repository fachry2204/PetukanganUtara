import React, { useState, useEffect } from 'react';
import { 
  UserCircle,
  AlertTriangle,
  MapPinned
} from 'lucide-react';
import { 
  User, 
  SystemSettings, 
  TugasPPSU, 
  Staff, 
  Role, 
  Announcement, 
  AttendanceRecord 
} from './types';
import { apiService } from './services/api';
import LoginPage from './components/LoginPage';
import LayoutAdmin from './components/LayoutAdmin';
import LayoutPPSU from './components/LayoutPPSU';

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
      const [dataTugas, dataStaff, dataUsers, dataAnn, dataAtt, dataSos] = await Promise.all([
        apiService.getTugasPPSU(),
        apiService.getStaff(),
        apiService.getUsers(),
        apiService.getAnnouncements(),
        apiService.getAttendance(),
        apiService.getSos()
      ]);

      if (dataTugas) setTugasList(dataTugas);
      if (dataStaff) setStaffList(dataStaff);
      if (dataUsers) setUsers(dataUsers);
      if (dataAnn) setAnnouncements(dataAnn);
      if (dataAtt) setAttendanceRecords(dataAtt);
      if (dataSos) setReceivedSosAlerts(dataSos.map((s: any) => ({ key: s.alert_key, ...s })));
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
  
  useEffect(() => { saveData('app_settings', settings); }, [settings]);
  
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
            setTimeout(() => {
                setIsSosActive(false);
                setIsSosSent(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to send SOS:', error);
            setIsSosLoading(false);
            setIsSosActive(false);
        }
    }, (err) => {
        // Fallback without GPS
        setIsSosActive(false);
        setIsSosLoading(false);
        alert('Gagal mendapatkan lokasi GPS. SOS tidak dapat dikirim.');
    });
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} settings={settings} />;
  }

  return (
    <>
      {currentUser.role === 'PPSU' ? (
        <LayoutPPSU 
          user={currentUser}
          staffList={staffList}
          setStaffList={setStaffList}
          tugasList={tugasList}
          setTugasList={setTugasList}
          announcements={announcements}
          attendanceRecords={attendanceRecords}
          onRecordAttendance={(rec) => setAttendanceRecords([rec, ...attendanceRecords])}
          onLogout={handleLogout}
          onSosClick={handlePPSUSosClick}
          isSosLoading={isSosLoading}
          isSosSent={isSosSent}
          isSosActive={isSosActive}
        />
      ) : (
        <LayoutAdmin 
          user={currentUser}
          settings={settings}
          setSettings={setSettings}
          staffList={staffList}
          setStaffList={setStaffList}
          tugasList={tugasList}
          setTugasList={setTugasList}
          announcements={announcements}
          setAnnouncements={setAnnouncements}
          attendanceRecords={attendanceRecords}
          setAttendanceRecords={setAttendanceRecords}
          users={users}
          setUsers={setUsers}
          sosAlerts={receivedSosAlerts}
          onResolveSos={handleResolveSos}
          onLogout={handleLogout}
        />
      )}

      {/* SOS Alert Modal for Global (usually for Admin/Staff) */}
      {showSosAlertModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 relative border-4 border-red-500">
               <div className="bg-red-600 p-10 flex flex-col items-center text-center relative">
                   <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                       <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px] animate-pulse"></div>
                   </div>
                   
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
                                 setShowSosAlertModal(false);
                              }} className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl transition-all shadow-sm border border-red-100 flex flex-col items-center" title="Buka Dashboard">
                                  <MapPinned size={20} />
                                  <span className="text-[8px] font-bold uppercase mt-1">Peta</span>
                              </button>
                           </div>
                       ))}
                   </div>

                   <div className="flex w-full relative z-10">
                       <button 
                           onClick={() => {
                               setShowSosAlertModal(false);
                           }} 
                           className="w-full py-4 bg-red-800 hover:bg-red-900 text-white font-black rounded-xl transition-all uppercase tracking-widest text-sm shadow-xl"
                       >
                           Tutup Panel Darurat
                       </button>
                   </div>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default App;
