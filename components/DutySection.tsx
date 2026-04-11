
import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Activity,
  MessageCircle,
  Filter,
  Search,
  User as UserIcon,
  ListTodo
} from 'lucide-react';
import { DutyStatus, Staff, User, TugasPPSU } from '../types';
import ProfileModal from './ProfileModal';
import StaffTaskListModal from './StaffTaskListModal';

interface DutySectionProps {
  user: User;
  tugasList: TugasPPSU[];
  setTugasList: React.Dispatch<React.SetStateAction<TugasPPSU[]>>;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const DutySection: React.FC<DutySectionProps> = ({ user, tugasList, setTugasList, staffList, setStaffList }) => {
  // CHANGED: Default filter set to ONLINE instead of ALL
  const [filterStatus, setFilterStatus] = useState<string>(DutyStatus.ONLINE);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Modal States
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [viewingTasksFor, setViewingTasksFor] = useState<Staff | null>(null);
  
  // Realtime clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = {
    total: staffList.length,
    online: staffList.filter(s => s.status === DutyStatus.ONLINE).length,
    bertugas: staffList.filter(s => s.status === DutyStatus.BERTUGAS).length,
    standby: staffList.filter(s => s.status === DutyStatus.STANDBY).length,
    offline: staffList.filter(s => s.status === DutyStatus.OFFLINE).length
  };

  const filteredStaff = staffList.filter(s => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  // Helper for active card styling
  const getCardStyle = (statusKey: string, baseColor: string, borderColor: string) => {
    const isActive = filterStatus === statusKey;
    return `bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-b-4 ${borderColor} cursor-pointer transition-all duration-200 ${isActive ? `ring-2 ring-offset-2 ${baseColor.replace('bg-', 'ring-')} transform scale-105` : 'hover:scale-105 hover:shadow-md'}`;
  };

  const handleUpdateTugas = (updatedTugas: TugasPPSU, staffUpdates?: Staff[]) => {
    setTugasList(prev => prev.map(t => t.id === updatedTugas.id ? updatedTugas : t));
    
    // Update Staff Status if report completion triggers status change
    if (staffUpdates && staffUpdates.length > 0) {
        setStaffList(prevStaff => {
            return prevStaff.map(s => {
                const update = staffUpdates.find(u => u.id === s.id);
                return update ? update : s;
            });
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Dashboard Monitoring PPSU</h2>
           <p className="text-slate-500 text-sm flex items-center gap-2">
             <Activity size={14} className="text-green-500 animate-pulse" /> 
             System Realtime • {currentTime.toLocaleTimeString('id-ID')}
           </p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50">
             <Filter size={16} /> Filter Wilayah
           </button>
        </div>
      </div>
      
      {/* Status Cards - CLICKABLE */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total / ALL */}
        <div 
          onClick={() => setFilterStatus('ALL')}
          className={getCardStyle('ALL', 'bg-slate-400', 'border-b-slate-500')}
        >
          <p className="text-xs font-bold text-slate-400 uppercase">Total Anggota</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
        </div>

        {/* Online */}
        <div 
          onClick={() => setFilterStatus(DutyStatus.ONLINE)}
          className={getCardStyle(DutyStatus.ONLINE, 'bg-green-500', 'border-b-green-500')}
        >
          <p className="text-xs font-bold text-green-600 uppercase">Online</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.online}</h3>
        </div>

        {/* Bertugas */}
        <div 
          onClick={() => setFilterStatus(DutyStatus.BERTUGAS)}
          className={getCardStyle(DutyStatus.BERTUGAS, 'bg-blue-500', 'border-b-blue-500')}
        >
          <p className="text-xs font-bold text-blue-600 uppercase">Bertugas</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.bertugas}</h3>
        </div>

        {/* Standby */}
        <div 
          onClick={() => setFilterStatus(DutyStatus.STANDBY)}
          className={getCardStyle(DutyStatus.STANDBY, 'bg-yellow-500', 'border-b-yellow-500')}
        >
          <p className="text-xs font-bold text-yellow-600 uppercase">Standby</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.standby}</h3>
        </div>

        {/* Offline */}
        <div 
          onClick={() => setFilterStatus(DutyStatus.OFFLINE)}
          className={getCardStyle(DutyStatus.OFFLINE, 'bg-red-500', 'border-b-red-500')}
        >
          <p className="text-xs font-bold text-red-600 uppercase">Offline</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.offline}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Daftar Anggota PPSU 
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({filterStatus === 'ALL' ? 'Semua Status' : filterStatus})
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Cari anggota..." className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select 
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value={DutyStatus.ONLINE}>Online</option>
            <option value={DutyStatus.BERTUGAS}>Bertugas</option>
            <option value={DutyStatus.STANDBY}>Standby</option>
            <option value={DutyStatus.OFFLINE}>Offline</option>
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all flex flex-col h-full group">
            <div className="p-5 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img src={staff.fotoProfile} alt={staff.namaLengkap} className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all" />
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    staff.status === DutyStatus.BERTUGAS ? 'bg-blue-500 animate-pulse' : 
                    staff.status === DutyStatus.ONLINE ? 'bg-green-500' :
                    staff.status === DutyStatus.STANDBY ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{staff.namaLengkap}</h4>
                  <p className="text-xs text-slate-500 font-medium mb-1">{staff.nomorAnggota}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    staff.status === DutyStatus.BERTUGAS ? 'bg-blue-50 text-blue-600' : 
                    staff.status === DutyStatus.ONLINE ? 'bg-green-50 text-green-600' :
                    staff.status === DutyStatus.STANDBY ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {staff.status}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">Total Tugas</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{staff.totalTugasBerhasil}</span>
                </div>
                
                {/* BUTTON: Daftar Tugas */}
                <button 
                  onClick={() => setViewingTasksFor(staff)}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors border border-indigo-100"
                >
                  <ListTodo size={14} /> Daftar Tugas
                </button>
              </div>
            </div>

            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex gap-2">
              <a 
                href={`https://wa.me/${staff.nomorWhatsapp}`} 
                target="_blank"
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold transition-colors"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              {/* BUTTON: Lihat Profil */}
              <button 
                onClick={() => setSelectedStaff(staff)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <UserIcon size={14} /> Lihat Profil
              </button>
            </div>
          </div>
        ))}
        {filteredStaff.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            Tidak ada petugas dengan status yang dipilih.
          </div>
        )}
      </div>

      {selectedStaff && (
        <ProfileModal 
          staff={selectedStaff} 
          onClose={() => setSelectedStaff(null)} 
          user={user}
          onDelete={() => alert("Akses Dibatasi: Silahkan hapus melalui menu Manajemen Anggota.")}
          onEdit={() => alert("Akses Dibatasi: Silahkan edit melalui menu Manajemen Anggota.")}
        />
      )}

      {/* NEW MODAL: Task List */}
      {viewingTasksFor && (
        <StaffTaskListModal
          staff={viewingTasksFor}
          tugasList={tugasList}
          onClose={() => setViewingTasksFor(null)}
          onUpdateTugas={handleUpdateTugas}
        />
      )}
    </div>
  );
};

export default DutySection;
