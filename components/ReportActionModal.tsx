
import React, { useState } from 'react';
import { X, CheckCircle2, MapPin, PlayCircle, RotateCcw, Camera, AlertCircle } from 'lucide-react';
import { TugasPPSU, ReportStatus, Staff, DutyStatus } from '../types';

interface ReportActionModalProps {
  tugas: TugasPPSU;
  role: 'PPSU' | 'Admin';
  staffList: Staff[];
  onClose: () => void;
  onUpdate: (updatedTugas: TugasPPSU, staffUpdates?: Staff[]) => void;
}

const ReportActionModal: React.FC<ReportActionModalProps> = ({ tugas, role, staffList, onClose, onUpdate }) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async () => {
    setIsSubmitting(true);
    
    let nextStatus: ReportStatus = tugas.status;
    let staffUpdates: Staff[] = [];

    if (tugas.status === ReportStatus.PENDING_ACCEPTANCE) {
      nextStatus = ReportStatus.ON_THE_WAY;
    } else if (tugas.status === ReportStatus.ON_THE_WAY) {
      nextStatus = ReportStatus.ARRIVED;
    } else if (tugas.status === ReportStatus.ARRIVED) {
      nextStatus = ReportStatus.IN_PROGRESS;
    } else if (tugas.status === ReportStatus.IN_PROGRESS) {
      nextStatus = ReportStatus.VERIFICATION;
    } else if (tugas.status === ReportStatus.REVISION) {
      nextStatus = ReportStatus.VERIFICATION;
    }

    const updatedTugas: TugasPPSU = {
      ...tugas,
      status: nextStatus,
      logs: [
        ...tugas.logs,
        {
          status: nextStatus,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          note: note || `Status updated to ${nextStatus}`,
          actor: role
        }
      ]
    };

    setTimeout(() => {
      onUpdate(updatedTugas, staffUpdates);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const getActionTitle = () => {
    switch (tugas.status) {
      case ReportStatus.PENDING_ACCEPTANCE: return 'Terima Pekerjaan';
      case ReportStatus.ON_THE_WAY: return 'Konfirmasi Sampai Lokasi';
      case ReportStatus.ARRIVED: return 'Mulai Pengerjaan';
      case ReportStatus.IN_PROGRESS: return 'Selesaikan Pekerjaan';
      case ReportStatus.REVISION: return 'Kirim Revisi';
      default: return 'Update Status';
    }
  };

  const getActionButtonText = () => {
    switch (tugas.status) {
      case ReportStatus.PENDING_ACCEPTANCE: return 'Terima & Berangkat';
      case ReportStatus.ON_THE_WAY: return 'Saya Sudah Sampai';
      case ReportStatus.ARRIVED: return 'Mulai Sekarang';
      case ReportStatus.IN_PROGRESS: return 'Kirim Laporan Selesai';
      case ReportStatus.REVISION: return 'Kirim Revisi';
      default: return 'Update';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800">{getActionTitle()}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-700 uppercase mb-1">Tugas Saat Ini:</p>
            <p className="text-sm font-bold text-slate-800">{tugas.judulTugas}</p>
            <p className="text-[10px] text-slate-500 mt-1">{tugas.id}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Catatan / Keterangan (Opsional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan keterangan jika diperlukan..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
            />
          </div>

          {(tugas.status === ReportStatus.ARRIVED || tugas.status === ReportStatus.IN_PROGRESS) && (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start gap-3">
              <Camera className="text-orange-500 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-orange-700">Lampiran Foto Diperlukan</p>
                <p className="text-[10px] text-orange-600">Pastikan Anda mengambil foto bukti di lokasi untuk verifikasi.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-white rounded-xl transition-all"
          >
            Batal
          </button>
          <button 
            onClick={handleAction}
            disabled={isSubmitting}
            className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {getActionButtonText()}
                <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportActionModal;
