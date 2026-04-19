import React, { useState } from 'react';
import { X, ShieldCheck, Lock, UserCircle, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: User[];
  actionType: 'Edit' | 'Delete' | 'Reset Password';
  targetUserName: string;
}

const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  users, 
  actionType, 
  targetUserName 
}) => {
  const [identifier, setIdentifier] = useState(''); // Can be Username, Email, or NIK
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      // 1. Verifikasi dengan backend (Database check)
      const adminUser = await apiService.login(identifier, password);

      // 2. Cek izin role
      const allowedRoles = ['Administrator', 'Admin', 'Pimpinan', 'Staff Kelurahan'];
      if (!allowedRoles.includes(adminUser.role)) {
        setError(`Akses Ditolak: Role '${adminUser.role}' tidak memiliki izin untuk melakukan aksi ini.`);
        setIsVerifying(false);
        return;
      }

      // Berhasil
      setIsVerifying(false);
      onSuccess();
    } catch (err: any) {
        setIsVerifying(false);
        if (err.message.includes('404')) {
            setError('User tidak ditemukan dalam sistem.');
        } else if (err.message.includes('401')) {
            setError('Password salah.');
        } else {
            setError('Terjadi kesalahan koneksi ke server.');
        }
    }
  };

  const getColorTheme = () => {
    switch (actionType) {
      case 'Delete': return 'red';
      case 'Reset Password': return 'blue';
      case 'Edit': return 'amber';
      default: return 'slate';
    }
  };

  const color = getColorTheme();

  return (
    <div className={`fixed inset-0 z-[130] flex items-center justify-center p-4 bg-${color}-900/40 backdrop-blur-md animate-in fade-in duration-200`}>
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className={`p-6 bg-${color}-50 flex items-center gap-4 border-b border-${color}-100`}>
          <div className={`w-12 h-12 bg-${color}-100 text-${color}-600 rounded-2xl flex items-center justify-center shrink-0`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className={`font-bold text-${color}-900`}>Verifikasi Keamanan</h3>
            <p className={`text-xs text-${color}-700 font-medium`}>Otorisasi diperlukan untuk {actionType}.</p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-xs text-slate-500 font-medium mb-1">Target Aksi:</p>
             <div className="flex items-center gap-2">
               <UserCircle size={18} className="text-slate-400" />
               <span className="font-bold text-slate-800">{targetUserName}</span>
             </div>
          </div>
          
          <div className="mb-4 text-xs text-slate-500 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-start gap-2">
             <AlertTriangle size={14} className="mt-0.5 text-yellow-600 shrink-0" />
             <span>Masukkan ID (Username/Email/NIK) & Password akun dengan role <b>Administrator</b>, <b>Admin</b>, <b>Pimpinan</b>, atau <b>Staff Kelurahan</b>.</span>
          </div>

          {error && (
            <div className="mb-4 text-xs text-red-600 font-bold bg-red-50 p-3 rounded-lg flex items-start gap-2 border border-red-100">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">ID Pengguna (Username / Email / NIK)</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username, Email, atau NIK" 
                  required
                  autoFocus
                  className={`w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-${color}-500 outline-none`}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1 text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda" 
                  required
                  className={`w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-${color}-500 outline-none`}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
              >
                Batalkan
              </button>
              <button 
                type="submit"
                disabled={isVerifying}
                className={`flex-1 py-3 bg-${color}-600 hover:bg-${color}-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-${color}-100 transition-all flex items-center justify-center`}
              >
                {isVerifying ? 'Memverifikasi...' : 'Konfirmasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationModal;
