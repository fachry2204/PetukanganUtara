
import React, { useState, useEffect } from 'react';
import { Save, Image, Type, Layout, Palette, CheckCircle2, Tag, UploadCloud, AlertTriangle, Database, Trash2, RefreshCw, Monitor } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsSectionProps {
  settings: SystemSettings;
  onUpdate: React.Dispatch<React.SetStateAction<SystemSettings>>;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [storageUsage, setStorageUsage] = useState<string>('0 KB');

  // Sync local state if props change (optional, but good for consistency)
  useEffect(() => {
    setLocalSettings(settings);
    calculateStorageUsage();
  }, [settings]);

  const calculateStorageUsage = () => {
    let total = 0;
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += ((localStorage[key].length + key.length) * 2);
        }
    }
    const kb = total / 1024;
    setStorageUsage(kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(localSettings);
    setIsSaved(true);
    // Explicit alert as requested
    alert("Pengaturan sistem berhasil disimpan!");
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate Size (Max 300KB to be very safe for localStorage)
      if (file.size > 300 * 1024) {
        alert("Gagal: Ukuran file logo terlalu besar. Harap gunakan gambar dibawah 300KB agar dapat disimpan.");
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
      // Validate Size (Max 300KB)
      if (file.size > 300 * 1024) {
        alert("Gagal: Ukuran file background terlalu besar. Harap gunakan gambar dibawah 300KB agar dapat disimpan.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, loginBackground: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnjunganBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 300 * 1024) {
        alert("Gagal: Ukuran file background anjungan terlalu besar (Maks 300KB).");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, anjunganBackground: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDatabase = () => {
    if (confirm("PERINGATAN: Tindakan ini akan MENGHAPUS SEMUA DATA yang tersimpan (User, Warga, Laporan, Staff) dan mengembalikannya ke data awal (Mock Data).\n\nApakah Anda yakin?")) {
        try {
            // Remove specific keys
            localStorage.removeItem('app_users');
            localStorage.removeItem('app_reports');
            localStorage.removeItem('app_staff');
            localStorage.removeItem('app_citizens');
            // Keep session and settings usually, but let's keep settings
            // localStorage.removeItem('app_session'); // Force logout? Maybe better not to abrupt
            alert("Database berhasil di-reset. Halaman akan dimuat ulang.");
            window.location.reload();
        } catch (e) {
            console.error("Failed to reset", e);
            alert("Gagal mereset database.");
        }
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h2>
          {isSaved && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 size={18} />
              <span className="text-sm font-bold">Pengaturan Berhasil Disimpan!</span>
            </div>
          )}
        </div>

        {/* Warning Banner regarding Image Size */}
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
           <AlertTriangle size={20} className="shrink-0 mt-0.5" />
           <div className="text-sm">
              <p className="font-bold">Perhatian tentang Penyimpanan Gambar</p>
              <p className="opacity-90">Karena keterbatasan penyimpanan lokal browser (LocalStorage), harap gunakan Logo dan Background dengan ukuran kecil (maksimal 300KB). Jika file terlalu besar, pengaturan mungkin akan kembali ke default setelah reload.</p>
           </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - General Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Type size={20} className="text-orange-500" /> Identitas Sistem
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600">Nama Sistem</label>
                    <input 
                      type="text" 
                      value={localSettings.systemName}
                      onChange={(e) => setLocalSettings(prev => ({...prev, systemName: e.target.value}))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600">Sub Nama / Tagline</label>
                    <input 
                      type="text" 
                      value={localSettings.subName}
                      onChange={(e) => setLocalSettings(prev => ({...prev, subName: e.target.value}))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-bold text-slate-600">Footer Copyright</label>
                      <input 
                        type="text" 
                        value={localSettings.footerText}
                        onChange={(e) => setLocalSettings(prev => ({...prev, footerText: e.target.value}))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-600 flex items-center gap-1">
                        <Tag size={14} className="text-slate-400" /> Versi Aplikasi
                      </label>
                      <input 
                        type="text" 
                        value={localSettings.appVersion}
                        onChange={(e) => setLocalSettings(prev => ({...prev, appVersion: e.target.value}))}
                        placeholder="1.0.0"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Palette size={20} className="text-orange-500" /> Tampilan & Tema
                </h3>
                <div className="flex items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <label className="text-sm font-bold text-slate-600">Warna Tema Utama</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={localSettings.themeColor}
                        onChange={(e) => setLocalSettings(prev => ({...prev, themeColor: e.target.value}))}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200 p-1"
                      />
                      <span className="font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        {localSettings.themeColor}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200">
                     <p className="text-xs text-slate-400 mb-2">Preview Tombol</p>
                     <button 
                        type="button"
                        style={{ backgroundColor: localSettings.themeColor }}
                        className="px-4 py-2 text-white text-sm font-bold rounded-lg shadow-sm w-full"
                     >
                        Contoh Tombol
                     </button>
                  </div>
                </div>
              </div>

              {/* Database Management Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                  <Database size={20} className="text-red-500" /> Manajemen Database Local
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div>
                        <p className="text-sm font-bold text-red-900">Reset Data Aplikasi</p>
                        <p className="text-xs text-red-700 mt-1">
                            Gunakan jika data bermasalah atau penyimpanan penuh ({storageUsage} terpakai).
                            <br/>Ini akan menghapus semua data dan mengembalikan ke data contoh (Mock).
                        </p>
                    </div>
                    <button 
                        type="button"
                        onClick={handleResetDatabase}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
                    >
                        <RefreshCw size={16} /> Reset Database
                    </button>
                </div>
              </div>

              {/* Save Button Moved Here */}
              <div className="flex items-center justify-end">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Simpan Pengaturan
                </button>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-6">
              
              {/* Logo Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Image size={20} className="text-orange-500" /> Logo Sistem
                </h3>
                
                <div className="flex flex-col items-center justify-center space-y-4">
                   <div className="w-40 h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group">
                      {localSettings.logo ? (
                        <img src={localSettings.logo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center p-4">
                           <Layout size={32} className="mx-auto text-slate-300 mb-2" />
                           <p className="text-xs text-slate-400">Belum ada logo</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-white text-xs font-bold">Ubah Logo</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                   </div>
                   <p className="text-xs text-slate-500 text-center leading-relaxed">
                     Format: PNG, JPG, SVG.<br/>Max 300KB.<br/>Disarankan rasio 1:1.
                   </p>
                </div>
              </div>

              {/* Login Background Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UploadCloud size={20} className="text-blue-500" /> Background Login
                </h3>
                
                <div className="flex flex-col items-center justify-center space-y-4">
                   <div className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group">
                      {localSettings.loginBackground ? (
                        <img src={localSettings.loginBackground} alt="Bg Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                           <Image size={24} className="mx-auto text-slate-300 mb-2" />
                           <p className="text-xs text-slate-400">Default Background</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-white text-xs font-bold">Ubah Background</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleBackgroundUpload}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                   </div>
                </div>
              </div>

              {/* Anjungan Background Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Monitor size={20} className="text-indigo-500" /> Background Anjungan
                </h3>
                
                <div className="flex flex-col items-center justify-center space-y-4">
                   <div className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group">
                      {localSettings.anjunganBackground ? (
                        <img src={localSettings.anjunganBackground} alt="Anjungan Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                           <Image size={24} className="mx-auto text-slate-300 mb-2" />
                           <p className="text-xs text-slate-400">Monas (Default)</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-white text-xs font-bold">Ubah Latar Anjungan</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAnjunganBackgroundUpload}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                   </div>
                   <p className="text-xs text-slate-500 text-center leading-relaxed">
                     Latar belakang untuk menu Anjungan Mandiri. Maks 300KB.
                   </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Text Only */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-medium text-center sm:text-left">
              {localSettings.footerText}
            </p>
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded border border-slate-200">
              Versi {localSettings.appVersion}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsSection;
