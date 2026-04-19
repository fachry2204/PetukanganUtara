import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ShieldCheck, Share, PlusSquare } from 'lucide-react';

interface InstallPromptModalProps {
    logo: string | null;
}

const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ logo }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect if already in standalone mode (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        if (isStandalone) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            const dismissed = sessionStorage.getItem('install_prompt_dismissed');
            if (!dismissed) {
                setShowModal(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, we can't detect beforeinstallprompt, so we show it after a delay
        if (ios && !isStandalone) {
            const dismissed = sessionStorage.getItem('install_prompt_dismissed');
            if (!dismissed) {
                const timer = setTimeout(() => setShowModal(true), 3000);
                return () => clearTimeout(timer);
            }
        }

        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setShowModal(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setShowModal(false);
    };

    const handleDismiss = () => {
        sessionStorage.setItem('install_prompt_dismissed', 'true');
        setShowModal(false);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 border border-slate-100">
                <div className="bg-orange-500 p-8 text-white relative flex flex-col items-center text-center">
                    <button 
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg p-2">
                        {logo ? (
                            <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
                        ) : (
                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">P</div>
                        )}
                    </div>
                    
                    <h3 className="text-2xl font-black uppercase tracking-tight">Pasang SiPetut</h3>
                    <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mt-1">Akses Lebih Cepat & Stabil</p>
                </div>

                <div className="p-8 space-y-6">
                    {isIOS ? (
                        <div className="space-y-6">
                            <p className="text-sm font-bold text-slate-600 leading-relaxed text-center">
                                Khusus iPhone, pasang aplikasi secara manual:
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                                        <Share size={20} />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">1. Klik tombol 'Share' di bawah</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-orange-600">
                                        <PlusSquare size={20} />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">2. Pilih 'Add to Home Screen'</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-sm">Aplikasi di Layar Utama</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Buka aplikasi langsung dari Home Screen</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-sm">Resmi & Aman</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Aplikasi resmi Kelurahan Petukangan Utara</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isIOS ? (
                        <button 
                            onClick={handleInstallClick}
                            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-200 flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            Pasang Sekarang <Download size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleDismiss}
                            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95"
                        >
                            Saya Mengerti
                        </button>
                    )}

                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-tighter">
                        SiPetut Mendukung Akses Latar Belakang & Notifikasi
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InstallPromptModal;
