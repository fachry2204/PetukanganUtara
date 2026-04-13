
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Printer, 
  LayoutGrid, 
  Table as TableIcon, 
  Eye, 
  Pencil, 
  Trash2, 
  MapPin,
  MessageCircle,
  Download,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Camera,
  CheckCircle2,
  AlertTriangle,
  History as HistoryIcon,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { Staff, Gender, User, Announcement } from '../types';
import ProfileModal from './ProfileModal';
import AddStaffModal from './AddStaffModal';
import DeleteModal from './DeleteModal';
import { apiService } from '../services/api';

interface PPSUSectionProps {
  user: User;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  attendanceRecords?: any[];
  announcements?: Announcement[];
  schedules?: any[];
}

const PPSUSection: React.FC<PPSUSectionProps> = ({ user, staffList, setStaffList, attendanceRecords = [], announcements = [], schedules = [] }) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<Staff | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => 
      s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomorAnggota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nik.includes(searchTerm)
    );
  }, [searchTerm, staffList]);

  // Reset pagination when search or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const stats = {
    total: staffList.length,
    male: staffList.filter(s => s.jenisKelamin === Gender.MALE).length,
    female: staffList.filter(s => s.jenisKelamin === Gender.FEMALE).length
  };

  const handleExport = (format: 'pdf' | 'excel' | 'print') => {
    if (format === 'print') {
      window.print();
    } else {
      alert(`Mengekspor data ke format ${format.toUpperCase()}...`);
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsAddModalOpen(true);
    setSelectedStaff(null); // Close profile view if open
  };

  // Logic to save new or updated staff
  const handleSaveStaff = async (staffData: Staff) => {
    try {
      if (editingStaff) {
        await apiService.updateStaff(staffData);
        setStaffList(prev => prev.map(item => item.id === staffData.id ? staffData : item));
      } else {
        await apiService.createStaff(staffData);
        setStaffList(prev => [staffData, ...prev]);
      }
      setIsAddModalOpen(false);
      setEditingStaff(null);
    } catch (error) {
      console.error("Failed to save staff:", error);
    }
  };

  // Logic to delete staff
  const handleDeleteStaff = async (id: string) => {
    try {
        await apiService.deleteStaff(id);
        setStaffList(prev => prev.filter(item => item.id !== id));
        setIsDeleteModalOpen(null);
    } catch (error) {
        console.error("Failed to delete staff:", error);
    }
  };

  // Advanced Pagination Button Logic
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

  if (user.role === 'PPSU') {
    const todayDateStr = new Date().toISOString().split('T')[0];
    
    // Use LIVE data from attendanceRecords instead of just localStorage
    const hasCheckedIn = attendanceRecords.some(r => 
      (r.userNik === user.nik || r.userId === user.id) && 
      r.type === 'Absen Masuk' && 
      r.timestamp.startsWith(todayDateStr)
    );
    
    const hasCheckedOut = attendanceRecords.some(r => 
      (r.userNik === user.nik || r.userId === user.id) && 
      r.type === 'Absen Pulang' && 
      r.timestamp.startsWith(todayDateStr)
    );
    const myStaffMember = staffList.find(s => s.nik === user.nik || s.nomorAnggota === user.username);
    const resolvedNik = myStaffMember ? myStaffMember.nik : user.nik;

    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-6">
         {/* HEADER / WELCOME */}
         <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-white flex items-center gap-5 shadow-lg shadow-orange-200/50 relative overflow-hidden ring-1 ring-white/20">
            <div className="relative z-10">
               <img src={user.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800'} alt={user.name} className="w-16 h-16 rounded-2xl border-2 border-white/50 shadow-md object-cover" />
               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-left flex-1 z-10">
               <h2 className="text-xl font-black mb-0.5 leading-tight">Halo, {user.name}</h2>
               <p className="text-orange-100 font-bold text-[10px] uppercase tracking-widest mb-2 opacity-90">Pasukan Orange</p>
               <div className="inline-flex items-center gap-2 bg-black/10 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
                  <FileText size={12} className="text-white/80" />
                  <span className="font-mono text-[10px] tracking-widest font-bold uppercase transition-all">{user.username}</span>
               </div>
            </div>
            <Users size={200} className="absolute -right-12 -bottom-12 text-white/10" />
         </div>

         {/* JADWAL SAYA BULAN INI (TOTAL) */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <HistoryIcon size={18} className="text-indigo-500" /> Jadwal Penugasan Bulan Ini
            </h3>
            {(() => {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                const monthlySchedules = schedules
                  .filter(s => {
                    if (!s.date) return false;
                    const sNik = String(s.nik || '');
                    const sStaffId = String(s.staff_id || '');
                    const sMemberId = String(s.nomor_anggota || '');
                    
                    const isMyNik = sNik && (sNik === String(user.nik || '') || (myStaffMember && sNik === String(myStaffMember.nik)));
                    const isMyStaffId = sStaffId && (sStaffId === String(user.id || '') || (myStaffMember && sStaffId === String(myStaffMember.id)));
                    const isMyMemberId = sMemberId && (sMemberId === String(user.username || '') || (myStaffMember && sMemberId === String(myStaffMember.nomorAnggota)));
                    
                    const isMySchedule = isMyNik || isMyStaffId || isMyMemberId;

                    const sDate = new Date(s.date);
                    const sDateStr = sDate.toISOString().split('T')[0];
                    return isMySchedule && 
                           sDate.getMonth() === currentMonth && 
                           sDate.getFullYear() === currentYear;
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                if (monthlySchedules.length === 0) {
                   return (
                      <p className="text-center py-6 text-slate-400 font-bold italic text-sm">Belum ada penugasan terdaftar untuk bulan ini.</p>
                   );
                }

                return (
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-separate border-spacing-y-2">
                         <thead>
                            <tr className="text-slate-400 uppercase text-[9px] font-black tracking-widest font-bold">
                               <th className="px-4">Tanggal</th>
                               <th className="px-4">Shift</th>
                               <th className="px-4">Waktu</th>
                               <th className="px-4">Zona</th>
                            </tr>
                         </thead>
                         <tbody>
                            {monthlySchedules.map((s, idx) => {
                               const isToday = new Date(s.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                               return (
                                  <tr key={idx} className={`${isToday ? 'bg-indigo-50/50 border border-indigo-200 shadow-sm font-bold' : 'bg-slate-50'} rounded-xl transition-all`}>
                                     <td className="py-3 px-4 rounded-l-xl font-bold text-slate-700">
                                        {new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                     </td>
                                     <td className="py-3 px-4">
                                        <span className="bg-white px-2 py-0.5 rounded-lg text-indigo-600 border border-indigo-100 font-black uppercase text-[9px]">{s.shift}</span>
                                     </td>
                                     <td className="py-3 px-4 font-medium text-slate-500">
                                        {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                                     </td>
                                     <td className="py-3 px-4 rounded-r-xl font-black text-slate-800 uppercase text-[9px] truncate max-w-[80px]">
                                        {s.area}
                                     </td>
                                  </tr>
                               );
                            })}
                         </tbody>
                      </table>
                   </div>
                );
            })()}
         </div>

         {/* STATUS ABSENSI HARI INI */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <Camera size={18} className="text-indigo-500" /> Status Kehadiran Hari Ini
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div className={`p-4 rounded-2xl flex flex-col justify-center items-center gap-2 text-center transition-all ${hasCheckedIn ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}>
                  {hasCheckedIn ? <CheckCircle2 size={28} className="text-emerald-500" /> : <AlertTriangle size={28} className="text-slate-400" />}
                  <span className="text-sm font-bold">{hasCheckedIn ? 'Sudah Masuk' : 'Belum Absen Masuk'}</span>
               </div>
               <div className={`p-4 rounded-2xl flex flex-col justify-center items-center gap-2 text-center transition-all ${hasCheckedOut ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}>
                  {hasCheckedOut ? <CheckCircle2 size={28} className="text-emerald-500" /> : <AlertTriangle size={28} className="text-slate-400" />}
                  <span className="text-sm font-bold">{hasCheckedOut ? 'Sudah Pulang' : 'Belum Absen Pulang'}</span>
               </div>
            </div>
         </div>

         {/* PENGUMUMAN */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
               <MessageCircle size={18} className="text-blue-500" /> Pengumuman Pimpinan
            </h3>
            <div className="space-y-4">
               {(() => {
                 const today = new Date();
                 today.setHours(0, 0, 0, 0);
                 
                 const activeAnnouncements = announcements.filter(ann => {
                    const start = ann.startDate ? new Date(ann.startDate) : null;
                    const end = ann.endDate ? new Date(ann.endDate) : null;
                    if (start) start.setHours(0,0,0,0);
                    if (end) end.setHours(23,59,59,999);
                    
                    const isStarted = !start || today >= start;
                    const isNotEnded = !end || today <= end;
                    
                    return isStarted && isNotEnded;
                 });

                 if (activeAnnouncements.length === 0) {
                    return <p className="text-center py-6 text-slate-400 font-bold italic text-sm">Belum ada pengumuman.</p>;
                 }

                 return activeAnnouncements.slice(0, 5).map((ann, idx) => (
                    <div key={ann.id} className={`p-4 rounded-3xl relative overflow-hidden flex flex-col gap-4 ${idx === 0 ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'bg-slate-50 border border-slate-100'}`}>
                       {idx === 0 && <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>}
                       
                       <div className="flex gap-4">
                          {ann.image && (
                             <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white shadow-sm shrink-0">
                                <img src={ann.image} alt={ann.title} className="w-full h-full object-cover" />
                             </div>
                          )}
                          <div className="flex-1">
                             <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-black text-sm uppercase tracking-tight ${idx === 0 ? 'text-indigo-900' : 'text-slate-800'}`}>{ann.title}</h4>
                                {idx === 0 && <span className="text-[9px] uppercase font-black text-white bg-indigo-500 px-2 py-0.5 rounded-full shadow-sm">Terbaru</span>}
                             </div>
                             <p className={`text-sm leading-relaxed font-bold ${idx === 0 ? 'text-indigo-700/80' : 'text-slate-500'}`}>{ann.content}</p>
                          </div>
                       </div>

                       <div className="flex items-center justify-between border-t border-black/5 pt-3">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                             <Clock size={12} />
                             {new Date(ann.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {ann.authorName}
                          </div>
                       </div>
                    </div>
                 ));
               })()}
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Anggota PPSU</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total PPSU Laki-Laki</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.male}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total PPSU Perempuan</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.female}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, NIK, atau nomor anggota..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 w-full outline-none"
            />
          </div>
          <button 
            onClick={() => {
              setEditingStaff(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
          >
            <UserPlus size={18} /> <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
             <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Show:</span>
             <select 
               value={itemsPerPage}
               onChange={(e) => setItemsPerPage(Number(e.target.value))}
               className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
             >
               <option value={10}>10</option>
               <option value={20}>20</option>
               <option value={30}>30</option>
               <option value={40}>40</option>
               <option value={50}>50</option>
               <option value={100}>100</option>
             </select>
          </div>

          <div className="h-6 w-px bg-slate-200"></div>

          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <TableIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          
          <div className="flex items-center gap-1">
            <button onClick={() => handleExport('pdf')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Export PDF"><FileText size={18} /></button>
            <button onClick={() => handleExport('excel')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Export Excel"><Download size={18} /></button>
            <button onClick={() => handleExport('print')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Print Data"><Printer size={18} /></button>
          </div>
        </div>
      </div>

      {/* Data View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Kelamin</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Masuk</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={staff.fotoProfile} alt={staff.namaLengkap} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{staff.namaLengkap}</p>
                          <p className="text-xs text-slate-500 font-medium">{staff.nomorAnggota}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        staff.jenisKelamin === Gender.MALE ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                      }`}>
                        {staff.jenisKelamin}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      <a href={`https://wa.me/${staff.nomorWhatsapp}`} target="_blank" className="flex items-center gap-1.5 text-green-600 hover:underline">
                        <MessageCircle size={14} /> +{staff.nomorWhatsapp}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(staff.tanggalMasuk).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedStaff(staff)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat"><Eye size={18} /></button>
                        <button onClick={() => handleEdit(staff)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit"><Pencil size={18} /></button>
                        <button onClick={() => setIsDeleteModalOpen(staff)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStaff.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-400 font-medium">Tidak ada data anggota ditemukan.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentStaff.map((staff) => (
            <div key={staff.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10">
                 <button onClick={() => setSelectedStaff(staff)} className="p-2 bg-white/90 backdrop-blur shadow-sm text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={16} /></button>
                 <button onClick={() => handleEdit(staff)} className="p-2 bg-white/90 backdrop-blur shadow-sm text-amber-600 hover:bg-amber-50 rounded-lg"><Pencil size={16} /></button>
                 <button onClick={() => setIsDeleteModalOpen(staff)} className="p-2 bg-white/90 backdrop-blur shadow-sm text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
              
              <div className="flex flex-col items-center text-center flex-1">
                <div className="relative mb-4">
                   <img src={staff.fotoProfile} alt={staff.namaLengkap} className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50" />
                   <div className={`absolute bottom-0 right-0 w-6 h-6 border-4 border-white rounded-full ${
                     staff.jenisKelamin === Gender.MALE ? 'bg-blue-500' : 'bg-pink-500'
                   }`}></div>
                </div>
                <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{staff.namaLengkap}</h4>
                <p className="text-sm text-orange-600 font-bold mb-4">{staff.nomorAnggota}</p>
                
                <div className="w-full space-y-3 mb-4 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <a 
                     href={`https://www.google.com/maps?q=${staff.latitude},${staff.longitude}`} 
                     target="_blank"
                     className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 group/link"
                   >
                     <MapPin size={14} className="shrink-0 text-red-500" />
                     <span className="truncate flex-1">Lokasi Sematan</span>
                     <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100" />
                   </a>
                   <div className="flex items-center gap-2 text-xs text-slate-600">
                     <span className="shrink-0 font-bold w-4">G</span>
                     <span>{staff.jenisKelamin}</span>
                   </div>
                </div>
              </div>

              <a 
                href={`https://wa.me/${staff.nomorWhatsapp}`} 
                target="_blank"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors mt-2"
              >
                <MessageCircle size={16} /> Chat WhatsApp
              </a>
            </div>
          ))}
          {filteredStaff.length === 0 && (
            <div className="col-span-full p-12 text-center">
              <p className="text-slate-400 font-medium">Tidak ada data anggota ditemukan.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {filteredStaff.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <span className="text-sm text-slate-500 order-2 sm:order-1">
              Menampilkan <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> - <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, filteredStaff.length)}</span> dari <span className="font-bold text-slate-800">{filteredStaff.length}</span> data
            </span>
            <div className="flex gap-1 order-1 sm:order-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === page 
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-100' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
        </div>
      )}

      {/* Modals */}
      {selectedStaff && (
        <ProfileModal 
          staff={selectedStaff} 
          onClose={() => setSelectedStaff(null)} 
          user={user}
          onDelete={() => {
            setIsDeleteModalOpen(selectedStaff);
            setSelectedStaff(null);
          }}
          onEdit={() => handleEdit(selectedStaff)}
        />
      )}

      {isAddModalOpen && (
        <AddStaffModal 
          staff={editingStaff}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStaff(null);
          }} 
          onSave={handleSaveStaff}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal 
          staff={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(null)} 
          user={user}
        />
      )}
    </div>
  );
};

export default PPSUSection;
