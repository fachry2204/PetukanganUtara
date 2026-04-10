
import React, { useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  MessageCircle, 
  Calendar, 
  Pencil, 
  Trash2, 
  User as UserIcon,
  CreditCard,
  Map as MapIcon
} from 'lucide-react';
import L from 'leaflet';
import { Staff, User } from '../types';

interface ProfileModalProps {
  staff: Staff;
  onClose: () => void;
  user: User;
  onDelete: () => void;
  onEdit: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ staff, onClose, user, onDelete, onEdit }) => {
  const isAuthorized = ['Admin', 'KASI', 'Pimpinan'].includes(user.role);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Cleanup existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current).setView([staff.latitude, staff.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom Marker
    const colorClass = 'bg-orange-500';
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative w-8 h-8">
          <div class="absolute inset-0 rounded-full ${colorClass} opacity-40 animate-ping"></div>
          <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-md ${colorClass} flex items-center justify-center">
            <img src="${staff.fotoProfile}" class="w-full h-full rounded-full object-cover p-[1px]" />
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([staff.latitude, staff.longitude], { icon: customIcon }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size after modal animation to prevent gray map
    mapTimeoutRef.current = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);

    return () => {
      if (mapTimeoutRef.current) {
        clearTimeout(mapTimeoutRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [staff]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
        
        {/* Floating Close Button */}
        <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors z-[60]"
        >
             <X size={20} />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Banner moved inside scroll view */}
            <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 shrink-0 relative">
            </div>

            <div className="px-8 pb-8">
              {/* Profile Header - Overlapping Banner */}
              <div className="flex flex-col md:flex-row gap-6 items-end mb-8 -mt-16 relative z-10">
                /* FIX: Changed object-cover to object-contain and added bg-white */
                <img 
                  src={staff.fotoProfile} 
                  alt={staff.namaLengkap} 
                  className="w-32 h-32 rounded-3xl border-4 border-white object-contain shadow-lg shrink-0 bg-white" 
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-800">{staff.namaLengkap}</h3>
                  <p className="text-orange-600 font-bold">{staff.nomorAnggota}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={onEdit}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  >
                    <Pencil size={18} /> Edit
                  </button>
                  {isAuthorized && (
                    <button 
                      onClick={onDelete}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    >
                      <Trash2 size={18} /> Hapus
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <UserIcon size={14} /> Informasi Personal
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                          <CreditCard size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">NIK</p>
                          <p className="text-sm font-bold text-slate-700">{staff.nik}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                          <Calendar size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Tempat, Tanggal Lahir</p>
                          <p className="text-sm font-bold text-slate-700">{staff.tempatLahir}, {new Date(staff.tanggalLahir).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                          <UserIcon size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Jenis Kelamin</p>
                          <p className="text-sm font-bold text-slate-700">{staff.jenisKelamin}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Calendar size={14} /> Status Kepegawaian
                    </h4>
                    <div className="bg-orange-50 p-4 rounded-2xl">
                      <p className="text-xs text-orange-600 font-bold mb-1">Terdaftar Sejak</p>
                      <p className="text-lg font-bold text-orange-800">{new Date(staff.tanggalMasuk).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MapPin size={14} /> Kontak & Alamat
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                          <MapPin size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Alamat Lengkap</p>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{staff.alamatLengkap}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                          <MessageCircle size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Nomor WhatsApp</p>
                          <a href={`https://wa.me/${staff.nomorWhatsapp}`} className="text-sm font-bold text-green-600 hover:underline">+{staff.nomorWhatsapp}</a>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="flex flex-col h-full">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MapIcon size={14} /> Lokasi GPS
                    </h4>
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm z-0">
                      <div ref={mapContainerRef} className="w-full h-full z-0" style={{ zIndex: 0 }} />
                    </div>
                    <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Lat: {staff.latitude.toFixed(6)}</span>
                      <span>Lng: {staff.longitude.toFixed(6)}</span>
                    </div>
                  </section>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
