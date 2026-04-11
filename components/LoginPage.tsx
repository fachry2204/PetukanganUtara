
import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, AlertTriangle, ShieldCheck } from 'lucide-react';
import { User as UserType, SystemSettings } from '../types';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
  settings: SystemSettings;
  users: UserType[]; // Added users prop
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, settings, users }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate Network Delay
    setTimeout(() => {
      // Logic Update: Search in the passed 'users' prop (which contains generated citizens)
      const user = users.find(u =>
        (u.username.toLowerCase() === identifier.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
        (u.nik && u.nik === identifier)
      );

      if (user) {
        if (user.password === password) {
          setIsLoading(false);
          onLogin(user);
        } else {
          setIsLoading(false);
          setError('Password salah. Silakan coba lagi.');
        }
      } else {
        setIsLoading(false);
        setError('Pengguna tidak ditemukan. Periksa Username/NIK Anda.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Dynamic Background Image */}
      {settings.loginBackground && (
        <div 
          className="absolute inset-0 z-0 animate-in fade-in duration-1000 opacity-70"
          style={{ 
            backgroundImage: `url(${settings.loginBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
      
      {/* Overlay Filter for Contrast - Black 40% */}
      <div className="absolute inset-0 z-[1] bg-black/40 backdrop-blur-[2px]" />



      {/* Form Container with Strong Shadow */}
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center shadow-sm mb-4 border border-slate-100">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-14 h-14 object-contain" />
            ) : (
              <ShieldCheck size={40} className="text-orange-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{settings.systemName}</h1>
          <p className="text-slate-500 text-sm mt-1">{settings.subName}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-start gap-3 text-sm animate-in shake">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">ID Pengguna</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={20} />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username, Email, atau NIK"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <button type="button" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">
              Lupa Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              <>
                Masuk Aplikasi <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 mb-1">
            {settings.footerText}
          </p>
          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            Versi Aplikasi {settings.appVersion}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
