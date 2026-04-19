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
  const [zonaFilter, setZonaFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const ZONAS = settings.zonaList || ['Zona Belum Diatur'];
  const SHIFTS = settings.shiftConfig || [
    { name: 'Pagi', start: '07:00', end: '15:00' },
    { name: 'Siang', start: '15:00', end: '23:00' },
    { name: 'Malam', start: '23:00', end: '07:00' }
  ];

  // Form State
  const [newJadwal, setNewJadwal] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    day: DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
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
        date: new Date().toISOString().split('T')[0],
        day: DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
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
    const matchesSearch = (j.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (j.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDay = dayFilter === 'ALL' || j.day === dayFilter || j.date === dayFilter;
    const matchesZona = zonaFilter === 'ALL' || j.area === zonaFilter;
    const matchesShift = shiftFilter === 'ALL' || j.shift === shiftFilter;
    
    const taskDate = j.date || (j.timestamp ? new Date(j.timestamp).toISOString().split('T')[0] : '');
    const matchesDateRange = (!startDate || taskDate >= startDate) && (!endDate || taskDate <= endDate);

    return matchesSearch && matchesDay && matchesZona && matchesShift && matchesDateRange;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Jadwal PPSU</h2>
          <p className="text-slate-500 text-sm font-medium">Atur shift dan zona penugasan personil PPSU secara efisien.</p>
        </div>
        <div className="flex gap-2">
          {/* View Tab Removed as requested */}
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={20} /> Tambah Jadwal Baru
          </button>
        </div>
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
                <h3 className="text-xl font-black text-slate-800">{schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</h3>
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
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Nama personil atau zona..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div>
          <select 
            className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none font-bold text-slate-700 text-sm min-w-[120px]"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
          >
            <option value="ALL">Semua Hari</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <select 
            className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none font-bold text-slate-700 text-sm min-w-[140px]"
            value={zonaFilter}
            onChange={(e) => setZonaFilter(e.target.value)}
          >
            <option value="ALL">Semua Zona</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div>
          <select 
            className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none font-bold text-slate-700 text-sm min-w-[120px]"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
          >
            <option value="ALL">Semua Shift</option>
            {SHIFTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none font-bold text-slate-700 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-300 font-bold">-</span>
            <input 
              type="date" 
              className="bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none font-bold text-slate-700 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {(zonaFilter !== 'ALL' || shiftFilter !== 'ALL' || dayFilter !== 'ALL' || startDate || endDate || searchQuery) && (
          <button 
            onClick={() => {
              setZonaFilter('ALL');
              setShiftFilter('ALL');
              setDayFilter('ALL');
              setStartDate('');
              setEndDate('');
              setSearchQuery('');
            }}
            className="p-3 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"
            title="Reset Filter"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* List View Only */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
           <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="text-slate-500 font-bold">Memuat Jadwal...</p>
        </div>
      ) : (
        filteredSchedules.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
             <Calendar size={48} className="text-slate-200 mb-4" />
             <p className="text-slate-500 font-bold">Tidak ada jadwal ditemukan.</p>
             <p className="text-slate-400 text-sm mt-1">Silahkan tambahkan jadwal baru untuk personil PPSU.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                         <th className="py-4 px-4 text-center w-16">No</th>
                         <th className="py-4 px-4">Nama Personil</th>
                         <th className="py-4 px-4 text-center">Tanggal</th>
                         <th className="py-4 px-4 text-center">Shift</th>
                         <th className="py-4 px-4 text-center">Waktu Tugas</th>
                         <th className="py-4 px-4 text-center">Zona</th>
                         <th className="py-4 px-4 text-center">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredSchedules.map((j, idx) => (
                        <tr key={j.id} className="hover:bg-indigo-50/30 transition-colors group">
                           <td className="py-4 px-4 text-center font-bold text-slate-300 group-hover:text-indigo-400">{idx + 1}</td>
                           <td className="py-4 px-4">
                              <p className="font-black text-slate-800 uppercase text-xs">{j.nama_lengkap}</p>
                              <p className="text-[10px] font-bold font-mono text-slate-400">{j.nomor_anggota}</p>
                           </td>
                           <td className="py-4 px-4 text-center">
                              <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-[10px] font-black border border-rose-100">
                                 {j.date ? new Date(j.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : j.day}
                              </span>
                           </td>
                           <td className="py-4 px-4 text-center">
                              <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-lg text-[10px] font-black border border-cyan-100">{j.shift}</span>
                           </td>
                           <td className="py-4 px-4 text-center font-bold text-slate-600">
                              {j.start_time.slice(0, 5)} - {j.end_time.slice(0, 5)}
                           </td>
                           <td className="py-4 px-4 text-center">
                              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{j.area}</span>
                           </td>
                           <td className="py-4 px-4 text-center">
                              <button 
                                 onClick={() => handleDelete(j.id)}
                                 className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )
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
                         <Calendar size={14} /> Tanggal
                       </label>
                       <input 
                         type="date"
                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 text-sm shadow-sm"
                         value={newJadwal.date}
                         onChange={(e) => {
                            const date = e.target.value;
                            const dayName = DAYS[new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1];
                            setNewJadwal({...newJadwal, date, day: dayName});
                         }}
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-6">
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
                         <Clock size={14} /> Jam Kerja
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
