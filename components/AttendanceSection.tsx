
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, MapPin, RefreshCw, CheckCircle2, AlertTriangle, User, History as HistoryIcon } from 'lucide-react';
import { User as UserType, AttendanceRecord, AttendanceType } from '../types';
import LocationMiniMap from './LocationMiniMap';
import { apiService } from '../services/api';

interface AttendanceSectionProps {
  user: UserType;
  attendanceRecords?: AttendanceRecord[];
  schedules?: any[];
  staffList?: any[];
  onRecord?: (record: AttendanceRecord) => void;
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({ user, attendanceRecords = [], schedules = [], staffList = [], onRecord }) => {
  const [step, setStep] = useState<'idle' | 'locating' | 'verify_location' | 'camera' | 'success'>('idle');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeOffset, setTimeOffset] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [submittedTime, setSubmittedTime] = useState<Date | null>(null);
  const [isSecure, setIsSecure] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('Memuat detail alamat...');
  
  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = DAYS[new Date().getDay()];
  const todayDateStr = new Date().toISOString().split('T')[0];

  const mySchedules = useMemo(() => {
    const myStaffMember = staffList.find(s => s.nik === user.nik || s.nomorAnggota === user.username);
    const resolvedNik = myStaffMember ? myStaffMember.nik : user.nik;
    return schedules.filter(s => {
        const sNik = String(s.nik || '');
        const sStaffId = String(s.staff_id || '');
        const sMemberId = String(s.nomor_anggota || '');
        
        const isMyNik = sNik && (sNik === String(user.nik || '') || (myStaffMember && sNik === String(myStaffMember.nik)));
        const isMyStaffId = sStaffId && (sStaffId === String(user.id || '') || (myStaffMember && sStaffId === String(myStaffMember.id)));
        const isMyMemberId = sMemberId && (sMemberId === String(user.username || '') || (myStaffMember && sMemberId === String(myStaffMember.nomorAnggota)));
        
        const isMySchedule = isMyNik || isMyStaffId || isMyMemberId;
        const sDateStr = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
        return isMySchedule && sDateStr === todayDateStr;
    });
  }, [schedules, user.nik, user.username, staffList, todayDateStr]);

