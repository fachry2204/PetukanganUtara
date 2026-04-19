import React, { useState, useEffect } from 'react';
import { Camera, MapPin, AlertTriangle, ShieldAlert, Smartphone } from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';

interface SecurityGuardProps {
    user: User | null;
    children: React.ReactNode;
}

const SecurityGuard: React.FC<SecurityGuardProps> = ({ user, children }) => {
    const [permissions, setPermissions] = useState<{ camera: boolean; gps: boolean }>({ camera: false, gps: false });
    const [checking, setChecking] = useState(true);
    const [violation, setViolation] = useState<string | null>(null);

    useEffect(() => {
        const checkSecurity = async () => {
            setChecking(true);
            
            // 1. Check Permissions
            let camOk = false;
            let gpsOk = false;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
                camOk = true;
            } catch (e) { camOk = false; }

            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
                });
                gpsOk = true;
                
                // 2. Mock GPS Detection (Basic)
                // Several mock GPS apps set accuracy to 0 or very specific small values
                if (pos.coords.accuracy <= 0) {
                    handleViolation('Manipulasi Lokasi (Mock GPS Terdeteksi - Akurasi 0)');
                }
            } catch (e) { gpsOk = false; }

            setPermissions({ camera: camOk, gps: gpsOk });

            // 3. Time Manipulation Detection
            try {
                const serverTimeRes = await fetch('/api/time').then(r => r.json());
                const serverDate = new Date(serverTimeRes.datetime);
                const clientDate = new Date();
                const diffSeconds = Math.abs(serverDate.getTime() - clientDate.getTime()) / 1000;
                
                if (diffSeconds > 300) { // Tolerate 5 min discrepancy
                    handleViolation('Manipulasi Waktu (Waktu Perangkat Tidak Akurat)');
                }
            } catch (e) { /* server time unreachable, skip */ }

            setChecking(false);
        };

        const handleViolation = async (type: string) => {
            setViolation(type);
            if (user) {
                const deviceInfo = `${navigator.userAgent} (${navigator.platform})`;
                await apiService.logViolation({
                    userId: user.nik || user.id,
                    ppsuName: user.name || user.username,
                    deviceInfo,
                    violationType: type
                });
            }
        };

        checkSecurity();
        
        // Re-check every 5 minutes
        const interval = setInterval(checkSecurity, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    // Handle Mobile Fullscreen (Per user request)
    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile && !checking && permissions.camera && permissions.gps && !violation) {
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen().catch(() => {});
            }
        }
    }, [checking, permissions, violation]);

    if (checking) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-[9999]">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-bold animate-pulse uppercase tracking-widest">Memeriksa Keamanan Sistem...</h2>
            </div>
        );
    }

    if (violation) {
        return (
            <div className="fixed inset-0 bg-red-600 flex flex-col items-center justify-center p-10 text-center text-white z-[9999] overflow-y-auto">
                <ShieldAlert size={100} className="mb-8 animate-bounce" />
                <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">KEAMANAN TERLANGGAR</h1>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 mb-8 max-w-md">
                    <p className="text-xl font-bold mb-2">Terdeteksi: {violation}</p>
                    <p className="text-sm opacity-80 leading-relaxed font-bold uppercase tracking-widest">
                        Tindakan manipulasi sistem telah dicatat ke database pusat. Akun Anda telah dilaporkan ke Pimpinan untuk tindakan disiplin.
                    </p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-white text-red-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl"
                >
                  Coba Lagi (Gunakan Waktu/GPS Real)
                </button>
            </div>
        );
    }

    if (!permissions.camera || !permissions.gps) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-10 text-center text-white z-[9999]">
                <AlertTriangle size={80} className="text-amber-500 mb-8" />
                <h1 className="text-3xl font-black mb-4 uppercase tracking-tight leading-none">IZIN DIPERLUKAN</h1>
                <p className="text-slate-400 font-bold mb-10 max-w-sm">
                    Aplikasi SiPetut mewajibkan akses Kamera dan GPS untuk memastikan kehadiran Anda valid.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
                    <div className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-colors ${permissions.camera ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800'}`}>
                        <Camera className={permissions.camera ? 'text-emerald-400' : 'text-slate-500'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Kamera</span>
                    </div>
                    <div className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-colors ${permissions.gps ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800'}`}>
                        <MapPin className={permissions.gps ? 'text-emerald-400' : 'text-slate-500'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">GPS</span>
                    </div>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95"
                >
                  Muat Ulang & Berikan Izin
                </button>
            </div>
        );
    }

    return <>{children}</>;
};

export default SecurityGuard;
