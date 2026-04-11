import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Staff, SystemSettings } from '../types';
import { apiService } from '../services/api';

interface ScheduleManagementSectionProps {
  staffList: Staff[];
  settings: SystemSettings;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const ScheduleManagementSection: React.FC<ScheduleManagementSectionProps> = ({ staffList, settings }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('ALL');

  const ZONAS = settings.zonaList || ['Zona Belum Diatur'];
  const SHIFTS = settings.shiftConfig || [
    { name: 'Pagi', start: '07:00', end: '15:00' },
    { name: 'Siang', start: '15:00', end: '23:00' },
    { name: 'Malam', start: '23:00', end: '07:00' }
  ];

  // Form State
  const [newJadwal, setNewJadwal] = useState({
    staffId: '',
    day: 'Senin',
    shift: SHIFTS[0].name,
    startTime: SHIFTS[0].start,
    endTime: SHIFTS[0].end,
    area: ZONAS[0]
  });

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getJadwal();
      if (data) setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJadwal.staffId || !newJadwal.area) {
      alert('Harap lengkapi data jadwal!');
      return;
    }

    try {
      const payload = {
        id: `JWL-${Date.now()}`,
        ...newJadwal
      };
      await apiService.createJadwal(payload);
      setIsAdding(false);
      setNewJadwal({
        staffId: '',
        day: 'Senin',
        shift: SHIFTS[0].name,
        startTime: SHIFTS[0].start,
        endTime: SHIFTS[0].end,
        area: ZONAS[0]
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    try {
      await apiService.deleteJadwal(id);
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const filteredSchedules = schedules.filter(j => {
    const matchesSearch = j.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          j.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDay = dayFilter === 'ALL' || j.day === dayFilter;
    return matchesSearch && matchesDay;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Jadwal PPSU</h2>
          <p className="text-slate-500 text-sm font-medium">Atur shift dan zona penugasan personil PPSU secara efisien.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus size={20} /> Tambah Jadwal Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Jadwal</p>
                <h3 className="text-xl font-black text-slate-800">{schedules.length}</h3>
             </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <User size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aktif Hari Ini</p>
                <h3 className="text-xl font-black text-slate-800">{schedules.filter(s => s.day === DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]).length}</h3>
             </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                <MapPin size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Zona Tercover</p>
                <h3 className="text-xl font-black text-slate-800">{new Set(schedules.map(s => s.area)).size}</h3>
             </div>
          </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama personil atau zona..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Filter size={18} className="text-slate-400" />
           <select 
             className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none font-bold text-slate-700 text-sm"
             value={dayFilter}
             onChange={(e) => setDayFilter(e.target.value)}
           >
              <option value="ALL">Semua Hari</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
        </div>
      </div>

      {/* Schedule List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
           <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="text-slate-500 font-bold">Memuat Jadwal...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
           <Calendar size={48} className="text-slate-200 mb-4" />
           <p className="text-slate-500 font-bold">Tidak ada jadwal ditemukan.</p>
           <p className="text-slate-400 text-sm mt-1">Silahkan tambahkan jadwal baru untuk personil PPSU.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {filteredSchedules.map(j => (
             <div key={j.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start gap-4 mb-4">
                   <div className="flex gap-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                         <User size={28} className="text-slate-300" />
                      </div>
                      <div>
                         <h4 className="font-black text-slate-800 uppercase leading-tight">{j.nama_lengkap}</h4>
                         <p className="text-[10px] font-mono text-slate-400 font-bold">{j.nomor_anggota}</p>
                         <div className="flex items-center gap-2 mt-2">
                           <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">{j.day}</span>
                           <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-cyan-100">{j.shift}</span>
                         </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleDelete(j.id)}
                     className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-2">
                   <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
                      <Clock size={16} className="text-indigo-500" />
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Waktu Tugas</p>
                        <p className="text-xs font-bold text-slate-700">{j.start_time.slice(0, 5)} - {j.end_time.slice(0, 5)}</p>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
                      <MapPin size={16} className="text-orange-500" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Zona Tugas</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{j.area}</p>
                      </div>
                   </div>
                </div>
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 -mr-12 -mt-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
             </div>
           ))}
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Atur Jadwal Baru</h3>
                    <p className="text-indigo-200 text-xs font-medium">Input jadwal shift harian untuk personil PPSU.</p>
                 </div>
                 <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   <Trash2 className="rotate-45" size={24} />
                 </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-8 space-y-6 bg-slate-50/50">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <User size={14} /> Pilih Personil
                       </label>
                       <select 
                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm shadow-sm"
                         value={newJadwal.staffId}
                         onChange={(e) => setNewJadwal({...newJadwal, staffId: e.target.value})}
                         required
                       >
                          <option value="">-- Pilih Anggota --</option>
                          {staffList.map(s => (
                            <option key={s.id} value={s.id}>{s.namaLengkap} ({s.nomorAnggota})</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <Calendar size={14} /> Hari
                       </label>
                       <select 
                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm shadow-sm"
                         value={newJadwal.day}
                         onChange={(e) => setNewJadwal({...newJadwal, day: e.target.value})}
                       >
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <Briefcase size={14} /> Tipe Shift
                       </label>
                       <div className="flex flex-wrap gap-2">
                          {SHIFTS.map(s => (
                            <button 
                              key={s.name}
                              type="button"
                              onClick={() => setNewJadwal({...newJadwal, shift: s.name, startTime: s.start, endTime: s.end})}
                              className={`flex-1 min-w-[80px] py-3 rounded-xl border-2 font-bold text-xs transition-all
                                ${newJadwal.shift === s.name 
                                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' 
                                  : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                            >
                               {s.name}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <Clock size={14} /> Jam Kerja Manual
                       </label>
                       <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 shadow-sm"
                            value={newJadwal.startTime}
                            onChange={(e) => setNewJadwal({...newJadwal, startTime: e.target.value})}
                          />
                          <span className="font-bold text-slate-300">-</span>
                          <input 
                            type="time" 
                            className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 shadow-sm"
                            value={newJadwal.endTime}
                            onChange={(e) => setNewJadwal({...newJadwal, endTime: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} /> Zona Penugasan
                    </label>
                    <select 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm shadow-sm"
                      value={newJadwal.area}
                      onChange={(e) => setNewJadwal({...newJadwal, area: e.target.value})}
                      required
                    >
                       <option value="">-- Pilih Zona Tugas --</option>
                       {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-all"
                    >
                       Batal
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                    >
                       <CheckCircle2 size={20} /> Simpan Jadwal
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagementSection;
