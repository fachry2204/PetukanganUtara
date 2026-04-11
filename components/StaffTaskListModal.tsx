
import React, { useState } from 'react';
import { X, Calendar, MapPin, CheckCircle2, ArrowRight, Clock, AlertCircle, Activity, PlayCircle, RotateCcw } from 'lucide-react';
import { Staff, TugasPPSU, ReportStatus, DutyStatus } from '../types';
import ReportActionModal from './ReportActionModal';

interface StaffTaskListModalProps {
  staff: Staff;
  tugasList: TugasPPSU[];
  onClose: () => void;
  onUpdateTugas: (updatedTugas: TugasPPSU, staffUpdates?: Staff[]) => void;
}

const StaffTaskListModal: React.FC<StaffTaskListModalProps> = ({ staff, tugasList, onClose, onUpdateTugas }) => {
  const [actionTugas, setActionTugas] = useState<TugasPPSU | null>(null);

  // Filter tugas assigned to this staff
  const assignedTasks = tugasList.filter(t => 
    t.staffId === staff.id && 
    (
        t.status === ReportStatus.PENDING_ACCEPTANCE || 
        t.status === ReportStatus.ON_THE_WAY || 
        t.status === ReportStatus.ARRIVED || 
        t.status === ReportStatus.IN_PROGRESS || 
        t.status === ReportStatus.VERIFICATION ||
        t.status === ReportStatus.REVISION
    )
  );

  // Sorting: High priority first, then by timestamp
  assignedTasks.sort((a, b) => {
    if (a.priority === 'High' && b.priority !== 'High') return -1;
    if (a.priority !== 'High' && b.priority === 'High') return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handleActionClick = (tugas: TugasPPSU) => {
    setActionTugas(tugas);
  };

  const handleUpdateFromAction = (updatedTugas: TugasPPSU, staffUpdates?: Staff[]) => {
    onUpdateTugas(updatedTugas, staffUpdates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
             <img src={staff.fotoProfile} alt={staff.namaLengkap} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
             <div>
                <h3 className="font-bold text-slate-800">Daftar Tugas Aktif</h3>
                <p className="text-xs text-slate-500">{staff.namaLengkap} • {staff.nomorAnggota}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
           {assignedTasks.length > 0 ? (
             <div className="space-y-4">
               {assignedTasks.map(task => (
                 <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' : 
                          task.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                          {task.priority} Priority
                       </span>
                       <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(task.timestamp).toLocaleDateString('id-ID')}
                       </span>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 mb-1">{task.judulTugas}</h4>
                    <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded line-clamp-2">{task.deskripsi}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                       <MapPin size={14} className="text-red-500" />
                       <span className="truncate">{task.lokasi}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                       <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                          task.status === ReportStatus.PENDING_ACCEPTANCE ? 'bg-yellow-50 text-yellow-700' :
                          task.status === ReportStatus.ON_THE_WAY ? 'bg-orange-50 text-orange-700' :
                          task.status === ReportStatus.ARRIVED ? 'bg-blue-50 text-blue-700' :
                          task.status === ReportStatus.IN_PROGRESS ? 'bg-indigo-50 text-indigo-700' :
                          task.status === ReportStatus.REVISION ? 'bg-red-50 text-red-700' :
                          'bg-purple-50 text-purple-700'
                       }`}>
                          {task.status}
                       </span>

                       {/* Action Buttons based on Status */}
                       
                       {/* 1. Pending -> Accept */}
                       {task.status === ReportStatus.PENDING_ACCEPTANCE && (
                          <button 
                            onClick={() => handleActionClick(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                          >
                             Terima Pekerjaan <CheckCircle2 size={14} />
                          </button>
                       )}

                       {/* 2. OTW -> Arrive */}
                       {task.status === ReportStatus.ON_THE_WAY && (
                          <button 
                            onClick={() => handleActionClick(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                          >
                             Sampai Lokasi <MapPin size={14} />
                          </button>
                       )}

                       {/* 3. Arrived -> Start */}
                       {task.status === ReportStatus.ARRIVED && (
                          <button 
                            onClick={() => handleActionClick(task)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                          >
                             Mulai Mengerjakan <PlayCircle size={14} />
                          </button>
                       )}

                       {/* 4. Progress -> Finish */}
                       {task.status === ReportStatus.IN_PROGRESS && (
                          <button 
                            onClick={() => handleActionClick(task)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                          >
                             Selesaikan Tugas <CheckCircle2 size={14} />
                          </button>
                       )}

                       {/* 5. Revision -> Resubmit */}
                       {task.status === ReportStatus.REVISION && (
                          <button 
                            onClick={() => handleActionClick(task)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                          >
                             Kirim Revisi <RotateCcw size={14} />
                          </button>
                       )}
                       
                       {task.status === ReportStatus.VERIFICATION && (
                          <span className="text-xs font-bold text-slate-400 italic">Menunggu Verifikasi Admin</span>
                       )}
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                   <CheckCircle2 size={32} />
                </div>
                <p className="text-sm font-medium">Tidak ada tugas aktif saat ini.</p>
                <p className="text-xs">Semua tugas telah diselesaikan.</p>
             </div>
           )}
        </div>
      </div>

      {actionTugas && (
        <ReportActionModal 
            tugas={actionTugas}
            role="PPSU"
            staffList={[]} // Not needed for PPSU actions
            onClose={() => setActionTugas(null)}
            onUpdate={handleUpdateFromAction}
        />
      )}
    </div>
  );
};

export default StaffTaskListModal;
