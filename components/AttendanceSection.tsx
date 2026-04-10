
import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, RefreshCw, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { User as UserType } from '../types';

interface AttendanceSectionProps {
  user: UserType;
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({ user }) => {
  const [step, setStep] = useState<'idle' | 'locating' | 'camera' | 'success'>('idle');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        openCamera();
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
        ctx.font = "20px Arial";
        ctx.fillText(new Date().toLocaleString(), 20, 40);
        ctx.fillText(`Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`, 20, 70);
        
        const imageSrc = canvas.toDataURL('image/jpeg');
        setPhoto(imageSrc);
        
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Absensi Harian PPSU</h2>
        <p className="text-slate-500 mb-6">Silahkan melakukan absensi dengan foto selfie dan tag lokasi GPS untuk memulai tugas.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 mb-6">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 'idle' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center animate-pulse">
              <Camera size={48} className="text-purple-500" />
            </div>
            <button 
              onClick={startAttendance}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-100 transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              <MapPin size={18} /> Mulai Absensi & Tag Lokasi
            </button>
          </div>
        )}

        {step === 'locating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-slate-600 font-medium">Mencari titik lokasi Anda...</p>
          </div>
        )}

        {step === 'camera' && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] md:aspect-video shadow-lg">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-sm flex items-center gap-2">
                <MapPin size={12} className="text-green-400" />
                {location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}
              </div>
            </div>
            <button 
              onClick={takePhoto}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Camera size={20} /> Ambil Foto Selfie
            </button>
          </div>
        )}

        {step === 'success' && photo && (
          <div className="flex flex-col items-center text-center space-y-6 py-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Absensi Berhasil!</h3>
              <p className="text-slate-500">Data kehadiran Anda telah tercatat.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full max-w-sm mx-auto">
              <img src={photo} alt="Selfie Absensi" className="w-full h-48 object-cover rounded-xl mb-4" />
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Waktu</span>
                  <span className="font-bold text-slate-800">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Koordinat</span>
                  <span className="font-mono text-xs font-bold text-slate-800 truncate ml-4">
                    {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Status</span>
                   <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">ONLINE</span>
                </div>
              </div>
            </div>

            <button 
              onClick={reset}
              className="text-slate-400 hover:text-slate-600 font-medium text-sm flex items-center gap-2"
            >
              <RefreshCw size={14} /> Absen Ulang (Demo)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceSection;
