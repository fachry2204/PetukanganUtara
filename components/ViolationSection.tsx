import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Smartphone, User, Clock, Search, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api';

const ViolationSection: React.FC = () => {
    const [violations, setViolations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchViolations = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getViolations();
            setViolations(data || []);
        } catch (error) {
            console.error('Failed to fetch violations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchViolations();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Hapus log pelanggaran ini?')) return;
        try {
            await apiService.deleteViolation(id);
            setViolations(violations.filter(v => v.id !== id));
        } catch (error) {
            alert('Gagal menghapus log.');
        }
    };

    const filtered = violations.filter(v => 
        v.ppsu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.violation_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                       <ShieldAlert className="text-red-600" /> LOG PELANGGARAN KEAMANAN
                   </h2>
                   <p className="text-slate-500 font-medium">Monitoring manipulasi GPS dan waktu perangkat personil.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari Nama / Jenis Pelanggaran..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none w-64 transition-all"
                        />
                    </div>
                    <button 
                        onClick={fetchViolations}
                        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <Clock size={20} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat Log Pelanggaran...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white py-24 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                    <ShieldAlert size={64} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada data pelanggaran terdeteksi.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((v) => (
                        <div key={v.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden border-t-4 border-red-500">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(v.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Personil</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 leading-none">{v.ppsu_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">NIK: {v.user_id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jenis Pelanggaran</p>
                                        <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest">
                                            {v.violation_type}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Informasi Perangkat</p>
                                        <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl">
                                            <Smartphone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic line-clamp-3">
                                                {v.device_info}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(v.timestamp).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViolationSection;
