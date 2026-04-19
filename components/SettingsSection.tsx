import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Image, 
  Type, 
  Layout, 
  Palette, 
  CheckCircle2, 
  Tag, 
  UploadCloud, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  Monitor,
  Settings as SettingsIcon,
  Calendar,
  MapPin,
  Clock,
  Smartphone,
  QrCode,
  MessageSquare,
  Power,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { SystemSettings } from '../types';
import { apiService } from '../services/api';

interface SettingsSectionProps {
  settings: SystemSettings;
  onUpdate: (s: SystemSettings) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'UMUM' | 'JADWAL' | 'WA_GATEWAY' | 'KEAMANAN'>('UMUM');
  const [isWaLoading, setIsWaLoading] = useState(false);
  
  // WA Gateway State
  const [waStatus, setWaStatus] = useState<{status: string, qrCode: string | null}>({ status: 'DISCONNECTED', qrCode: null });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Sync localSettings with settings prop ONLY if the user hasn't made changes yet (not dirty)
  useEffect(() => {
    if (!isDirty) {
      setLocalSettings(settings);
    }
  }, [settings, isDirty]);

  // WA Polling Effect
  useEffect(() => {
    let interval: any;
    if (activeTab === 'WA_GATEWAY') {
      const fetchStatus = async () => {
        const res = await apiService.getWaStatus();
        if (res) setWaStatus(res);
      };
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
        await apiService.updateSettings(localSettings);
        onUpdate(localSettings);
        setIsDirty(false); // Reset dirty flag after successful save
        setShowSuccessModal(true);
    } catch (error) {
        console.error("Failed to save settings:", error);
        alert("❌ Gagal menyimpan pengaturan ke database.");
    }
  };
   
  const handleDisconnect = async () => {
    if (window.confirm("Apakah Anda yakin ingin memutuskan koneksi WhatsApp? Sesi akan dihapus.")) {
       try {
           await apiService.logoutWa();
           alert("WhatsApp berhasil diputuskan.");
       } catch (err) {
           alert("Gagal memutuskan koneksi.");
       }
    }
  };

  const handleChange = (updater: (prev: SystemSettings) => SystemSettings) => {
    setLocalSettings(updater);
    setIsDirty(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000 * 1024) {
        alert("Gagal: Ukuran file logo terlalu besar. Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000 * 1024) {
        alert("Gagal: Ukuran file background terlalu besar. Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(prev => ({ ...prev, loginBackground: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-full bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight text-indigo-600">
               {isDirty && <span className="mr-2 inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
               Pengaturan Sistem {isDirty && <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg ml-2 uppercase">Unsaved</span>}
            </h2>
            <p className="text-slate-500 text-[11px] font-medium">Konfigurasi parameter identitas dan operasional aplikasi.</p>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                 <button 
                   type="button"
                   onClick={() => setActiveTab('UMUM')}
                   className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold transition-all
                     ${activeTab === 'UMUM' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <SettingsIcon size={14} /> UMUM
                 </button>
                 <button 
                   type="button"
                   onClick={() => setActiveTab('JADWAL')}
                   className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold transition-all
                     ${activeTab === 'JADWAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <Calendar size={14} /> JADWAL
                 </button>
                 <button 
                   type="button"
                   onClick={() => setActiveTab('WA_GATEWAY')}
                   className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold transition-all
                     ${activeTab === 'WA_GATEWAY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <Smartphone size={14} /> WA GATEWAY
                 </button>
                 <button 
                   type="button"
                   onClick={() => setActiveTab('KEAMANAN')}
                   className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold transition-all
                     ${activeTab === 'KEAMANAN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <ShieldCheck size={14} /> KEAMANAN
                 </button>
              </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'UMUM' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-sm">
                        <Type size={20} />
                    </div>
                    Identitas Sistem
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Nama Sistem</label>
                      <input 
                        type="text" 
                        value={localSettings.systemName}
                        onChange={(e) => handleChange(prev => ({...prev, systemName: e.target.value}))}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 shadow-inner transition-all focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Sub Nama / Tagline</label>
                      <input 
                        type="text" 
                        value={localSettings.subName}
                        onChange={(e) => handleChange(prev => ({...prev, subName: e.target.value}))}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 shadow-inner transition-all focus:bg-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Footer Copyright</label>
                        <input 
                          type="text" 
                          value={localSettings.footerText}
                          onChange={(e) => handleChange(prev => ({...prev, footerText: e.target.value}))}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 shadow-inner transition-all focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Versi Aplikasi</label>
                        <input 
                          type="text" 
                          value={localSettings.appVersion}
                          onChange={(e) => handleChange(prev => ({...prev, appVersion: e.target.value}))}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-center font-mono font-bold text-slate-700 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      type="button"
                      onClick={() => handleSave()}
                      className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isDirty ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}
                      disabled={!isDirty}
                    >
                       <Save size={18} /> {isDirty ? 'Simpan Pengaturan Umum' : 'Data Sudah Sesuai'}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-sm">
                        <Palette size={20} />
                    </div>
                    Tampilan & Tema
                  </h3>
                  <div className="flex items-center gap-8">
                    <div className="space-y-2 flex-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Warna Tema Utama</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          value={localSettings.themeColor}
                          onChange={(e) => handleChange(prev => ({...prev, themeColor: e.target.value}))}
                          className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-md p-1 bg-slate-100"
                        />
                        <span className="font-mono font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
                          {localSettings.themeColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <Image size={18} />
                    </div>
                    Logo Sistem
                  </h3>
                  <div className="flex flex-col items-center justify-center space-y-4">
                     <div className="w-full aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                        {localSettings.logo ? (
                          <img src={localSettings.logo} alt="Logo" className="w-full h-full object-contain p-6 drop-shadow-md" />
                        ) : (
                          <div className="text-center p-4">
                             <Layout size={40} className="mx-auto text-slate-200 mb-2" />
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Logo Belum Ada</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 cursor-pointer opacity-0" />
                     </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                        <Image size={18} />
                    </div>
                    Bg Login
                  </h3>
                  <div className="flex flex-col items-center justify-center space-y-4">
                     <div className="w-full h-32 bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                        {localSettings.loginBackground ? (
                          <img src={localSettings.loginBackground} alt="Bg" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                             <Image size={24} className="mx-auto text-slate-200 mb-1" />
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Default</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="absolute inset-0 cursor-pointer opacity-0" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'JADWAL' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                          <Monitor size={24} />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Konfigurasi Jadwal & Shift</h3>
                          <p className="text-slate-500 text-xs font-medium">Atur list zona tugas dan konfigurasi jam kerja PPSU.</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-12">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                           <div className="flex items-center gap-2">
                              <MapPin size={18} className="text-indigo-500" />
                              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">List Zona Tugas</label>
                           </div>
                           <button 
                             type="button" 
                             onClick={() => handleChange(prev => ({...prev, zonaList: [...(prev.zonaList || []), `Zona Baru ${ (prev.zonaList?.length || 0) + 1}`]}))}
                             className="text-[9px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                           >
                              + Tambah Zona
                           </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                           {localSettings.zonaList?.map((zona, idx) => (
                              <div key={idx} className="flex gap-3 items-center group">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                                 <input 
                                   type="text" 
                                   value={zona}
                                   onChange={(e) => {
                                      const newList = [...(localSettings.zonaList || [])];
                                      newList[idx] = e.target.value;
                                      handleChange(prev => ({...prev, zonaList: newList}));
                                   }}
                                   className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                 />
                                 <button 
                                   type="button" 
                                   onClick={() => handleChange(prev => ({...prev, zonaList: prev.zonaList?.filter((_, i) => i !== idx)}))}
                                   className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                 >
                                    <Trash2 size={20} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent w-full"></div>

                     <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                           <div className="flex items-center gap-2">
                              <Clock size={18} className="text-cyan-500" />
                              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">List Shift / Jam Kerja</label>
                           </div>
                           <button 
                             type="button" 
                             onClick={() => handleChange(prev => ({...prev, shiftConfig: [...(prev.shiftConfig || []), { name: 'New Shift', start: '08:00', end: '16:00' }]}))}
                             className="text-[9px] bg-cyan-50 text-cyan-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
                           >
                              + Tambah Shift
                           </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                           {localSettings.shiftConfig?.map((shift, idx) => (
                              <div key={idx} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-4 relative group shadow-inner">
                                 <button 
                                   type="button" 
                                   onClick={() => handleChange(prev => ({...prev, shiftConfig: prev.shiftConfig?.filter((_, i) => i !== idx)}))}
                                   className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Shift</label>
                                    <input 
                                      type="text" 
                                      value={shift.name}
                                      onChange={(e) => {
                                         const newList = [...(localSettings.shiftConfig || [])];
                                         newList[idx] = { ...newList[idx], name: e.target.value };
                                         handleChange(prev => ({...prev, shiftConfig: newList}));
                                      }}
                                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-black uppercase outline-none shadow-sm focus:border-cyan-400"
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mulai</label>
                                       <input 
                                         type="time" 
                                         value={shift.start}
                                         onChange={(e) => {
                                            const newList = [...(localSettings.shiftConfig || [])];
                                            newList[idx] = { ...newList[idx], start: e.target.value };
                                            handleChange(prev => ({...prev, shiftConfig: newList}));
                                         }}
                                         className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none shadow-sm"
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai</label>
                                       <input 
                                         type="time" 
                                         value={shift.end}
                                         onChange={(e) => {
                                            const newList = [...(localSettings.shiftConfig || [])];
                                            newList[idx] = { ...newList[idx], end: e.target.value };
                                            handleChange(prev => ({...prev, shiftConfig: newList}));
                                         }}
                                         className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none shadow-sm"
                                       />
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                      <div className="mt-4 flex justify-end">
                        <button 
                          type="button"
                          onClick={() => handleSave()}
                          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isDirty ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100' : 'bg-slate-100 text-slate-400'}`}
                        >
                           <Save size={18} /> {isDirty ? 'Simpan Konfigurasi Jadwal' : 'Jadwal Sesuai'}
                        </button>
                      </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'WA_GATEWAY' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col items-center justify-center text-center gap-6">
                     <div className="relative">
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg transition-all ${waStatus.status === 'CONNECTED' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                           <Smartphone size={48} />
                        </div>
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-slate-50 flex items-center justify-center ${waStatus.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                           {waStatus.status === 'CONNECTED' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} /> }
                        </div>
                     </div>
                     
                     <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Status WhatsApp</h3>
                        <p className={`text-xs font-black uppercase tracking-widest mt-1 ${waStatus.status === 'CONNECTED' ? 'text-emerald-500' : 'text-slate-400'}`}>
                           {waStatus.status === 'CONNECTED' ? 'TERKONEKSI' : waStatus.status === 'QR_READY' ? 'MENUNGGU SCAN' : 'TERPUTUS'}
                        </p>
                     </div>

                     {waStatus.qrCode && (
                        <div className="space-y-4 flex flex-col items-center">
                           <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95">
                              <img src={waStatus.qrCode} alt="WhatsApp QR" className="w-48 h-48" />
                              <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center justify-center gap-2">
                                 <QrCode size={12} /> Scan QR dengan WhatsApp Anda
                              </p>
                           </div>
                           <button 
                             type="button"
                             onClick={() => apiService.initWa(true)}
                             className="text-[10px] font-black text-rose-500 bg-rose-50 px-4 py-2 rounded-xl hover:bg-rose-100 transition-all flex items-center gap-2"
                           >
                              <RefreshCw size={12} /> ULANG QR CODE
                           </button>
                        </div>
                     )}

                     {!waStatus.qrCode && waStatus.status !== 'CONNECTED' && (
                        <button 
                           type="button"
                           disabled={isWaLoading}
                           onClick={async () => {
                              setIsWaLoading(true);
                              try {
                                 await apiService.initWa(true);
                              } finally {
                                 setTimeout(() => setIsWaLoading(false), 5000); 
                              }
                           }}
                           className={`flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all ${isWaLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                           <RefreshCw size={16} className={isWaLoading ? 'animate-spin' : ''} /> 
                           {isWaLoading ? 'SEDANG MENYIAPKAN...' : 'HUBUNGKAN WA'}
                        </button>
                     )}

                     {waStatus.status === 'CONNECTED' && (
                        <button 
                           type="button"
                           onClick={handleDisconnect}
                           className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-rose-100 transition-all"
                        >
                           <Power size={16} /> DISCONNECT
                        </button>
                     )}
                  </div>

                  <div className="space-y-6">
                     <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                           <MessageSquare size={18} className="text-indigo-500" /> Pengaturan Notifikasi
                        </h4>
                        
                        <div className="space-y-4">
                           <div className="space-y-1.5 mb-6">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nomor WA Admin / Laporan</label>
                              <input 
                                 type="text" 
                                 placeholder="Contoh: 08123456789 atau 6281234..."
                                 value={localSettings.waGatewayConfig?.adminPhone || ''}
                                 onChange={(e) => {
                                    const config = { ...localSettings.waGatewayConfig, adminPhone: e.target.value } as any;
                                    handleChange(prev => ({...prev, waGatewayConfig: config}));
                                 }}
                                 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm shadow-inner"
                              />
                               <p className="text-[9px] text-slate-400 font-bold mt-1 pl-1">Sistem akan mengirimkan laporan absensi & SOS ke nomor ini.</p>
                           </div>

                           <div className="space-y-1.5 mb-6">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Delay Antar Pesan (detik)</label>
                              <input 
                                 type="number" 
                                 min="1"
                                 placeholder="Contoh: 3"
                                 value={localSettings.waGatewayConfig?.messageDelay || 0}
                                 onChange={(e) => {
                                    const config = { ...localSettings.waGatewayConfig, messageDelay: parseInt(e.target.value) || 0 } as any;
                                    handleChange(prev => ({...prev, waGatewayConfig: config}));
                                 }}
                                 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm shadow-inner"
                              />
                               <p className="text-[9px] text-slate-400 font-bold mt-1 pl-1">Jeda waktu antar pengiriman pesan untuk menghindari blokir (SPAM).</p>
                           </div>

                           {[
                              { id: 'enableAnnouncements', label: 'Notifikasi Pengumuman', desc: 'Kirim otomatis ke grup/personil saat pengumuman dibuat.' },
                              { id: 'enableAttendance', label: 'Notifikasi Absensi', desc: 'Teruskan laporan masuk/pulang personil ke WA Pimpinan.' },
                              { id: 'enableTasks', label: 'Notifikasi Penugasan', desc: 'Kirim info tugas baru langsung ke WA Anggota terkait.' }
                           ].map(item => (
                              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100">
                                 <div>
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.label}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.desc}</p>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={() => {
                                       const config = { ...localSettings.waGatewayConfig } as any;
                                       config[item.id] = !config[item.id];
                                       handleChange(prev => ({...prev, waGatewayConfig: config}));
                                    }}
                                    className={`w-12 h-6 rounded-full relative transition-all ${localSettings.waGatewayConfig?.[item.id as keyof typeof localSettings.waGatewayConfig] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                 >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.waGatewayConfig?.[item.id as keyof typeof localSettings.waGatewayConfig] ? 'left-7' : 'left-1'}`} />
                                 </button>
                              </div>
                           ))}

                            <div className="pt-4">
                              <button 
                                type="button"
                                onClick={() => handleSave()}
                                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isDirty ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}
                              >
                                <Save size={20} /> {isDirty ? 'Simpan Pengaturan WhatsApp' : 'Statistik WA Sesuai'}
                              </button>
                            </div>
                         </div>
                      </div>

                      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                        <div className="flex gap-3">
                           <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                           <div>
                              <p className="text-xs font-black text-amber-700 uppercase tracking-tight">Penting</p>
                              <p className="text-[10px] font-bold text-amber-600 mt-1 leading-relaxed">
                                 Pastikan koneksi internet stabil saat proses scan QR. Sistem ini menggunakan teknologi WEB Bridge, pastikan perangkat tetap terhubung di background.
                              </p>
                           </div>
                        </div>
                      </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'KEAMANAN' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                      <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">
                            <ShieldCheck size={28} />
                        </div>
                        Keamanan & Integritas Data
                      </h3>
                      
                      <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-rose-100 transition-all">
                           <div>
                              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Enforce Server Time</p>
                              <p className="text-[11px] font-bold text-slate-400 mt-1">Gunakan waktu dari server untuk mencegah manipulasi jam di HP personil.</p>
                           </div>
                           <button
                              type="button"
                              onClick={() => {
                                 const config = { ...localSettings.securityConfig, enforceServerTime: !localSettings.securityConfig?.enforceServerTime } as any;
                                 handleChange(prev => ({...prev, securityConfig: config}));
                              }}
                              className={`w-14 h-7 rounded-full relative transition-all ${localSettings.securityConfig?.enforceServerTime ? 'bg-rose-500' : 'bg-slate-300'}`}
                           >
                              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localSettings.securityConfig?.enforceServerTime ? 'left-8' : 'left-1'}`} />
                           </button>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-rose-100 transition-all">
                           <div>
                              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Detect Mock GPS (Heuristic)</p>
                              <p className="text-[11px] font-bold text-slate-400 mt-1">Deteksi penggunaan aplikasi Fake GPS / Manipulasi Lokasi.</p>
                           </div>
                           <button
                              type="button"
                              onClick={() => {
                                 const config = { ...localSettings.securityConfig, detectMockGps: !localSettings.securityConfig?.detectMockGps } as any;
                                 handleChange(prev => ({...prev, securityConfig: config}));
                              }}
                              className={`w-14 h-7 rounded-full relative transition-all ${localSettings.securityConfig?.detectMockGps ? 'bg-rose-500' : 'bg-slate-300'}`}
                           >
                              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localSettings.securityConfig?.detectMockGps ? 'left-8' : 'left-1'}`} />
                           </button>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-rose-100 transition-all">
                           <div>
                              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Lock on Mock Detection</p>
                              <p className="text-[11px] font-bold text-slate-400 mt-1">Kunci tombol absen jika sistem mendeteksi manipulasi GPS.</p>
                           </div>
                           <button
                              type="button"
                              onClick={() => {
                                 const config = { ...localSettings.securityConfig, lockMockGps: !localSettings.securityConfig?.lockMockGps } as any;
                                 handleChange(prev => ({...prev, securityConfig: config}));
                              }}
                              className={`w-14 h-7 rounded-full relative transition-all ${localSettings.securityConfig?.lockMockGps ? 'bg-rose-500' : 'bg-slate-300'}`}
                           >
                              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localSettings.securityConfig?.lockMockGps ? 'left-8' : 'left-1'}`} />
                           </button>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-black text-slate-800 uppercase tracking-tight">GPS Accuracy Threshold</p>
                                 <p className="text-[11px] font-bold text-slate-400 mt-1">Akurasi minimal (dalam meter) untuk mengizinkan absen.</p>
                              </div>
                              <span className="text-lg font-black text-rose-500">{localSettings.securityConfig?.gpsAccuracyThreshold || 50}m</span>
                           </div>
                           <input 
                              type="range" 
                              min="5" 
                              max="200" 
                              step="5"
                              value={localSettings.securityConfig?.gpsAccuracyThreshold || 50}
                              onChange={(e) => {
                                 const config = { ...localSettings.securityConfig, gpsAccuracyThreshold: parseInt(e.target.value) } as any;
                                 handleChange(prev => ({...prev, securityConfig: config}));
                              }}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                           />
                           <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest pt-1">
                              <span>Sangat Akurat (5m)</span>
                              <span>Standar (50m)</span>
                              <span>Longgar (200m)</span>
                           </div>
                        </div>
                      </div>

                      <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                        <button 
                          type="button"
                          onClick={() => handleSave()}
                          className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isDirty ? 'bg-rose-600 text-white shadow-xl shadow-rose-100' : 'bg-slate-100 text-slate-400'}`}
                          disabled={!isDirty}
                        >
                           <Save size={20} /> {isDirty ? 'Simpan Konfigurasi Keamanan' : 'Sistem Sudah Aman'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Lock size={120} />
                       </div>
                       <div className="relative z-10">
                          <h4 className="text-lg font-black uppercase tracking-tight mb-4">Pusat Integritas</h4>
                          <p className="text-slate-400 text-xs leading-relaxed font-medium mb-6">
                             Sistem keamanan ini didesain untuk memastikan setiap data absensi yang masuk adalah valid, dilakukan pada waktu yang tepat, dan lokasi yang sebenarnya.
                          </p>
                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                   <CheckCircle2 size={16} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">Anti-Time Cheat Active</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                   <CheckCircle2 size={16} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">GPS Signature Verified</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                   <CheckCircle2 size={16} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">Mock GPS Guard Enabled</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100">
                       <div className="flex gap-3">
                          <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                          <p className="text-[10px] font-bold text-rose-700 leading-relaxed">
                             Pengetatan akurasi GPS di bawah 20m dapat menyulitkan personil di dalam ruangan atau gedung dengan sinyal lemah. Gunakan threshold 50-100m untuk keseimbangan terbaik.
                          </p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <Layout size={16} />
             </div>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
               {localSettings.footerText}
             </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-slate-100">
              V{localSettings.appVersion}
            </span>
            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em]">
              System Core Ready
            </span>
          </div>
        </div>
      </div>
      
      {/* Success Save Modal */}
      {showSuccessModal && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xs rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 p-8 text-center">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                  <CheckCircle2 size={40} className="animate-in slide-in-from-bottom-2" />
               </div>
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Simpan Berhasil</h3>
               <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8 uppercase tracking-widest">
                  Pengaturan sistem telah diperbarui dan disimpan dengan aman ke database pusat.
               </p>
               <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95"
               >
                  Selesai
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default SettingsSection;
