
import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  MessageSquare,
  FileText,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';

interface WALog {
  id: string;
  recipient: string;
  message: string;
  type: string;
  status: 'SENT' | 'FAILED';
  timestamp: string;
  error?: string;
}

const WhatsAppLogsSection: React.FC = () => {
  const [logs, setLogs] = useState<WALog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SENT' | 'FAILED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getWaLogs();
      if (data) setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      const response = await apiService.retryWaMessage(id);
      if (response) {
        alert("Pesan sedang dikirim ulang...");
        fetchLogs();
      }
    } catch (err: any) {
      alert("Gagal kirim ulang: " + (err.message || "Error tidak diketahui"));
    } finally {
      setRetryingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus SEMUA log pesan? Data yang sudah dihapus tidak bisa dikembalikan.")) return;
    try {
      await apiService.clearWaLogs();
      fetchLogs();
    } catch (err) {
      console.error("Failed to clear logs", err);
      alert("Gagal membersihkan log");
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <History className="text-indigo-600" /> Log WhatsApp Gateway
            </h2>
            <p className="text-sm text-slate-500 font-medium">Monitoring status pengiriman pesan otomatis sistem</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleClearAll}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-100"
            >
              <Trash2 size={14} />
              Bersihkan Log
            </button>
            <button 
              onClick={fetchLogs}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari nomor atau isi pesan..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="SENT">Berhasil Terkirim</option>
            <option value="FAILED">Gagal Terkirim</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="px-4 py-4 w-40">Waktu</th>
                <th className="px-4 py-4 w-40">Penerima</th>
                <th className="px-4 py-4">Pesan</th>
                <th className="px-4 py-4 w-32">Tipe</th>
                <th className="px-4 py-4 w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && logs.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-4 py-20 text-center text-slate-400 font-bold italic">Sedang memuat data...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-4 py-20 text-center text-slate-400 font-bold italic">Tidak ada log pengiriman ditemukan.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Phone size={14} />
                        <span className="text-xs font-black tracking-tight">{log.recipient}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap line-clamp-2 group-hover:line-clamp-none transition-all">
                          {log.message}
                        </p>
                        {log.error && (
                          <div className="flex gap-1 items-start text-[9px] text-rose-500 font-bold bg-rose-50 p-2 rounded-lg mt-2">
                             <AlertCircle size={10} className="shrink-0 mt-0.5" />
                             <span className="break-all">{log.error}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {log.status === 'SENT' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                           <CheckCircle2 size={14} />
                           Sent
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                             <XCircle size={14} />
                             Failed
                          </div>
                          <button 
                            onClick={() => handleRetry(log.id)}
                            disabled={retryingId === log.id}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-[10px] font-black uppercase tracking-widest transition-all ${
                              retryingId === log.id 
                                ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                            }`}
                          >
                            <RefreshCw size={10} className={retryingId === log.id ? 'animate-spin' : ''} />
                            {retryingId === log.id ? 'Retrying...' : 'Kirim Ulang'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLogsSection;
