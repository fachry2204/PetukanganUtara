
import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { Staff, User } from '../types';

interface DeleteModalProps {
  staff: Staff;
  onClose: () => void;
  user: User;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ staff, onClose, user }) => {
  const [password, setPassword] = useState('');
  const [adminId, setAdminId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Anggota ${staff.namaLengkap} berhasil dihapus dari sistem.`);
      setIsDeleting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-red-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="p-6 bg-red-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-red-900">Verifikasi Penghapusan</h3>
            <p className="text-xs text-red-700 font-medium">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
             <img src={staff.fotoProfile} alt="" className="w-10 h-10 rounded-full object-cover" />
             <div>
               <p className="text-xs text-slate-500 font-medium">Menghapus Data:</p>
               <p className="text-sm font-bold text-slate-800">{staff.namaLengkap} ({staff.nomorAnggota})</p>
             </div>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">ID Pengguna Pengesah</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Masukkan ID Anda" 
                  required
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none" 
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1 text-slate-700">Password Pengesah</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none" 
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
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-100 transition-all flex items-center justify-center"
              >
                {isDeleting ? 'Memproses...' : 'Hapus Sekarang'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