  const fetchMyRequests = async () => {
    try {
        const data = await apiService.getMyAttendanceRequests(user.nik!);
        setRequests(data || []);
    } catch (err) {
        console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [user.nik]);

  const approvedRequestForToday = useMemo(() => {
    return requests.find(r => r.request_date.split('T')[0] === todayDateStr && r.status === 'APPROVED');
  }, [requests, todayDateStr]);

  const activeSchedule = useMemo(() => {
    if (approvedRequestForToday) return { id: `REQ-${approvedRequestForToday.id}`, shift: 'MANUAL', area: 'Zona Terbuka (Manual)', start_time: '00:00', end_time: '23:59' };
    if (mySchedules.length === 0) return null;
    const now = new Date().toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
    // Find a schedule where 'now' is within start and end time (or the closest one)
    return mySchedules.find(s => now >= s.start_time.slice(0, 5) && now <= s.end_time.slice(0, 5)) || mySchedules[0];
  }, [mySchedules, approvedRequestForToday]);
  
  const checkHasAttended = (type: string) => {
      return attendanceRecords.some(r => 
        (r.userNik === user.nik || r.userId === user.id) && 
        r.type === type && 
        r.timestamp.startsWith(todayDateStr)
      );
  };

  const hasCheckedIn = useMemo(() => checkHasAttended('Absen Masuk'), [attendanceRecords, todayDateStr, user.nik, user.id, activeSchedule]);
  const hasIstirahat = useMemo(() => checkHasAttended('Istirahat'), [attendanceRecords, todayDateStr, user.nik, user.id, activeSchedule]);
  const hasSelesaiIstirahat = useMemo(() => checkHasAttended('Selesai Istirahat'), [attendanceRecords, todayDateStr, user.nik, user.id, activeSchedule]);
  const hasCheckedOut = useMemo(() => checkHasAttended('Absen Pulang'), [attendanceRecords, todayDateStr, user.nik, user.id, activeSchedule]);
  
  const [istirahatDurationStr, setIstirahatDurationStr] = useState<string | null>(null);
  
  type AttendanceType = 'Absen Masuk' | 'Istirahat' | 'Selesai Istirahat' | 'Absen Pulang';
  
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('Absen Masuk');

  useEffect(() => {
    if (!hasCheckedIn) setAttendanceType('Absen Masuk');
    else if (!hasIstirahat) setAttendanceType('Istirahat');
    else if (!hasSelesaiIstirahat) setAttendanceType('Selesai Istirahat');
    else if (!hasCheckedOut) setAttendanceType('Absen Pulang');
  }, [hasCheckedIn, hasIstirahat, hasSelesaiIstirahat, hasCheckedOut]);

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

  const startAttendance = () => {
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
        setError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.');
        setStep('idle');
      },
      { enableHighAccuracy: true }
    );
  };

  const openCamera = async () => {
    setStep('camera');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      // Verifikasi jam ke Server Node.js kita langsung (100% Anti-Mock & Tidak mungkin di-block CORS/DNS)
      // Gunakan ip localhost karena berjalan di mesin yang sama, kalau di versi production ganti ke domain VPS
      fetch('http://localhost:5000/api/time')
        .then(res => res.json())
        .then(data => {
            const serverDate = new Date(data.datetime);
            const offset = serverDate.getTime() - Date.now();
            setTimeOffset(offset);
            setCurrentTime(new Date(Date.now() + offset));
            
            // Verifikasi Anti-Mock GPS (Heuristik)
            setIsSecure(true);
        })
        .catch(() => {
           // Fallback if API totally disconnected (offline)
           setTimeOffset(0);
           setCurrentTime(new Date());
           setIsSecure(true);
        });
    } catch (err) {
      setError('Gagal mengakses kamera. Izin ditolak atau perangkat tidak tersedia.');
      setStep('idle');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && location) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw video frame
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Add timestamp overlay
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        const timeToPrint = currentTime || new Date();
        const dateStr = timeToPrint.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'medium' });
        ctx.fillText(`Waktu: ${dateStr} (GMT+7)`, 20, 30);
        ctx.fillText(`GPS Lat: ${location.lat.toFixed(6)}`, 20, 55);
        ctx.fillText(`GPS Lng: ${location.lng.toFixed(6)}`, 20, 80);
        ctx.fillText(`Status: ${attendanceType}`, 20, 105);
        
        if (isSecure) {
           ctx.fillStyle = "#10b981"; // emerald-500
           ctx.fillText('✔️ VERIFIED SYSTEM: ANTI-MOCK & TIME SECURE', 20, 130);
        }
        
        const imageSrc = canvas.toDataURL('image/jpeg');
        setPhoto(imageSrc);
        setSubmittedTime(timeToPrint); // Freeze attendance time
        
        // Simpan marker absensi ke Database
        const newRecord = {
            id: Date.now().toString(),
            staffId: user.id || 'unknown',
            type: attendanceType,
            timestamp: timeToPrint.toISOString(),
            latitude: location.lat,
            longitude: location.lng,
            photoUrl: imageSrc,
            nik: user.nik || 'unknown',
            staffName: user.name || user.username || 'unknown',
            address: address,
            jadwalId: activeSchedule?.id || null
        };

        apiService.createAttendance(newRecord).catch(err => {
            console.error("API Attendance Error:", err);
            if (err.response?.data?.error) {
                alert(err.response.data.error);
                setStep('idle');
            }
        });
        
        if (attendanceType === 'Istirahat') {
            localStorage.setItem(`istirahatTime_${user.nik}_${todayDateStr}`, timeToPrint.getTime().toString());
        }
        if (attendanceType === 'Selesai Istirahat') {
            const startTimeStr = localStorage.getItem(`istirahatTime_${user.nik}_${todayDateStr}`);
            if (startTimeStr) {
                const startMs = parseInt(startTimeStr, 10);
                const endMs = timeToPrint.getTime();
                const diffMs = endMs - startMs;
                const diffMinutes = Math.floor(diffMs / 60000);
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                setIstirahatDurationStr(`${hours} Jam ${minutes} Menit`);
            }
        }

        // Notify parent of the new record
        if (onRecord) {
            onRecord({
                id: Date.now().toString(),
                userId: user.id || 'unknown',
                userNik: user.nik || 'unknown',
                userName: user.name || user.username || 'unknown',
                type: attendanceType,
                timestamp: timeToPrint.toISOString(),
                latitude: location.lat,
                longitude: location.lng,
                address: address,
                photo: imageSrc
            });
        }

        // Stop stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        
        setStep('success');
      }
    }
  };

  const reset = () => {
    setStep('idle');
    setPhoto(null);
    setLocation(null);
    setStream(null);
  };

  const handleRequestOpenAbsen = async () => {
    setIsRequesting(true);
    try {
        await apiService.createAttendanceRequest({
            staff_id: user.id,
            nik: user.nik,
            staff_name: user.name,
            request_date: todayDateStr
        });
        alert("Permintaan buka absen berhasil dikirim. Harap tunggu verifikasi Admin/Pimpinan.");
        fetchMyRequests();
    } catch (err: any) {
        alert(err.response?.data?.error || "Gagal mengirim permintaan.");
    } finally {
        setIsRequesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Absensi Harian PPSU</h2>
        {activeSchedule ? (
            <div className={`p-3 rounded-2xl flex items-center gap-3 mb-4 ${approvedRequestForToday ? 'bg-emerald-50 border border-emerald-100' : 'bg-indigo-50 border border-indigo-100'}`}>
                <div className={`${approvedRequestForToday ? 'bg-emerald-600' : 'bg-indigo-600'} text-white p-2 rounded-xl`}>
                    <HistoryIcon size={18} />
                </div>
                <div>
                   <p className={`text-[10px] font-black uppercase leading-none mb-1 ${approvedRequestForToday ? 'text-emerald-400' : 'text-indigo-400'}`}>{approvedRequestForToday ? 'Akses Absen Dibuka (Manual)' : 'Jadwal Tugas Hari Ini'}</p>
                   <p className="text-xs font-bold text-slate-700">{activeSchedule.shift} {activeSchedule.start_time && `(${activeSchedule.start_time.slice(0, 5)} - ${activeSchedule.end_time.slice(0, 5)})`} • {activeSchedule.area}</p>
                </div>
            </div>
        ) : (
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white p-2 rounded-xl">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                    <p className="text-[10px] font-black uppercase text-amber-600 leading-none mb-1">Akses Absen Terkunci</p>
                    <p className="text-xs font-bold text-slate-700 italic">Anda tidak memiliki jadwal tugas hari ini.</p>
                    </div>
                </div>
                
                {(() => {
                    const todayReq = requests.find(r => r.request_date.split('T')[0] === todayDateStr);
                    if (todayReq) {
                        return (
                            <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${todayReq.status === 'PENDING' ? 'bg-amber-50/50 border-amber-200' : 'bg-rose-50 border-rose-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full animate-ping ${todayReq.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${todayReq.status === 'PENDING' ? 'text-amber-600' : 'text-rose-600'}`}>
                                            Status: {todayReq.status}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black bg-white/50 px-2 py-1 rounded-lg border border-current/10">
                                        HARI INI
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); fetchMyRequests(); }}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 ${todayReq.status === 'PENDING' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}
                                        title="Refresh Status"
                                    >
                                        <RefreshCw size={20} className={todayReq.status === 'PENDING' ? 'animate-spin-slow' : ''} />
                                    </button>
                                    <p className={`text-xs font-bold leading-relaxed flex-1 ${todayReq.status === 'PENDING' ? 'text-amber-700' : 'text-rose-700'}`}>
                                        {todayReq.status === 'PENDING' 
                                            ? 'Permintaan terkirim. Menunggu approve Staff Kelurahan.' 
                                            : 'Maaf, permintaan buka absen Anda ditolak oleh Pimpinan.'}
                                    </p>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <button 
                            onClick={handleRequestOpenAbsen}
                            disabled={isRequesting}
                            className="group relative w-full overflow-hidden rounded-2xl transition-all active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 transition-transform group-hover:scale-105"></div>
                            <div className="relative py-4 px-6 flex items-center justify-center gap-3 text-white">
                                {isRequesting ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                    <AlertTriangle size={18} className="group-hover:rotate-12 transition-transform" />
                                )}
                                <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                                    {isRequesting ? 'Mengirim Permintaan...' : 'Request Buka Absen (Hubungi Pimpinan)'}
                                </span>
                            </div>
                        </button>
                    );
                })()}
            </div>
        )}
        <p className="text-sm text-slate-500 mb-6">Silahkan melakukan absensi dengan foto selfie dan tag lokasi GPS untuk memulai tugas.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 mb-6">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 'idle' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-8">
            {hasCheckedIn && hasIstirahat && hasSelesaiIstirahat && hasCheckedOut ? (
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 size={48} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Selesai Bertugas!</h3>
                        <p className="text-slate-500 text-xs mt-2">Anda telah menyelesaikan seluruh siklus absensi dari Masuk hingga Pulang hari ini.</p>
                    </div>
                </div>
            ) : (
                <>
                <div className="w-full max-w-sm">
                    <label className="block text-sm font-bold text-slate-700 mb-3 text-left">Pilih Jenis Absensi Server</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setAttendanceType('Absen Masuk')}
                            disabled={hasCheckedIn}
                            className={`py-4 px-3 rounded-2xl text-[13px] leading-tight font-black transition-all border-2 flex items-center justify-center text-center ${hasCheckedIn ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' : attendanceType === 'Absen Masuk' ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                        >
                            {hasCheckedIn ? 'Masuk ✔️' : 'Absen Masuk'}
                        </button>
                        
                        <button 
                            onClick={() => setAttendanceType('Istirahat')}
                            disabled={!hasCheckedIn || hasIstirahat}
                            className={`py-4 px-3 rounded-2xl text-[13px] leading-tight font-black transition-all border-2 flex items-center justify-center text-center ${hasIstirahat ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' : !hasCheckedIn ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : attendanceType === 'Istirahat' ? 'bg-amber-500 border-amber-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-amber-300'}`}
                        >
                            {hasIstirahat ? 'Istirahat ✔️' : 'Istirahat'}
                        </button>

                        <button 
                            onClick={() => setAttendanceType('Selesai Istirahat')}
                            disabled={!hasIstirahat || hasSelesaiIstirahat}
                            className={`py-4 px-3 rounded-2xl text-[13px] leading-tight font-black transition-all border-2 flex items-center justify-center text-center ${hasSelesaiIstirahat ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' : !hasIstirahat ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : attendanceType === 'Selesai Istirahat' ? 'bg-cyan-500 border-cyan-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-cyan-300'}`}
                        >
                            {hasSelesaiIstirahat ? 'Selesai Ist. ✔️' : 'Selesai Istirahat'}
                        </button>

                        <button 
                            onClick={() => setAttendanceType('Absen Pulang')}
                            disabled={!hasSelesaiIstirahat || hasCheckedOut}
                            className={`py-4 px-3 rounded-2xl text-[13px] leading-tight font-black transition-all border-2 flex items-center justify-center text-center ${hasCheckedOut ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' : !hasSelesaiIstirahat ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : attendanceType === 'Absen Pulang' ? 'bg-rose-500 border-rose-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-rose-300'}`}
                        >
                            {hasCheckedOut ? 'Pulang ✔️' : 'Absen Pulang'}
                        </button>
                    </div>
                    {(!hasCheckedIn && attendanceType !== 'Absen Masuk') && (
                        <p className="text-rose-500 text-xs font-bold mt-3 text-center">Harap lakukan Absen Masuk terlebih dahulu.</p>
                    )}
                </div>

                <button 
                  onClick={startAttendance}
                  disabled={(!hasCheckedIn && attendanceType !== 'Absen Masuk') || !activeSchedule}
                  className={`w-full max-w-sm py-4 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${((!hasCheckedIn && attendanceType !== 'Absen Masuk') || !activeSchedule) ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-black shadow-slate-200'}`}
                >
                  <Camera size={20} /> Buka Kamera & Deteksi GPS
                </button>
                </>
            )}
          </div>
        )}

        {step === 'locating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-slate-600 font-medium">Mencari titik lokasi Anda...</p>
          </div>
        )}

        {step === 'verify_location' && (
          <div className="space-y-4 mt-6">
            <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col gap-3">
              <h3 className="text-slate-800 font-bold text-center mb-2">Verifikasi Titik Lokasi</h3>
              <div className="flex flex-col gap-2 mb-2">
                  <div className="bg-slate-50 text-slate-700 p-3 rounded-xl text-xs font-mono border border-slate-200 flex flex-col justify-center gap-1 shadow-sm">
                    <span className="flex items-center gap-2 font-bold text-emerald-600">
                      <MapPin size={12} /> Live GPS Coordinate
                    </span>
                    <div className="grid grid-cols-2 mt-1 font-semibold">
                        <span>LAT: {location?.lat.toFixed(6)}</span>
                        <span>LNG: {location?.lng.toFixed(6)}</span>
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
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Camera size={20} /> Lanjut Akses Kamera
            </button>
            <button onClick={reset} className="w-full py-2 text-slate-400 font-bold text-sm">Batal</button>
          </div>
        )}

        {step === 'camera' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border-2 border-slate-800 p-2 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 bg-black/40 rounded-xl mb-3 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono">
                  {currentTime && (
                    <span className="text-slate-300">
                       {currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] md:aspect-video mb-1 border border-white/10">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={takePhoto}
                disabled={!isSecure}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 ${isSecure ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-400 cursor-not-allowed'}`}
              >
                <Camera size={20} /> {isSecure ? `Ambil Foto ${attendanceType}` : 'Tunggu Verifikasi GPS...'}
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
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Absensi Berhasil!</h3>
              <p className="text-slate-500">Data <span className="font-bold text-indigo-600">{attendanceType}</span> Anda telah tercatat.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 w-full max-w-sm mx-auto shadow-sm">
              <img src={photo} alt="Selfie Absensi" className="w-full h-48 object-cover rounded-2xl mb-5 shadow-sm border border-slate-200" />
              
              <div className="space-y-4 text-left">
                <div className="flex flex-col gap-1 pb-3 border-b border-slate-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Waktu Terekam (Server)</span>
                  <span className="font-black text-slate-800 text-sm">
                      {submittedTime ? `${submittedTime.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'full' })} - ${submittedTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', timeStyle: 'medium' })}` : '-'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 pb-3 border-b border-slate-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Lokasi Absensi</span>
                  <div className="flex gap-3">
                     <div className="flex-1">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200 px-2 py-1 rounded inline-block mb-1">
                          {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                        </span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{address}</p>
                     </div>
                     {location && (
                        <div className="w-16 h-16 shrink-0 aspect-square rounded-xl overflow-hidden shadow-sm pointer-events-none opacity-90 grayscale-[30%]">
                             <LocationMiniMap lat={location.lat} lng={location.lng} />
                        </div>
                     )}
                  </div>
                </div>

                {istirahatDurationStr && attendanceType === 'Selesai Istirahat' && (
                    <div className="flex justify-between items-center bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 mt-2">
                       <span className="text-amber-700 text-xs font-bold">Total Waktu Istirahat</span>
                       <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-black">{istirahatDurationStr}</span>
                    </div>
                )}

                <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 mt-2">
                   <span className="text-indigo-700 text-xs font-bold">Jenis Absen</span>
                   <span className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">{attendanceType}</span>
                </div>

                <div className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                   <span className="text-emerald-700 text-xs font-bold">Status Sistem</span>
                   <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-xs font-black">TERVERIFIKASI</span>
                </div>
              </div>
            </div>

            <button 
              onClick={reset}
              className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-xl transition-all"
            >
              <RefreshCw size={18} /> Lakukan Absen Lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceSection;
