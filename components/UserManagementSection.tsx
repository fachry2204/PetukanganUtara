
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  RefreshCw, 
  Search, 
  Shield, 
  Trash2, 
  Key,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Info,
  Type,
  RotateCcw,
  LayoutGrid,
  Settings,
  ShieldCheck,
  UserCog,
  HardHat
} from 'lucide-react';
import { User, Role } from '../types';
import AdminVerificationModal from './AdminVerificationModal';
import { apiService } from '../services/api';

const ROLES: Role[] = [
  'Administrator', 
  'Admin', 
  'Pimpinan', 
  'Staff Kelurahan', 
  'Operator',
  'PPSU', 
  'POSYANDU', 
  'PKK', 
  'Karang Taruna'
];

interface UserManagementSectionProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  initialTab?: CategoryTab; // Added prop
}

interface PendingAction {
  type: 'Edit' | 'Delete' | 'Reset Password';
  user: User;
}

type CategoryTab = 'SEMUA' | 'MANAJEMEN' | 'STAFF' | 'PPSU';

const UserManagementSection: React.FC<UserManagementSectionProps> = ({ users, setUsers, initialTab = 'SEMUA' }) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>(initialTab);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Verification State
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Edit State (Filled when verification passes)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // New/Edit User Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    nik: '',
    password: '',
    role: 'PPSU' as Role
  });

  // Sync activeTab if initialTab changes (e.g. navigation from menu)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Filter based on Tab
  const tabFilteredUsers = useMemo(() => {
    switch (activeTab) {
      case 'MANAJEMEN':
        return users.filter(u => ['Administrator', 'Pimpinan', 'Admin'].includes(u.role));
      case 'STAFF':
        return users.filter(u => ['Staff Kelurahan', 'Operator'].includes(u.role));
      case 'PPSU':
        return users.filter(u => u.role === 'PPSU');
      default:
        return users;
    }
  }, [users, activeTab]);

  const filteredUsers = useMemo(() => {
    return tabFilteredUsers.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nik?.includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tabFilteredUsers, searchTerm]);

  // Reset pagination when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, itemsPerPage]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) endPage = Math.min(totalPages - 1, 4);
      if (currentPage >= totalPages - 2) startPage = Math.max(2, totalPages - 3);
      if (startPage > 2) pages.push('...');
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', email: '', nik: '', password: '', role: 'PPSU' });
    setIsFormModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setPendingAction({ type: 'Edit', user });
  };

  const handleResetPasswordClick = (user: User) => {
    if (!user.nik) {
      alert("Gagal: User ini tidak memiliki NIK. Password tidak dapat direset menggunakan NIK.");
      return;
    }
    setPendingAction({ type: 'Reset Password', user });
  };

  const handleDeleteClick = (user: User) => {
    setPendingAction({ type: 'Delete', user });
  };

  const onVerificationSuccess = async () => {
    if (!pendingAction) return;
    const { type, user } = pendingAction;
    setPendingAction(null);

    try {
      if (type === 'Reset Password') {
          const updated = { ...user, password: user.nik };
          await apiService.updateUser(updated);
          setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
          alert(`Berhasil! Password untuk ${user.username} telah direset menjadi NIK (${user.nik}).`);
      } else if (type === 'Delete') {
          await apiService.deleteUser(user.id);
          setUsers(prev => prev.filter(u => u.id !== user.id));
          alert(`Berhasil! User ${user.username} telah dihapus dari sistem.`);
      } else if (type === 'Edit') {
          setEditingUser(user);
          setFormData({ 
            name: user.name || '',
            username: user.username, 
            email: user.email || '',
            nik: user.nik || '', 
            password: '', 
            role: user.role 
          });
          setIsFormModalOpen(true);
      }
    } catch (error) {
       console.error("User action failed:", error);
    }
  };

  const handleSubmitUserForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username && !formData.nik) {
        alert("Mohon isi Username atau NIK sebagai identitas login.");
        return;
    }
    const nameToUse = formData.name || formData.username;

    try {
      if (editingUser) {
          const updatedUser = {
            ...editingUser,
            name: formData.name,
            username: formData.username,
            email: formData.email || undefined,
            nik: formData.nik,
            role: formData.role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse)}&background=random`
          };
          if (formData.password && formData.password.trim() !== '') {
            updatedUser.password = formData.password;
          }
          await apiService.updateUser(updatedUser);
          setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
          alert('Data user berhasil diperbarui.');
      } else {
          const newUser: User = {
            id: `USR-${Date.now()}`,
            name: formData.name,
            username: formData.username,
            email: formData.email || undefined,
            nik: formData.nik,
            role: formData.role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse)}&background=random`,
            password: formData.password
          };
          await apiService.createUser(newUser);
          setUsers(prev => [...prev, newUser]);
          alert('User baru berhasil ditambahkan.');
      }
      setIsFormModalOpen(false);
    } catch (error) {
       console.error("Failed to save user:", error);
    }
  };

  const tabs: {id: CategoryTab, label: string, icon: any}[] = [
    { id: 'SEMUA', label: 'Semua User', icon: <LayoutGrid size={16}/> },
    { id: 'MANAJEMEN', label: 'Manajemen', icon: <ShieldCheck size={16}/> },
    { id: 'STAFF', label: 'Staff & Operator', icon: <Settings size={16}/> },
    { id: 'PPSU', label: 'PPSU', icon: <HardHat size={16}/> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Database Pengguna Sistem</h2>
           <p className="text-slate-500 text-sm font-medium">Pengaturan hak akses dan kredensial login terpadu.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleOpenAddModal}
             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
           >
             <UserPlus size={18} /> Tambah Akun
           </button>
        </div>
      </div>

      {/* TABS SYSTEM */}
      <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap gap-1 overflow-x-auto no-scrollbar">
         {tabs.map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             {tab.icon}
             {tab.label}
             <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {tab.id === 'SEMUA' ? users.length : 
                 tab.id === 'MANAJEMEN' ? users.filter(u => ['Administrator', 'Pimpinan', 'Admin'].includes(u.role)).length :
                 tab.id === 'STAFF' ? users.filter(u => ['Staff Kelurahan', 'Operator'].includes(u.role)).length :
                 users.filter(u => u.role === 'PPSU').length}
             </span>
           </button>
         ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama, username, atau NIK..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tampilkan:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-transparent text-slate-700 text-sm font-bold outline-none cursor-pointer"
            >
              <option value={10}>10 Baris</option>
              <option value={20}>20 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identitas User</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Login & Kontak</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hak Akses</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white shadow-sm" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight truncate">{user.name || user.username}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center gap-2 text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg w-fit border border-indigo-100">
                          <UserIcon size={12} /> {user.username}
                       </div>
                      {user.email ? (
                        <span className="text-xs text-slate-500 flex items-center gap-2 font-bold"><Mail size={12} className="text-slate-300"/> {user.email}</span>
                      ) : (
                         <span className="text-[10px] text-slate-300 italic font-bold">Email belum diatur</span>
                      )}
                      {user.nik ? (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 font-bold uppercase tracking-widest"><CreditCard size={12} className="text-slate-300" /> NIK: {user.nik}</span>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">NIK: -</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-sm border ${
                      user.role === 'Administrator' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      user.role === 'PPSU' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      user.role === 'Pimpinan' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      user.role === 'Staff Kelurahan' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      user.role === 'Operator' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleResetPasswordClick(user)}
                        className="p-2.5 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm border border-blue-100"
                        title="Reset Password ke NIK"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2.5 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm border border-amber-100"
                        title="Edit Profil"
                      >
                        <Pencil size={18} />
                      </button>
                      {user.role !== 'Administrator' && (
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="p-2.5 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm border border-slate-100"
                          title="Hapus Akun"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-24 text-center">
            <UserCog size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Akun tidak ditemukan dalam kategori ini</p>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
             <span className="text-sm text-slate-500 font-bold order-2 sm:order-1">
                Menampilkan <span className="text-indigo-600">{indexOfFirstItem + 1}</span> - <span className="text-indigo-600">{Math.min(indexOfLastItem, filteredUsers.length)}</span> dari <span className="text-indigo-600">{filteredUsers.length}</span> data
             </span>
             <div className="flex gap-1 order-1 sm:order-2">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                 disabled={currentPage === 1}
                 className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               >
                 <ChevronLeft size={18} />
               </button>
               {getPageNumbers().map((page, index) => (
                 page === '...' ? (
                   <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-slate-300">...</span>
                 ) : (
                   <button
                     key={page}
                     onClick={() => setCurrentPage(page as number)}
                     className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                       currentPage === page 
                         ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                         : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                     }`}
                   >
                     {page}
                   </button>
                 )
               ))}
               <button 
                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                 disabled={currentPage === totalPages}
                 className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               >
                 <ChevronRight size={18} />
               </button>
             </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">{editingUser ? 'Edit Informasi Akun' : 'Buat Akun Akses Baru'}</h3>
              <p className="text-sm text-slate-500 font-medium">{editingUser ? 'Perbarui informasi profil dan hak akses.' : 'Lengkapi data login untuk memberikan akses ke sistem.'}</p>
            </div>
            
            <form onSubmit={handleSubmitUserForm} className="p-8 space-y-5">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Pengguna</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Nina"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Login</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                  <input 
                    type="text" 
                    required={!formData.nik} 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Contoh: nina_staff"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Opsional)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK (ID Login Alternatif)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input 
                        type="text" 
                        value={formData.nik}
                        onChange={(e) => setFormData({...formData, nik: e.target.value})}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Akun'}
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                  <input 
                    type="password" 
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingUser ? "••••••••" : "Masukkan password"}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tingkat Otoritas (Role)</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-[0.2em]"
                >
                  BATALKAN
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all uppercase tracking-[0.2em] transform active:scale-95"
                >
                  {editingUser ? 'SIMPAN PERUBAHAN' : 'BUAT AKUN SEKARANG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingAction && (
        <AdminVerificationModal 
          isOpen={!!pendingAction}
          onClose={() => setPendingAction(null)}
          onSuccess={onVerificationSuccess}
          users={users}
          actionType={pendingAction.type}
          targetUserName={pendingAction.user.username}
        />
      )}
    </div>
  );
};

export default UserManagementSection;
