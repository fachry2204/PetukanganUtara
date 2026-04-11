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
  Clock
} from 'lucide-react';
import { SystemSettings } from '../types';
import { apiService } from '../services/api';

interface SettingsSectionProps {
  settings: SystemSettings;
  onUpdate: (s: SystemSettings) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'UMUM' | 'JADWAL'>('UMUM');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await apiService.updateSettings(localSettings);
        onUpdate(localSettings);
        setIsSaved(true);
        alert("Pengaturan sistem berhasil disimpan ke database!");
        setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
        console.error("Failed to save settings:", error);
        alert("Gagal menyimpan pengaturan ke database.");
    }
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
        setLocalSettings(prev => ({ ...prev, logo: reader.result as string }));
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
        setLocalSettings(prev => ({ ...prev, loginBackground: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-full bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pengaturan Sistem</h2>
            <p className="text-slate-500 text-[11px] font-medium">Konfigurasi parameter identitas dan operasional aplikasi.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
             <button 
               onClick={() => setActiveTab('UMUM')}
               className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold transition-all
                 ${activeTab === 'UMUM' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <SettingsIcon size={14} /> UMUM
             </button>
             <button 
               onClick={() => setActiveTab('JADWAL')}
               className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold transition-all
                 ${activeTab === 'JADWAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Calendar size={14} /> JADWAL PPSU
             </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'UMUM' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - General Info */}
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
                        onChange={(e) => setLocalSettings(prev => ({...prev, systemName: e.target.value}))}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 shadow-inner transition-all focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Sub Nama / Tagline</label>
                      <input 
                        type="text" 
                        value={localSettings.subName}
                        onChange={(e) => setLocalSettings(prev => ({...prev, subName: e.target.value}))}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 shadow-inner transition-all focus:bg-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Footer Copyright</label>
                        <input 
                          type="text" 
                          value={localSettings.footerText}
                          onChange={(e) => setLocalSettings(prev => ({...prev, footerText: e.target.value}))}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 shadow-inner transition-all focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Versi Aplikasi</label>
                        <input 
                          type="text" 
                          value={localSettings.appVersion}
                          onChange={(e) => setLocalSettings(prev => ({...prev, appVersion: e.target.value}))}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-center font-mono font-bold text-slate-700 shadow-inner"
                        />
                      </div>
                    </div>
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
                          onChange={(e) => setLocalSettings(prev => ({...prev, themeColor: e.target.value}))}
                          className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-md p-1 bg-slate-100"
                        />
                        <span className="font-mono font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
                          {localSettings.themeColor}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-6 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
                       <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest pl-1">Preview Elemen</p>
                       <button 
                          type="button"
                          style={{ backgroundColor: localSettings.themeColor }}
                          className="px-6 py-3 text-white text-xs font-black rounded-xl shadow-lg ring-4 ring-white transition-transform active:scale-95 uppercase tracking-widest"
                       >
                          Simpan Data
                       </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Images */}
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
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                           <p className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                              <UploadCloud size={16} /> Upload New
                           </p>
                        </div>
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
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <UploadCloud size={20} className="text-white" />
                        </div>
                        <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="absolute inset-0 cursor-pointer opacity-0" />
                     </div>
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save size={18} /> SIMPAN SEMUA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               {/* TAB JADWAL content */}
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
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Save size={18} /> SIMPAN DATA JADWAL
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     {/* Zona Tugas Management */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                           <div className="flex items-center gap-2">
                              <MapPin size={18} className="text-indigo-500" />
                              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">List Zona Tugas</label>
                           </div>
                           <button 
                             type="button" 
                             onClick={() => setLocalSettings(prev => ({...prev, zonaList: [...(prev.zonaList || []), `Zona Baru ${ (prev.zonaList?.length || 0) + 1}`]}))}
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
                                      setLocalSettings(prev => ({...prev, zonaList: newList}));
                                   }}
                                   className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                                 />
                                 <button 
                                   type="button" 
                                   onClick={() => setLocalSettings(prev => ({...prev, zonaList: prev.zonaList?.filter((_, i) => i !== idx)}))}
                                   className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                 >
                                    <Trash2 size={20} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Shift Config Management */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                           <div className="flex items-center gap-2">
                              <Clock size={18} className="text-cyan-500" />
                              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">List Shift / Jam Kerja</label>
                           </div>
                           <button 
                             type="button" 
                             onClick={() => setLocalSettings(prev => ({...prev, shiftConfig: [...(prev.shiftConfig || []), { name: 'New Shift', start: '08:00', end: '16:00' }]}))}
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
                                   onClick={() => setLocalSettings(prev => ({...prev, shiftConfig: prev.shiftConfig?.filter((_, i) => i !== idx)}))}
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
                                         setLocalSettings(prev => ({...prev, shiftConfig: newList}));
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
                                            setLocalSettings(prev => ({...prev, shiftConfig: newList}));
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
                                            setLocalSettings(prev => ({...prev, shiftConfig: newList}));
                                         }}
                                         className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none shadow-sm"
                                       />
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </form>

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
    </div>
  );
};

export default SettingsSection;
