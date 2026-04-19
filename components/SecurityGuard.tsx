import React, { useState, useEffect, useCallback } from 'react';
import { Camera, MapPin, AlertTriangle, ShieldAlert, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';

interface SecurityGuardProps {
    user: User | null;
    children: React.ReactNode;
}

const SecurityGuard: React.FC<SecurityGuardProps> = ({ user, children }) => {
    const [permissions, setPermissions] = useState<{ camera: boolean; gps: boolean }>({ camera: false, gps: false });
    const [status, setStatus] = useState<'IDLE' | 'CHECKING' | 'DENIED' | 'VIOLATION' | 'OK'>('IDLE');
    const [violationType, setViolationType] = useState<string | null>(null);

    const checkSecurity = useCallback(async () => {
        setStatus('CHECKING');
        
        let camOk = false;
        let gpsOk = false;

        // 1. Check Camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            camOk = true;
        } catch (e) { camOk = false; }

        // 2. Check GPS
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { 
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            gpsOk = true;
            
            // Mock GPS Detection
            if (pos.coords.accuracy <= 0) {
                handleViolation('Manipulasi Lokasi (Mock GPS Terdeteksi)');
                return;
            }
        } catch (e) { gpsOk = false; }

        setPermissions({ camera: camOk, gps: gpsOk });

        if (!camOk || !gpsOk) {
            setStatus('DENIED');
            return;
        }

        // 3. Time Sync
        try {
            const serverTimeRes = await fetch('/api/time').then(r => r.json());
            const serverDate = new Date(serverTimeRes.datetime);
            const clientDate = new Date();
            const diffSeconds = Math.abs(serverDate.getTime() - clientDate.getTime()) / 1000;
            
            if (diffSeconds > 300) {
                handleViolation('Manipulasi Waktu (Jam Perangkat Salah)');
                return;
            }
        } catch (e) { /* server unreachable, continue */ }

        setStatus('OK');
    }, [user]);

    const handleViolation = async (type: string) => {
        setViolationType(type);
        setStatus('VIOLATION');
        if (user) {
            const deviceInfo = `${navigator.userAgent} (${navigator.platform})`;
            try {
                await apiService.logViolation({
                    userId: user.nik || user.id,
                    ppsuName: user.name || user.username,
                    deviceInfo,
                    violationType: type
                });
            } catch (e) { console.error('Violation logging failed', e); }
        }
    };

    useEffect(() => {
        // Auto-check if previously granted
        const autoCheck = async () => {
            if (navigator.permissions && (navigator.permissions as any).query) {
                const [camQuery, gpsQuery] = await Promise.all([
                    (navigator.permissions as any).query({ name: 'camera' }).catch(() => null),
                    (navigator.permissions as any).query({ name: 'geolocation' }).catch(() => null)
                ]);
                
                if (camQuery?.state === 'granted' && gpsQuery?.state === 'granted') {
                    checkSecurity();
                }
            }
        };
        autoCheck();
    }, [checkSecurity]);

    // Fullscreen on OK
    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile && status === 'OK') {
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen().catch(() => {});
            }
        }
    }, [status]);

    if (status === 'IDLE' || status === 'CHECKING') {
        return (
            <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-10 text-center text-white z-[9999]">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
                    <ShieldCheck size={48} className="text-indigo-500" />
                    {status === 'CHECKING' && <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-[2.5rem] animate-spin" />}
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Validasi Perangkat</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Mempersiapkan Lingkungan Kerja Aman</p>
                
                {status === 'IDLE' && (
                    <button 
                        onClick={checkSecurity}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all active:scale-95 flex items-center gap-3"
                    >
                        Mulai Verifikasi <ShieldCheck size={18} />
                    </button>
                )}
            </div>
        );
    }

    if (status === 'VIOLATION') {
        return (
            <div className="fixed inset-0 bg-red-600 flex flex-col items-center justify-center p-10 text-center text-white z-[9999]">
                <ShieldAlert size={100} className="mb-8 animate-bounce" />
                <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">KEAMANAN TERLANGGAR</h1>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 mb-8 max-w-md">
                    <p className="text-xl font-bold mb-2">Terdeteksi: {violationType}</p>
                    <p className="text-[10px] opacity-80 leading-relaxed font-bold uppercase tracking-widest">
                        Data manipulasi telah dikirim ke Pimpinan. Matikan Mock GPS atau sesuaikan waktu jam Anda untuk memulihkan akses.
                    </p>
                </div>
                <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">
                   Muat Ulang Halaman
                </button>
            </div>
        );
    }

    if (status === 'DENIED') {
        return (
            <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-10 text-center text-white z-[9999]">
                <AlertTriangle size={80} className="text-amber-500 mb-8" />
                <h1 className="text-3xl font-black mb-4 uppercase tracking-tight leading-none">IZIN DITOLAK</h1>
                <p className="text-slate-400 font-bold mb-10 max-w-xs text-xs uppercase tracking-tight">
                    Kamera dan GPS Dibutuhkan untuk memvalidasi kehadiran Anda. Silakan aktifkan melalui pengaturan browser.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
                    <div className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 ${permissions.camera ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-800/50 text-slate-500'}`}>
                        <Camera size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{permissions.camera ? 'Kamera Aktif' : 'Cek Kamera'}</span>
                    </div>
                    <div className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 ${permissions.gps ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-800/50 text-slate-500'}`}>
                        <MapPin size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{permissions.gps ? 'GPS Aktif' : 'Cek Lokasi'}</span>
                    </div>
                </div>

                <button onClick={checkSecurity} className="bg-indigo-600 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center gap-2">
                   <RefreshCw size={18} /> Coba Verifikasi Lagi
                </button>
            </div>
        );
    }

    return <>{children}</>;
};

export default SecurityGuard;
