import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, MessageCircle, ChevronDown, ChevronUp, Layers, ListTodo, Map } from 'lucide-react';
import { DutyStatus, Staff, TugasPPSU } from '../types';
import StaffTaskListModal from './StaffTaskListModal';

interface MapSectionProps {
  tugasList: TugasPPSU[];
  setTugasList: React.Dispatch<React.SetStateAction<TugasPPSU[]>>;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  sosAlerts: any[];
  attendanceRecords: any[];
}

const MapSection: React.FC<MapSectionProps> = ({ tugasList, setTugasList, staffList, setStaffList, sosAlerts, attendanceRecords }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isListMinimized, setIsListMinimized] = useState(true);
  const [mapType, setMapType] = useState<'OSM' | 'GOOGLE' | 'SATELLITE'>('GOOGLE');
  
  // Legend Minimize State
  const [isLegendMinimized, setIsLegendMinimized] = useState(true);
  
  // Task Modal State
  const [viewingTasksFor, setViewingTasksFor] = useState<Staff | null>(null);
  
  // FILTER STATE - Default to ALL
  const [mapFilter, setMapFilter] = useState<string>('ALL');

  // Base Data Processing - Mark those in SOS as "Dalam Bahaya"
  // FILTER: Only show staff who have clocked in today and NOT clocked out
  const activeStaff = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get unique NIKs of staff who have 'Absen Masuk' today
    const clockedInNiks = new Set(
        attendanceRecords
            .filter(r => r.type === 'Absen Masuk' && r.timestamp.startsWith(today))
            .map(r => r.userNik)
    );

    // Get unique NIKs of staff who have 'Absen Pulang' today
    const clockedOutNiks = new Set(
        attendanceRecords
            .filter(r => r.type === 'Absen Pulang' && r.timestamp.startsWith(today))
            .map(r => r.userNik)
    );

    return staffList
        .filter(s => (clockedInNiks.has(s.nik) && !clockedOutNiks.has(s.nik)) || sosAlerts.some(alert => alert.nik === s.nik))
        .map(s => {
            // Get today's records for this staff
            const staffRecords = attendanceRecords
                .filter(r => r.userNik === s.nik && r.timestamp.startsWith(today))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            const latest = staffRecords[0];
            
            // PRIORITY 1: Dalam Bahaya (SOS)
            const alert = sosAlerts.find(a => a.nik === s.nik);
            if (alert) {
                return { ...s, status: DutyStatus.BAHAYA, latitude: alert.latitude, longitude: alert.longitude };
            }

            // PRIORITY 2: Istirahat
            if (latest && latest.type === 'Istirahat') {
                return { ...s, status: DutyStatus.ISTIRAHAT, latitude: latest.latitude, longitude: latest.longitude };
            }

            // PRIORITY 3: Online/Bertugas (Keep current status but update location if available)
            if (latest) {
                return { ...s, latitude: latest.latitude, longitude: latest.longitude };
            }
            
            return s;
        });
  }, [staffList, sosAlerts, attendanceRecords]);

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
        setIsListMinimized(false); // Automatically expand list when filter clicked
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

  // Update Tile Layers (Switch between OSM and Google)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
        tileLayerRef.current.remove();
    }

    let url = '';
    let attribution = '';
    let subdomains: string[] = ['a', 'b', 'c'];

    if (mapType === 'OSM') {
        url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    } else if (mapType === 'GOOGLE') {
        url = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        attribution = '&copy; Google Maps';
        subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
    } else if (mapType === 'SATELLITE') {
        url = 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';
        attribution = '&copy; Google Maps Satellite';
        subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
    }

    tileLayerRef.current = L.tileLayer(url, {
        attribution,
        subdomains,
        maxZoom: 20
    }).addTo(mapInstanceRef.current);

  }, [mapType]);

  // Render Markers based on displayedStaff
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    displayedStaff.forEach(staff => {
      let colorClass = '';
      let animationClass = '';

      if (staff.status === DutyStatus.BAHAYA) {
        colorClass = 'bg-rose-600';
        animationClass = 'animate-danger-pulse';
      } else if (staff.status === DutyStatus.BERTUGAS) {
        colorClass = 'bg-blue-600';
        animationClass = 'animate-ping opacity-60';
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
          <div class="relative w-10 h-10 group cursor-pointer ${staff.status === DutyStatus.BAHAYA ? 'z-[100]' : 'z-10'}">
            ${staff.status !== DutyStatus.BAHAYA ? `<div class="absolute inset-0 rounded-full ${colorClass} ${animationClass}"></div>` : ''}
            <div class="relative w-10 h-10 rounded-full border-2 border-white shadow-xl ${colorClass} flex items-center justify-center transition-transform hover:scale-110 ${staff.status === DutyStatus.BAHAYA ? 'animate-danger-pulse' : ''}">
              <img src="${staff.fotoProfile}" class="w-full h-full rounded-full object-cover p-0.5" />
              ${staff.status === DutyStatus.BAHAYA ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md"><div class="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse"></div></div>' : ''}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
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
                       <h3 className="text-[12px] font-medium text-slate-800 uppercase tracking-tight">MAP PPSU LIVE</h3>
                       <p className="text-[9px] text-slate-500 font-normal">Kecamatan Pesanggrahan</p>
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
                           <span className="text-[11px] font-medium text-slate-700">Online</span>
                       </div>
                       <span className="bg-white px-2 py-0.5 rounded-lg text-[9px] font-medium text-emerald-600 shadow-sm border border-emerald-50">{stats.online}</span>
                    </button>

                    <button 
                       onClick={() => toggleFilter(DutyStatus.BERTUGAS)}
                       className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${mapFilter === DutyStatus.BERTUGAS ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60'}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          <span className="text-[11px] font-medium text-slate-700">Bertugas</span>
                       </div>
                       <span className="bg-white px-2 py-0.5 rounded-lg text-[9px] font-medium text-blue-600 shadow-sm border border-blue-50">{stats.bertugas}</span>
                    </button>

                    <button 
                       onClick={() => toggleFilter(DutyStatus.ISTIRAHAT)}
                       className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${mapFilter === DutyStatus.ISTIRAHAT ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60'}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-[11px] font-medium text-slate-700">Istirahat</span>
                       </div>
                       <span className="bg-white px-2 py-0.5 rounded-lg text-[9px] font-medium text-amber-600 shadow-sm border border-amber-50">{stats.istirahat}</span>
                    </button>

                    <button 
                       onClick={() => toggleFilter(DutyStatus.BAHAYA)}
                       className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${mapFilter === DutyStatus.BAHAYA || stats.bahaya > 0 ? 'bg-rose-50 border-rose-200 shadow-sm ring-2 ring-rose-500/20' : 'bg-slate-50 border-transparent hover:border-slate-200 opacity-60'}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></div>
                          <span className="text-[11px] font-medium text-slate-700">Dalam Bahaya</span>
                       </div>
                       <span className="bg-rose-600 px-2 py-0.5 rounded-lg text-[9px] font-medium text-white shadow-lg">{stats.bahaya}</span>
                    </button>

                    <button 
                       onClick={() => {
                          setMapFilter('ALL');
                          setIsListMinimized(false);
                       }}
                       className="w-full text-center py-2 text-[9px] font-medium text-indigo-500 uppercase tracking-widest hover:underline mt-2"
                    >
                       Tampilkan Semua Personil
                    </button>
                 </div>
              )}
           </div>
        </div>

        {/* Layer Switcher - Floating UI */}
        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
           <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/20 flex flex-col gap-1">
              <button 
                onClick={() => setMapType('OSM')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapType === 'OSM' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                title="OpenStreetMap"
              >
                 <Map size={20} />
              </button>
              <button 
                onClick={() => setMapType('GOOGLE')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapType === 'GOOGLE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Google Roadmap"
              >
                 <Navigation size={20} />
              </button>
              <button 
                onClick={() => setMapType('SATELLITE')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mapType === 'SATELLITE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Google Satellite"
              >
                 <Layers size={20} />
              </button>
           </div>
        </div>

        {/* Selected Staff Card Overlay */}
        {selectedStaff && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 w-[90%] md:w-80 z-[1000] bg-white rounded-3xl shadow-2xl p-4 border border-slate-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[9px] font-medium px-3 py-1 rounded-full uppercase tracking-widest shadow-lg ${
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
                <h3 className="font-medium text-slate-800 text-sm mt-2 uppercase tracking-tight">{selectedStaff.namaLengkap}</h3>
                <p className="text-[9px] font-normal text-slate-400 font-mono">{selectedStaff.nomorAnggota}</p>
                
                <div className="w-full bg-slate-50 rounded-xl p-3 my-3 text-left space-y-2">
                    <div className="flex items-start gap-2 text-[10px] text-slate-600 font-medium">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-orange-500" />
                        <span className="leading-tight">{selectedStaff.alamatLengkap}</span>
                    </div>
                </div>

                <div className="flex gap-2 w-full mb-2">
                    <a 
                        href={`https://wa.me/${selectedStaff.nomorWhatsapp}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-[10px] font-medium transition-all shadow-sm"
                    >
                        <MessageCircle size={16} /> WA
                    </a>
                    <a 
                        href={`https://www.google.com/maps?q=${selectedStaff.latitude},${selectedStaff.longitude}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-[10px] font-medium transition-all shadow-sm"
                    >
                        <Navigation size={16} /> PETA
                    </a>
                </div>

                <button 
                    onClick={() => setViewingTasksFor(selectedStaff)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-[10px] font-medium transition-all border border-slate-200 mb-2"
                >
                    <ListTodo size={16} /> DAFTAR TUGAS
                </button>
                
                <button 
                    onClick={() => setSelectedStaff(null)}
                    className="mt-1 text-[9px] text-slate-400 hover:text-slate-600 font-medium uppercase tracking-widest"
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
                   <h3 className="text-[12px] font-medium text-slate-800 uppercase tracking-tight">Daftar PPSU {mapFilter !== 'ALL' ? `(${mapFilter})` : 'Tampil'}</h3>
                   {!isListMinimized && <p className="text-[9px] text-slate-500 font-normal">Pilih anggota untuk melacak lokasi terkini.</p>}
                </div>
             </div>
             <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
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
                        
                        <span className="text-[10px] font-medium text-slate-700 truncate uppercase tracking-tight">{staff.namaLengkap}</span>
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
