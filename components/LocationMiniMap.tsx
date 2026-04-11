import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X, MapPin } from 'lucide-react';

interface LocationMiniMapProps {
  lat: number;
  lng: number;
}

const LocationMiniMap: React.FC<LocationMiniMapProps> = ({ lat, lng }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapInstanceRef = useRef<L.Map | null>(null);

  // Initialize Mini Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Clean up previous instance if strict mode double invocation
    if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false, // REMOVE ATTRIBUTION COMPLETELY
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      keyboard: false
    }).setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '' // NO DONATION TEXT
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="background-color: #f97316; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker([lat, lng], { icon: markerIcon }).addTo(map);
    mapInstanceRef.current = map;

    // Force recalculation of container size after flexbox paints it
    setTimeout(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            mapInstanceRef.current.setView([lat, lng], 16);
        }
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  // Initialize Modal Map when modal opens
  useEffect(() => {
    if (isModalOpen && modalMapContainerRef.current) {
        if (modalMapInstanceRef.current) {
            modalMapInstanceRef.current.remove();
        }

        const map = L.map(modalMapContainerRef.current, {
            attributionControl: false // Still NO ATTRIBUTION in large map
        }).setView([lat, lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: ''
        }).addTo(map);

        const markerIcon = L.divIcon({
            className: 'custom-pin',
            html: `<div style="background-color: #f97316; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-center;"><div style="background: white; width:6px; height:6px; border-radius:50%; margin:auto;"></div></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        modalMapInstanceRef.current = map;

        // Force resize recalculation
        setTimeout(() => {
            if (modalMapInstanceRef.current) {
                modalMapInstanceRef.current.invalidateSize();
                modalMapInstanceRef.current.setView([lat, lng], 16);
            }
        }, 250);
    }

    return () => {
        if (modalMapInstanceRef.current) {
            modalMapInstanceRef.current.remove();
            modalMapInstanceRef.current = null;
        }
    }
  }, [isModalOpen, lat, lng]);

  return (
    <>
      <div 
        className="w-full h-32 md:h-48 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative shrink-0 cursor-pointer group transition-transform hover:scale-[1.02]"
        onClick={() => setIsModalOpen(true)}
      >
         <div ref={mapContainerRef} className="w-full h-full pointer-events-none" />
         
         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors pointer-events-none"></div>
         <div className="absolute bottom-0 w-full bg-black/70 backdrop-blur-sm text-[8px] md:text-[10px] text-white py-0.5 text-center font-black tracking-widest uppercase pointer-events-none border-t border-white/10">
            LIHAT MAP
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 z-10 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800">Detail Lokasi GPS</h3>
                            <p className="text-xs font-bold text-slate-500 font-mono">LAT: {lat.toFixed(6)} | LNG: {lng.toFixed(6)}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 relative bg-slate-100 w-full h-full">
                    <div ref={modalMapContainerRef} className="w-full h-full absolute inset-0" />
                </div>
           </div>
        </div>
      )}
    </>
  );
};

export default LocationMiniMap;
