import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ShieldCheck } from 'lucide-react';

interface InstallPromptModalProps {
    logo: string | null;
}

const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ logo }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Only run on mobile/desktop browsers that support it
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            
            // Check if user has already dismissed it this session
            const dismissed = sessionStorage.getItem('install_prompt_dismissed');
            if (!dismissed) {
                setShowModal(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if app is already installed
        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setShowModal(false);
            console.log('SiPetut was installed');
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
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

                    <button 
                        onClick={handleInstallClick}
                        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-200 flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        Install Sekarang <Download size={20} />
                    </button>

                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-tighter">
                        Tanpa Menguras Memori • Mendukung Notifikasi Real-time
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InstallPromptModal;
