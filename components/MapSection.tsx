import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, MessageCircle, ChevronDown, ChevronUp, Layers, ListTodo } from 'lucide-react';
import { DutyStatus, Staff, TugasPPSU } from '../types';
import StaffTaskListModal from './StaffTaskListModal';

interface MapSectionProps {
  tugasList: TugasPPSU[];
  setTugasList: React.Dispatch<React.SetStateAction<TugasPPSU[]>>;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  sosAlerts: any[];
}

const MapSection: React.FC<MapSectionProps> = ({ tugasList, setTugasList, staffList, setStaffList, sosAlerts }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isListMinimized, setIsListMinimized] = useState(false);
  
  // Legend Minimize State
  const [isLegendMinimized, setIsLegendMinimized] = useState(false);
  
  // Task Modal State
  const [viewingTasksFor, setViewingTasksFor] = useState<Staff | null>(null);
  
  // FILTER STATE - Default to ALL
  const [mapFilter, setMapFilter] = useState<string>('ALL');

  // Base Data Processing - Mark those in SOS as "Dalam Bahaya"
  const staffWithStatus = useMemo(() => {
    return staffList.map(s => {
       const isBahaya = sosAlerts.some(alert => alert.nik === s.nik);
       if (isBahaya) return { ...s, status: DutyStatus.BAHAYA };
       return s;
    });
  }, [staffList, sosAlerts]);

  // Base Data (Exclude Offline)
  const activeStaff = useMemo(() => staffWithStatus.filter(s => s.status !== DutyStatus.OFFLINE), [staffWithStatus]);
  
  // Counts for Legend
  const stats = useMemo(() => ({
    online: activeStaff.length,
    bertugas: activeStaff.filter(s => s.status === DutyStatus.BERTUGAS).length,
    istirahat: activeStaff.filter(s => s.status === DutyStatus.ISTIRAHAT).length,
    bahaya: activeStaff.filter(s => s.status === DutyStatus.BAHAYA).length
  }), [activeStaff]);

  // Filtered Data for Map Markers
  const displayedStaff = useMemo(() => {
    if (mapFilter === 'ALL') return activeStaff;
    if (mapFilter === 'ONLINE') return activeStaff; 
    return activeStaff.filter(s => s.status === mapFilter);
  }, [activeStaff, mapFilter]);

  // For Bottom List
  const onlineList = displayedStaff;

  const toggleFilter = (status: string) => {
    if (mapFilter === status) {
        setMapFilter('ALL'); 
    } else {
        setMapFilter(status);
    }
    setSelectedStaff(null);
  };

  // Handler for updating tugas from the modal
  const handleUpdateTugas = (updatedTugas: TugasPPSU, staffUpdates?: Staff[]) => {
    setTugasList(prev => prev.map(t => t.id === updatedTugas.id ? updatedTugas : t));
    
    if (staffUpdates && staffUpdates.length > 0) {
        setStaffList(prevStaff => {
            return prevStaff.map(s => {
                const update = staffUpdates.find(u => u.id === s.id);
                return update ? update : s;
            });
        });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false 
    }).setView([-6.2367, 106.7583], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
        }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Markers based on displayedStaff
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    displayedStaff.forEach(staff => {
      let colorClass = '';
      let animationClass = '';

      if (staff.status === DutyStatus.BAHAYA) {
        colorClass = 'bg-rose-600';
        animationClass = 'animate-pulse scale-125';
      } else if (staff.status === DutyStatus.BERTUGAS) {
        colorClass = 'bg-blue-600';
        animationClass = 'animate-ping';
      } else if (staff.status === DutyStatus.ISTIRAHAT) {
        colorClass = 'bg-amber-500';
        animationClass = 'hidden'; 
      } else {
        colorClass = 'bg-emerald-500';
        animationClass = 'animate-ping';
      }

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative w-8 h-8 group cursor-pointer ${staff.status === DutyStatus.BAHAYA ? 'z-[100]' : 'z-10'}">
            <div class="absolute inset-0 rounded-full ${colorClass} opacity-60 ${animationClass}"></div>
            <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-lg ${colorClass} flex items-center justify-center transition-transform hover:scale-110">
              <img src="${staff.fotoProfile}" class="w-full h-full rounded-full object-cover p-0.5" />
            </div>
            ${staff.status === DutyStatus.BAHAYA ? '<div class="absolute -top-1 -left-1 w-3 h-3 bg-rose-600 rounded-full animate-ping"></div>' : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([staff.latitude, staff.longitude], { icon: customIcon });
      
      marker.on('click', () => {
        handleLocate(staff);
      });

      marker.addTo(markersLayerRef.current!);
    });

    if (selectedStaff) {
       mapInstanceRef.current.panTo([selectedStaff.latitude, selectedStaff.longitude]);
    }

  }, [displayedStaff, selectedStaff]);

  const handleLocate = (staff: Staff) => {
    setSelectedStaff(staff);
    if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([staff.latitude, staff.longitude], 18, {
            animate: true,
            duration: 1.5
        });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden rounded-[2.5rem] shadow-sm border border-slate-100">
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {/* LEAFLET OVERLAYS - TOP LEFT LEGEND/FILTER */}
        <div className="absolute top-6 left-6 z-[1000] w-72">
           <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl border border-white/20 animate-in slide-in-from-left-8 duration-500">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                       <Navigation size={20} className="animate-pulse" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">MAP PPSU LIVE</h3>
                       <p className="text-[10px] text-slate-500 font-bold">Kecamatan Pesanggrahan</p>
                    </div>
                 </div>
                 <button onClick={() => setIsLegendMinimized(!isLegendMinimized)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                    {isLegendMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                 </button>
              </div>

              {!isLegendMinimized && (
                 <div className="space-y-2">
                    <button 
                       onClick={() => toggleFilter('ONLINE')}
                       className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${mapFilter === 'ONLINE' || mapFilter === 'ALL' ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60'}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-xs font-black text-slate-700">Online</span>
                       </div>
                       <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-black text-emerald-600 shadow-sm border border-emerald-50">{stats.online}</span>
                    </button>

                    <button 
                       onClick={() => toggleFilter(DutyStatus.BERTUGAS)}
                       className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${mapFilter === DutyStatus.BERTUGAS ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60'}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          <span className="text-xs font-black text-slate-700">Bertugas</span>
                       </div>
                       <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-black text-blue-600 shadow-sm border border-blue-50">{stats.bertugas}</span>
                    </button>

                    <button 
                       onClick={() => toggleFilter(DutyStatus.ISTIRAHAT)}
                       className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${mapFilter === DutyStatus.ISTIRAHAT ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60'}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-xs font-black text-slate-700">Istirahat</span>
                       </div>
                       <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-black text-amber-600 shadow-sm border border-amber-50">{stats.istirahat}</span>
                    </button>

                    <button 
                       onClick={() => toggleFilter(DutyStatus.BAHAYA)}
                       className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${mapFilter === DutyStatus.BAHAYA || stats.bahaya > 0 ? 'bg-rose-50 border-rose-200 shadow-sm ring-2 ring-rose-500/20' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60'}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></div>
                          <span className="text-xs font-black text-slate-700">Dalam Bahaya</span>
                       </div>
                       <span className="bg-rose-600 px-2 py-0.5 rounded-lg text-[10px] font-black text-white shadow-lg">{stats.bahaya}</span>
                    </button>

                    <button 
                       onClick={() => setMapFilter('ALL')}
                       className="w-full text-center py-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline mt-2"
                    >
                       Tampilkan Semua Personil
                    </button>
                 </div>
              )}
           </div>
        </div>

        {/* Selected Staff Card Overlay */}
        {selectedStaff && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 w-[90%] md:w-80 z-[1000] bg-white rounded-3xl shadow-2xl p-4 border border-slate-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg ${
                selectedStaff.status === DutyStatus.BAHAYA ? 'bg-rose-600' : 
                selectedStaff.status === DutyStatus.BERTUGAS ? 'bg-blue-600' : 'bg-emerald-500'
            }`}>
               {selectedStaff.status}
            </div>
            <div className="flex flex-col items-center text-center mt-2">
                <div className={`p-1 rounded-full border-2 ${
                    selectedStaff.status === DutyStatus.BAHAYA ? 'border-rose-600' : 
                    selectedStaff.status === DutyStatus.BERTUGAS ? 'border-blue-600' : 'border-emerald-500'
                }`}>
                <img src={selectedStaff.fotoProfile} alt="" className="w-16 h-16 rounded-full object-cover" />
                </div>
                <h3 className="font-black text-slate-800 text-lg mt-2 uppercase tracking-tight">{selectedStaff.namaLengkap}</h3>
                <p className="text-xs font-bold text-slate-400 font-mono">{selectedStaff.nomorAnggota}</p>
                
                <div className="w-full bg-slate-50 rounded-xl p-3 my-3 text-left space-y-2">
                    <div className="flex items-start gap-2 text-[11px] text-slate-600 font-bold">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-orange-500" />
                        <span className="leading-tight">{selectedStaff.alamatLengkap}</span>
                    </div>
                </div>

                <div className="flex gap-2 w-full mb-2">
                    <a 
                        href={`https://wa.me/${selectedStaff.nomorWhatsapp}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-sm"
                    >
                        <MessageCircle size={16} /> WA
                    </a>
                    <a 
                        href={`https://www.google.com/maps?q=${selectedStaff.latitude},${selectedStaff.longitude}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-sm"
                    >
                        <Navigation size={16} /> PETA
                    </a>
                </div>

                <button 
                    onClick={() => setViewingTasksFor(selectedStaff)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-black transition-all border border-slate-200 mb-2"
                >
                    <ListTodo size={16} /> DAFTAR TUGAS
                </button>
                
                <button 
                    onClick={() => setSelectedStaff(null)}
                    className="mt-1 text-[10px] text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest"
                >
                    Tutup
                </button>
            </div>
            </div>
        )}
      </div>

      {/* Bottom List Section - Resizable */}
      <div className={`bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isListMinimized ? 'h-14' : 'h-80'} z-[1001]`}>
          <div 
            className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setIsListMinimized(!isListMinimized)}
          >
             <div className="flex items-center gap-4">
                <button className="text-slate-400">
                    {isListMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <div>
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Daftar PPSU {mapFilter !== 'ALL' ? `(${mapFilter})` : 'Tampil'}</h3>
                   {!isListMinimized && <p className="text-[10px] text-slate-500 font-bold">Pilih anggota untuk melacak lokasi terkini.</p>}
                </div>
             </div>
             <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
                {onlineList.length} Personil
             </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {onlineList.map(staff => (
                    <div 
                        key={staff.id}
                        onClick={() => handleLocate(staff)}
                        className={`
                            group flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all hover:shadow-md
                            ${selectedStaff?.id === staff.id 
                                ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20 shadow-lg' 
                                : 'bg-white border-slate-100 hover:border-indigo-200'
                            }
                        `}
                    >
                         <div className={`w-3 h-3 shrink-0 rounded-full shadow-inner ${
                            staff.status === DutyStatus.BAHAYA ? 'bg-rose-600 animate-pulse' :
                            staff.status === DutyStatus.BERTUGAS ? 'bg-blue-600' :
                            staff.status === DutyStatus.ISTIRAHAT ? 'bg-amber-500' :
                            'bg-emerald-500'
                         }`}></div>
                        
                        <span className="text-[11px] font-black text-slate-700 truncate uppercase tracking-tight">{staff.namaLengkap}</span>
                    </div>
                ))}
             </div>
          </div>
      </div>

      {/* Task List Modal */}
      {viewingTasksFor && (
        <StaffTaskListModal
          staff={viewingTasksFor}
          tugasList={tugasList}
          onClose={() => setViewingTasksFor(null)}
          onUpdateTugas={handleUpdateTugas}
        />
      )}
    </div>
  );
};

export default MapSection;
