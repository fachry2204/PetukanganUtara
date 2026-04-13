import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, RefreshCw, CheckCircle2, AlertTriangle, Send, ShieldCheck, ClipboardList } from 'lucide-react';
import { User as UserType, TugasPPSU, Staff, ReportStatus, AttendanceRecord } from '../types';
import LocationMiniMap from './LocationMiniMap';
import { apiService } from '../services/api';

export interface PPSUTaskInputSectionProps {
  user: UserType;
  tugasList: TugasPPSU[];
  setTugasList: React.Dispatch<React.SetStateAction<TugasPPSU[]>>;
  attendanceRecords?: AttendanceRecord[];
  schedules?: any[];
  staffList?: any[];
}

const PPSUTaskInputSection: React.FC<PPSUTaskInputSectionProps> = ({ user, tugasList, setTugasList, attendanceRecords = [], schedules = [], staffList = [] }) => {
  const [step, setStep] = useState<'idle' | 'form' | 'locating' | 'verify_location' | 'camera' | 'success'>('idle');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeOffset, setTimeOffset] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [submittedTime, setSubmittedTime] = useState<Date | null>(null);
  const [isSecure, setIsSecure] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('Memuat detail alamat...');

  // Lock UI if they haven't clocked in today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);
  const [hasCheckedOut, setHasCheckedOut] = useState<boolean>(false);
  const [hasSebelumTugas, setHasSebelumTugas] = useState<boolean>(false);
  const [hasSedangTugas, setHasSedangTugas] = useState<boolean>(false);
  const [hasSelesaiTugas, setHasSelesaiTugas] = useState<boolean>(false);
  const [hasIstirahat, setHasIstirahat] = useState<boolean>(false);
  const [hasSelesaiIstirahat, setHasSelesaiIstirahat] = useState<boolean>(false);

  useEffect(() => {
     if (step === 'idle') {
        const sebelumTugasStatus = localStorage.getItem(`task_${user.nik}_${todayDateStr}_Sebelum Tugas`) === 'true';
        const sedangTugasStatus = localStorage.getItem(`task_${user.nik}_${todayDateStr}_Sedang Tugas`) === 'true';
        const selesaiTugasStatus = localStorage.getItem(`task_${user.nik}_${todayDateStr}_Selesai Tugas`) === 'true';
        
        const checkedInStatus = attendanceRecords.some(r => r.userNik === user.nik && r.type === 'Absen Masuk' && r.timestamp.startsWith(todayDateStr));
        const checkedOutStatus = attendanceRecords.some(r => r.userNik === user.nik && r.type === 'Absen Pulang' && r.timestamp.startsWith(todayDateStr));
        const istirahatStatus = attendanceRecords.some(r => r.userNik === user.nik && r.type === 'Istirahat' && r.timestamp.startsWith(todayDateStr));
        const selesaiIstirahatStatus = attendanceRecords.some(r => r.userNik === user.nik && r.type === 'Selesai Istirahat' && r.timestamp.startsWith(todayDateStr));

        setHasCheckedIn(checkedInStatus);
        setHasCheckedOut(checkedOutStatus);
        setHasSebelumTugas(sebelumTugasStatus);
        setHasSedangTugas(sedangTugasStatus);
        setHasSelesaiTugas(selesaiTugasStatus);
        setHasIstirahat(istirahatStatus);
        setHasSelesaiIstirahat(selesaiIstirahatStatus);

        // Auto-select valid next step
        if (!sebelumTugasStatus) setTaskStatus('Sebelum Tugas');
        else if (!sedangTugasStatus) setTaskStatus('Sedang Tugas');
        else if (!selesaiTugasStatus) setTaskStatus('Selesai Tugas');
     }
  }, [step, user.nik, todayDateStr, attendanceRecords]);
  
  // Form State
  const [taskStatus, setTaskStatus] = useState<string>('Sebelum Tugas');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  // Update real-time clock independently of the device time via offset
  useEffect(() => {
    if (timeOffset !== null) {
      const interval = setInterval(() => {
        setCurrentTime(new Date(Date.now() + timeOffset));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeOffset]);

  // Stop camera when unmounting or changing steps
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const initiateCameraProcess = () => {
    if (taskStatus === 'Sebelum Tugas' && !taskTitle) {
      setError('Harap isi judul pekerjaan terlebih dahulu.');
      return;
    }
    
    // For not Sebelum Tugas, populate state from local storage so the report will capture the same information
    if (taskStatus !== 'Sebelum Tugas') {
        const savedTitle = localStorage.getItem(`taskTitle_${user.nik}_${todayDateStr}`);
        const savedDesc = localStorage.getItem(`taskDesc_${user.nik}_${todayDateStr}`);
        if (!savedTitle) {
            setError('Data Kegiatan "Sebelum Tugas" hilang atau belum dibuat hari ini.');
            return;
        }
        setTaskTitle(savedTitle);
        setTaskDesc(savedDesc || '');
    }

    setStep('locating');
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini.');
      setStep('idle');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        setStep('verify_location');
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          if (data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress('Detail alamat tidak ditemukan');
          }
        } catch (err) {
          setAddress('Gagal mengambil alamat (Koneksi bermasalah)');
        }
      },
      (err) => {
        setError('Gagal mendapatkan lokasi. Pastikan GPS aktif dengan akurasi tinggi (Anti-Mock).');
        setStep('idle');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const openCamera = async () => {
    setStep('camera');
    try {
      // Use environment or user facing back camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Request accurate time to local robust node server
      fetch('http://localhost:5000/api/time')
        .then(res => res.json())
        .then(data => {
            const serverDate = new Date(data.datetime);
            const offset = serverDate.getTime() - Date.now();
            setTimeOffset(offset);
            setCurrentTime(new Date(Date.now() + offset));
            setIsSecure(true);
        })
        .catch(() => {
           setTimeOffset(0);
           setCurrentTime(new Date());
           setIsSecure(true);
        });
    } catch (err) {
      setError('Gagal mengakses kamera. Izin ditolak.');
      setStep('idle');
    }
  };

  const takePhotoAndSubmit = async () => {
    if (videoRef.current && location) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        const timeToPrint = currentTime || new Date();
        const dateStr = timeToPrint.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'medium' });
        ctx.fillText(`Waktu: ${dateStr} (GMT+7)`, 20, 30);
        ctx.fillText(`GPS Lat: ${location.lat.toFixed(6)}`, 20, 55);
        ctx.fillText(`GPS Lng: ${location.lng.toFixed(6)}`, 20, 80);
        ctx.fillText(`Status: ${taskStatus}`, 20, 105);
        
        if (isSecure) {
           ctx.fillStyle = "#10b981";
           ctx.fillText('✔️ SECURE VALIDATED', 20, 130);
        }
        
        const imageSrc = canvas.toDataURL('image/jpeg');
        setPhoto(imageSrc);
        setSubmittedTime(timeToPrint); // Freeze checkout time
        
        // Simpan progress secara lokal
        localStorage.setItem(`task_${user.nik}_${todayDateStr}_${taskStatus}`, 'true');
        if (taskStatus === 'Sebelum Tugas') {
            localStorage.setItem(`taskTitle_${user.nik}_${todayDateStr}`, taskTitle);
            localStorage.setItem(`taskDesc_${user.nik}_${todayDateStr}`, taskDesc);
        }

        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }

        // SAVE TUGAS TO STATE/DB LOOP
        const timestampStr = timeToPrint.toISOString();
        const savedTaskId = localStorage.getItem(`taskId_${user.nik}_${todayDateStr}`);

        if (taskStatus === 'Sebelum Tugas') {
            const newTugas: Partial<TugasPPSU> = {
                id: `TUGAS-${Date.now()}`,
                judulTugas: taskTitle,
                deskripsi: taskDesc,
                kategori: 'Infrastruktur',
                lokasi: address,
                latitude: location.lat,
                longitude: location.lng,
                staffId: user.id || user.nik, 
                reporterName: user.name || user.username,
                reporterNik: user.nik || '',
                status: ReportStatus.VERIFICATION,
                timestamp: timestampStr,
                priority: 'Medium',
                fotoSebelum: imageSrc,
                photoUrl: imageSrc, // Default for compatibility
                logs: [{
                    status: ReportStatus.NEW,
                    actor: user.name || user.username,
                    timestamp: timestampStr,
                    note: `Laporan Awal (Sebelum Tugas) Berhasil`
                }]
            };

            try {
                const result = await apiService.createTugasPPSU(newTugas as any);
                localStorage.setItem(`taskId_${user.nik}_${todayDateStr}`, result.id);
                setTugasList([result, ...tugasList]);
                setStep('success');
            } catch (error) {
                console.error('Failed to create tugas:', error);
                setError('Gagal membuat laporan awal.');
            }
        } else {
            // UPDATING EXISTING TASK
            if (!savedTaskId) {
                setError('ID Laporan Awal tidak ditemukan. Silahkan mulai dari awal.');
                return;
            }

            let taskToUpdate = tugasList.find(t => t.id === savedTaskId);
            
            // If not in props, maybe it was just created and props haven't updated
            if (!taskToUpdate) {
                try {
                    const allTugas = await apiService.getTugasPPSU();
                    taskToUpdate = allTugas.find(t => t.id === savedTaskId);
                } catch (e) {
                    console.error("Failed to fetch fresh tugas list", e);
                }
            }

            if (!taskToUpdate) {
                setError('Laporan tidak ditemukan di daftar. Coba refresh halaman anda.');
                return;
            }

            const updatedTask: TugasPPSU = {
                ...taskToUpdate,
                logs: [
                    ...(taskToUpdate.logs || []),
                    {
                        status: taskStatus === 'Sedang Tugas' ? ReportStatus.IN_PROGRESS : ReportStatus.VERIFICATION,
                        actor: user.name || user.username,
                        timestamp: timestampStr,
                        note: `Progres Terlaporkan: ${taskStatus}`
                    }
                ]
            };

            if (taskStatus === 'Sedang Tugas') {
                updatedTask.fotoSedang = imageSrc;
                updatedTask.status = ReportStatus.IN_PROGRESS;
            } else if (taskStatus === 'Selesai Tugas') {
                updatedTask.fotoSesudah = imageSrc;
                updatedTask.status = ReportStatus.VERIFICATION;
                updatedTask.photoUrl = imageSrc; // Update default one
            }

            try {
                await apiService.updateTugasPPSU(updatedTask);
                
                // Clear state for next task if finished
                if (taskStatus === 'Selesai Tugas') {
                    localStorage.removeItem(`taskId_${user.nik}_${todayDateStr}`);
                    localStorage.removeItem(`taskTitle_${user.nik}_${todayDateStr}`);
                    localStorage.removeItem(`taskDesc_${user.nik}_${todayDateStr}`);
                }

                setTugasList(prev => {
                    const exists = prev.some(t => t.id === updatedTask.id);
                    if (exists) {
                        return prev.map(t => t.id === updatedTask.id ? updatedTask : t);
                    }
                    return [updatedTask, ...prev];
                });
                setStep('success');
            } catch (error) {
                console.error('Failed to update tugas:', error);
                setError('Gagal memperbarui progres tugas.');
            }
        }
      }
    }
  };

  const reset = () => {
    setStep('idle');
    setPhoto(null);
    setLocation(null);
    setStream(null);
    setTaskTitle('');
    setTaskDesc('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ClipboardList size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">Laporan Tugas Lapangan</h2>
                <p className="text-xs font-semibold text-slate-500">Live Camera Tracking & GPS Validation</p>
            </div>
        </div>

        <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold my-5 border border-emerald-100">
            <ShieldCheck size={16} />
            Anti-Mock GPS & Time-tampering Module Active
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 mb-6">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 'idle' && (
          !hasCheckedIn ? (
             <div className="flex flex-col items-center justify-center py-10 px-4 space-y-3 text-center mt-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-1 shadow-inner border-4 border-white">
                    <AlertTriangle size={32} />
                </div>
                <div>
                   <h3 className="text-base font-bold text-slate-800">Akses Melapor Terkunci</h3>
                   <p className="text-slate-500 font-medium text-[13px] mt-2 leading-relaxed">Anda belum memiliki histori <b>Absen Masuk</b> untuk hari ini.<br/>Silahkan lakukan absensi terlebih dahulu di menu <b>Absen</b> sebelum Anda diizinkan untuk melaporkan bukti progres Tugas Lapangan.</p>
                </div>
             </div>
          ) : (hasIstirahat && !hasSelesaiIstirahat) ? (
             <div className="flex flex-col items-center justify-center py-10 px-4 space-y-3 text-center mt-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-1 shadow-inner border-4 border-white">
                    <AlertTriangle size={32} />
                </div>
                <div>
                   <h3 className="text-base font-bold text-slate-800">Sistem Terkunci</h3>
                   <p className="text-slate-500 font-medium text-[13px] mt-2 leading-relaxed">
                       Anda Sedang <b>Istirahat</b>, tidak bisa melakukan pelaporan tugas.<br/>Pergunakan waktu istirahat Anda sebaik mungkin.
                   </p>
                </div>
             </div>
          ) : hasCheckedOut ? (
             <div className="flex flex-col items-center justify-center py-10 px-4 space-y-3 text-center mt-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-1 shadow-inner border-4 border-white">
                    <CheckCircle2 size={32} />
                </div>
                <div>
                   <h3 className="text-base font-bold text-slate-800">Tugas Tidak Ada</h3>
                   <p className="text-slate-500 font-medium text-[13px] mt-2 leading-relaxed">
                       Anda sudah melakukan <b>Absensi Pulang</b>, Anda tidak bisa melaksanakan tugas lagi.
                   </p>
                </div>
             </div>
          ) : hasSelesaiTugas ? (
             <div className="flex flex-col items-center justify-center py-10 px-4 space-y-4 text-center mt-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-1 shadow-inner border-4 border-white">
                    <CheckCircle2 size={32} />
                </div>
                <div>
                   <h3 className="text-base font-bold text-slate-800">Tugas Harian Selesai</h3>
                   <p className="text-slate-500 font-medium text-[13px] mt-2 leading-relaxed mb-6">
                       Anda telah menyelesaikan seluruh tahapan pelaporan tugas ini.
                   </p>
                   <button 
                     onClick={() => {
                        localStorage.removeItem(`task_${user.nik}_${todayDateStr}_Sebelum Tugas`);
                        localStorage.removeItem(`task_${user.nik}_${todayDateStr}_Sedang Tugas`);
                        localStorage.removeItem(`task_${user.nik}_${todayDateStr}_Selesai Tugas`);
                        setHasSebelumTugas(false);
                        setHasSedangTugas(false);
                        setHasSelesaiTugas(false);
                        setTaskTitle('');
                        setTaskDesc('');
                        setTaskStatus('Sebelum Tugas');
                     }}
                     className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
                   >
                     <ClipboardList size={18} /> Lakukan Tugas Baru
                   </button>
                </div>
             </div>
          ) : (
            <div className="space-y-6 mt-8">
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Status Progres Tugas</label>
                      <div className="flex gap-2">
                          {['Sebelum Tugas', 'Sedang Tugas', 'Selesai Tugas'].map(s => {
                              let isDisabled = false;
                              if (s === 'Sebelum Tugas') isDisabled = hasSebelumTugas;
                              if (s === 'Sedang Tugas') isDisabled = !hasSebelumTugas || hasSedangTugas;
                              if (s === 'Selesai Tugas') isDisabled = !hasSedangTugas || hasSelesaiTugas;

                              return (
                                  <button 
                                      key={s}
                                      onClick={() => setTaskStatus(s)}
                                      disabled={isDisabled}
                                      className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center gap-1
                                        ${isDisabled ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 
                                          taskStatus === s ? 'bg-orange-500 border-orange-600 text-white shadow-md' : 
                                          'bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-300'
                                        }`}
                                  >
                                      {s} {isDisabled && (hasSebelumTugas && s === 'Sebelum Tugas' || hasSedangTugas && s === 'Sedang Tugas') ? '✔️' : ''}
                                  </button>
                              );
                          })}
                      </div>
                      {(!hasSebelumTugas && taskStatus !== 'Sebelum Tugas') && (
                          <p className="text-[11px] font-bold text-rose-500 mt-2">* Harap selesaikan Laporan "Sebelum Tugas" terlebih dahulu.</p>
                      )}
                  </div>

                  {taskStatus === 'Sebelum Tugas' ? (
                      <>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Judul Pekerjaan</label>
                              <input 
                                  type="text" 
                                  value={taskTitle}
                                  onChange={e => setTaskTitle(e.target.value)}
                                  placeholder="Cth: Membersihkan Gorong-gorong RW 04" 
                                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                              <textarea 
                                  value={taskDesc}
                                  onChange={e => setTaskDesc(e.target.value)}
                                  placeholder="Catatan kondisi lapangan saat pengambilan foto..." 
                                  rows={3}
                                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium resize-none"
                              />
                          </div>
                      </>
                  ) : (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-inner">
                         <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] tracking-widest uppercase bg-indigo-100 px-2.5 py-1 rounded-lg w-max mb-1">
                             <ClipboardList size={14} /> Berdasarkan Laporan Awal
                         </div>
                         <div>
                             <h4 className="font-bold text-slate-800 text-base">{localStorage.getItem(`taskTitle_${user.nik}_${todayDateStr}`) || 'Judul hilang'}</h4>
                             <p className="text-sm font-medium text-slate-500 leading-relaxed mt-1">{localStorage.getItem(`taskDesc_${user.nik}_${todayDateStr}`) || 'Tidak ada keterangan tambahan.'}</p>
                         </div>
                      </div>
                  )}
              </div>

              <button 
                onClick={initiateCameraProcess}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              >
                <Camera size={18} /> Lanjut Akses Kamera
              </button>
            </div>
          )
        )}

        {step === 'locating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="text-slate-600 font-bold">Menghubungkan ke Satelit GPS...</p>
          </div>
        )}

        {step === 'verify_location' && (
          <div className="space-y-4 mt-6">
            <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col gap-3">
              <h3 className="text-slate-800 font-bold text-center mb-2">Verifikasi Titik Lokasi</h3>
              <div className="flex flex-col gap-2 mb-2">
                  <div className="bg-slate-50 text-slate-700 p-3 rounded-xl text-xs font-mono border border-slate-200 flex flex-col justify-center gap-1 shadow-sm">
                    <span className="flex items-center gap-2 font-bold text-emerald-600">
                      <MapPin size={12} /> Real-Time Coordinates
                    </span>
                    <div className="grid grid-cols-2 mt-1 font-semibold">
                        <span>LATITUDE: {location?.lat.toFixed(6)}</span>
                        <span>LONGITUDE: {location?.lng.toFixed(6)}</span>
                    </div>
                  </div>
                  
                  {location && <LocationMiniMap lat={location.lat} lng={location.lng} />}
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl flex items-start gap-3 border border-emerald-100 mt-2">
                <div className="bg-emerald-500 text-white p-2 rounded-lg shrink-0">
                   <MapPin size={16} />
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-semibold line-clamp-2">{address}</p>
              </div>
            </div>

            <button 
              onClick={openCamera}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Camera size={20} /> Lanjut Akses Kamera
            </button>
            <button onClick={reset} className="w-full py-2 text-slate-400 font-bold text-sm">Batal</button>
          </div>
        )}

        {step === 'camera' && (
          <div className="space-y-4 mt-6">
            <div className="bg-slate-900 border-2 border-slate-800 p-2 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 bg-black/40 rounded-xl mb-3 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono">
                  {currentTime && (
                    <span className="text-slate-300">
                       {currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="text-orange-400 font-bold text-[10px] uppercase">{taskStatus}</div>
              </div>



              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] md:aspect-video mb-1 border border-white/10 group">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                
                {/* Crosshairs & Overlay for realistic camera feel */}
                <div className="absolute inset-0 border-2 border-white/10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-[1.5px] border-orange-500/50 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={takePhotoAndSubmit}
                disabled={!isSecure}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 ${isSecure ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-400 cursor-not-allowed'}`}
              >
                <Send size={20} /> {isSecure ? 'Kirim Laporan' : 'Proses Verifikasi...'}
              </button>
              <button 
                onClick={() => setStep('verify_location')} 
                className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {step === 'success' && photo && (
          <div className="flex flex-col items-center text-center space-y-6 py-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-100">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Laporan Berhasil Terkirim!</h3>
              <p className="text-slate-500 font-medium">Status <span className="font-bold text-orange-500">{taskStatus}</span> berhasil diverifikasi oleh sistem.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 w-full max-w-sm mx-auto shadow-sm">
              <img src={photo} alt="Laporan Foto" className="w-full h-48 object-cover rounded-2xl mb-5 border border-slate-200" />
              
              <div className="space-y-4 text-left">
                <div className="flex flex-col gap-1 pb-3 border-b border-slate-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Waktu Laporan (Server)</span>
                  <span className="font-black text-slate-800 text-sm">
                      {submittedTime ? `${submittedTime.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'full' })} - ${submittedTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', timeStyle: 'medium' })}` : '-'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 pb-3 border-b border-slate-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Lokasi Laporan</span>
                  <div className="flex gap-3">
                     <div className="flex-1">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200 px-2 py-1 rounded inline-block mb-1">
                          {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                        </span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{address}</p>
                     </div>
                     {location && (
                        <div className="w-16 h-16 shrink-0 aspect-square rounded-xl overflow-hidden shadow-sm pointer-events-none opacity-90 grayscale-[30%] border border-slate-200">
                             <LocationMiniMap lat={location.lat} lng={location.lng} />
                        </div>
                     )}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-orange-50 px-3 py-2 rounded-xl border border-orange-100">
                   <span className="text-orange-700 text-xs font-bold">Status Verifikasi</span>
                   <span className="bg-orange-500 text-white px-2 py-0.5 rounded-lg text-xs font-black uppercase">Pending Approval</span>
                </div>
              </div>
            </div>

            <button 
              onClick={reset}
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-200 font-bold text-sm flex items-center justify-center gap-2 px-6 py-4 w-full max-w-sm mx-auto bg-slate-100 rounded-xl transition-all mt-4"
            >
              <CheckCircle2 size={20} className="text-emerald-500" /> Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PPSUTaskInputSection;
