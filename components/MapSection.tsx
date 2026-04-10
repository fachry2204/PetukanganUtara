
import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, MessageCircle, ChevronDown, ChevronUp, Layers, ListTodo } from 'lucide-react';
import { DutyStatus, Staff, Report } from '../types';
import StaffTaskListModal from './StaffTaskListModal';

interface MapSectionProps {
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const MapSection: React.FC<MapSectionProps> = ({ reports, setReports, staffList, setStaffList }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isListMinimized, setIsListMinimized] = useState(false);
  
  // NEW: Legend Minimize State
  const [isLegendMinimized, setIsLegendMinimized] = useState(false);
  
  // NEW: Task Modal State
  const [viewingTasksFor, setViewingTasksFor] = useState<Staff | null>(null);
  
  // FILTER STATE
  const [mapFilter, setMapFilter] = useState<string>('ALL');

  // Base Data (Exclude Offline)
  const activeStaff = useMemo(() => staffList.filter(s => s.status !== DutyStatus.OFFLINE), [staffList]);
  
  // Counts for Legend (Always show total counts regardless of filter)
  const stats = useMemo(() => ({
    online: activeStaff.filter(s => s.status === DutyStatus.ONLINE).length,
    bertugas: activeStaff.filter(s => s.status === DutyStatus.BERTUGAS).length,
    standby: activeStaff.filter(s => s.status === DutyStatus.STANDBY).length
  }), [activeStaff]);

  // Filtered Data for Map Markers
  const displayedStaff = useMemo(() => {
    if (mapFilter === 'ALL') return activeStaff;
    return activeStaff.filter(s => s.status === mapFilter);
  }, [activeStaff, mapFilter]);

  // For Bottom List: Only Online and Bertugas (Respects filter too for consistency)
  const onlineList = displayedStaff.filter(s => s.status === DutyStatus.ONLINE || s.status === DutyStatus.BERTUGAS);

  const toggleFilter = (status: string) => {
    if (mapFilter === status) {
        setMapFilter('ALL'); // Toggle off if already selected
    } else {
        setMapFilter(status);
    }
    // Close selected card if filtered out
    setSelectedStaff(null);
  };

  // Handler for updating reports from the modal
  const handleUpdateReport = (updatedReport: Report, staffUpdates?: Staff[]) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    
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

    // Force map resize calculation
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

      if (staff.status === DutyStatus.ONLINE) {
        colorClass = 'bg-green-500';
        animationClass = 'animate-ping';
      } else if (staff.status === DutyStatus.BERTUGAS) {
        colorClass = 'bg-blue-600';
        animationClass = 'animate-ping';
      } else if (staff.status === DutyStatus.STANDBY) {
        colorClass = 'bg-yellow-500';
        animationClass = 'hidden'; 
      } else {
        return; 
      }

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative w-8 h-8 group cursor-pointer">
            <div class="absolute inset-0 rounded-full ${colorClass} opacity-60 ${animationClass}"></div>
            <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-lg ${colorClass} flex items-center justify-center transition-transform hover:scale-110">
              <img src="${staff.fotoProfile}" class="w-full h-full rounded-full object-cover p-0.5" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
               <div class="w-2 h-2 rounded-full ${colorClass}"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        tooltipAnchor: [16, -10]
      });

      const marker = L.marker([staff.latitude, staff.longitude], { icon: customIcon });

      marker.bindTooltip(
        `<div class="text-center">
           <p class="font-bold text-slate-800">${staff.namaLengkap}</p>
           <p class="text-[10px] uppercase font-bold text-slate-500">${staff.status}</p>
         </div>`, 
        {
          direction: 'top',
          offset: [0, -20],
          className: 'custom-tooltip shadow-xl border-none rounded-lg px-2 py-1'
        }
      );

      marker.on('click', () => {
        handleLocate(staff);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [displayedStaff]);

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
    <div className="flex flex-col h-full w-full">
      {/* Map Container - Flex Grow to take available space */}
      <div className="relative flex-1 bg-slate-100 overflow-hidden">
          
          {/* Map Header / Legend Overlay - CLICKABLE FILTERS & MINIMIZABLE */}
          <div className={`absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 transition-all duration-300 overflow-hidden ${isLegendMinimized ? 'w-12 h-12 p-0 flex items-center justify-center cursor-pointer hover:bg-white' : 'w-72 p-4'}`}>
            
            {/* Minimized State Icon */}
            {isLegendMinimized && (
                <div 
                    className="w-full h-full flex items-center justify-center" 
                    onClick={() => setIsLegendMinimized(false)}
                    title="Tampilkan Filter"
                >
                    <Layers className="text-orange-500" size={24} />
                </div>
            )}

            {/* Expanded State Content */}
            {!isLegendMinimized && (
                <>
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="text-orange-500" size={20} /> MAP PPSU LIVE
                        </h2>
                        <button 
                            onClick={() => setIsLegendMinimized(true)}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            title="Sembunyikan"
                        >
                            <ChevronUp size={20} />
                        </button>
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-3">Klik status untuk filter petugas.</p>
                    
                    <div className="space-y-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        
                        {/* Online Filter Button */}
                        <button 
                            onClick={() => toggleFilter(DutyStatus.ONLINE)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                                mapFilter === DutyStatus.ONLINE 
                                ? 'bg-white shadow-md ring-2 ring-green-100 border-green-200' 
                                : 'hover:bg-slate-200/50'
                            }`}
                        >
                            <div className="relative w-3 h-3 shrink-0">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                                <div className="relative w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">Online</span>
                            <span className={`ml-auto text-xs font-mono px-1.5 rounded transition-colors ${mapFilter === DutyStatus.ONLINE ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
                                {stats.online}
                            </span>
                        </button>

                        {/* Bertugas Filter Button */}
                        <button 
                            onClick={() => toggleFilter(DutyStatus.BERTUGAS)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                                mapFilter === DutyStatus.BERTUGAS 
                                ? 'bg-white shadow-md ring-2 ring-blue-100 border-blue-200' 
                                : 'hover:bg-slate-200/50'
                            }`}
                        >
                            <div className="relative w-3 h-3 shrink-0">
                                <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
                                <div className="relative w-3 h-3 bg-blue-600 rounded-full border border-white"></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">Bertugas</span>
                            <span className={`ml-auto text-xs font-mono px-1.5 rounded transition-colors ${mapFilter === DutyStatus.BERTUGAS ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                {stats.bertugas}
                            </span>
                        </button>

                        {/* Standby Filter Button */}
                        <button 
                            onClick={() => toggleFilter(DutyStatus.STANDBY)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                                mapFilter === DutyStatus.STANDBY 
                                ? 'bg-white shadow-md ring-2 ring-yellow-100 border-yellow-200' 
                                : 'hover:bg-slate-200/50'
                            }`}
                        >
                            <div className="relative w-3 h-3 shrink-0 bg-yellow-500 rounded-full border border-white"></div>
                            <span className="text-xs font-bold text-slate-700">Standby</span>
                            <span className={`ml-auto text-xs font-mono px-1.5 rounded transition-colors ${mapFilter === DutyStatus.STANDBY ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700'}`}>
                                {stats.standby}
                            </span>
                        </button>

                    </div>
                    
                    {/* Show "Show All" text if filtered */}
                    {mapFilter !== 'ALL' && (
                        <div className="mt-2 text-center">
                            <button 
                                onClick={() => setMapFilter('ALL')}
                                className="text-[10px] text-slate-400 hover:text-orange-500 font-bold underline decoration-dotted"
                            >
                                Tampilkan Semua Personil
                            </button>
                        </div>
                    )}
                </>
            )}
          </div>

          <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Selected Staff Card Overlay */}
            {selectedStaff && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 w-[90%] md:w-80 z-[1000] bg-white rounded-3xl shadow-2xl p-4 border border-slate-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedStaff.status}
                </div>
                <div className="flex flex-col items-center text-center mt-2">
                    <div className={`p-1 rounded-full border-2 ${
                        selectedStaff.status === DutyStatus.ONLINE ? 'border-green-500' : 
                        selectedStaff.status === DutyStatus.BERTUGAS ? 'border-blue-600' : 'border-yellow-500'
                    }`}>
                    <img src={selectedStaff.fotoProfile} alt="" className="w-16 h-16 rounded-full object-cover" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mt-2">{selectedStaff.namaLengkap}</h3>
                    <p className="text-xs font-bold text-slate-400">{selectedStaff.nomorAnggota}</p>
                    
                    <div className="w-full bg-slate-50 rounded-xl p-3 my-3 text-left space-y-2">
                        <div className="flex items-start gap-2 text-xs text-slate-600">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-orange-500" />
                            <span className="leading-tight">{selectedStaff.alamatLengkap}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-[10px] font-mono text-slate-400">Lat: {selectedStaff.latitude.toFixed(4)}</span>
                            <span className="text-[10px] font-mono text-slate-400">Lng: {selectedStaff.longitude.toFixed(4)}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full mb-2">
                        <a 
                            href={`https://wa.me/${selectedStaff.nomorWhatsapp}`}
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                        >
                            <MessageCircle size={16} /> WhatsApp
                        </a>
                        <a 
                            href={`https://www.google.com/maps?q=${selectedStaff.latitude},${selectedStaff.longitude}`}
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                        >
                            <Navigation size={16} /> Navigasi
                        </a>
                    </div>

                    {/* NEW: Button Daftar Tugas */}
                    <button 
                        onClick={() => setViewingTasksFor(selectedStaff)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2.5 rounded-xl text-xs font-bold transition-colors border border-indigo-100 mb-2"
                    >
                        <ListTodo size={16} /> Daftar Tugas
                    </button>
                    
                    <button 
                        onClick={() => setSelectedStaff(null)}
                        className="mt-1 text-xs text-slate-400 hover:text-slate-600 font-medium"
                    >
                        Tutup Kartu
                    </button>
                </div>
                </div>
            )}
      </div>

      {/* Bottom List Section - Resizable */}
      <div className={`bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isListMinimized ? 'h-14' : 'h-80'}`}>
          <div 
            className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setIsListMinimized(!isListMinimized)}
          >
             <div className="flex items-center gap-4">
                <button className="text-slate-400">
                    {isListMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Daftar PPSU {mapFilter !== 'ALL' ? `(${mapFilter})` : 'Aktif'}</h3>
                    {!isListMinimized && <p className="text-xs text-slate-500">Klik anggota untuk melacak lokasi terkini.</p>}
                </div>
             </div>
             <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                {onlineList.length} Personil Ditampilkan
             </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {onlineList.map(staff => (
                    <div 
                        key={staff.id}
                        onClick={() => handleLocate(staff)}
                        className={`
                            group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm
                            ${selectedStaff?.id === staff.id 
                                ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' 
                                : 'bg-white border-slate-100 hover:border-orange-200'
                            }
                        `}
                    >
                         {/* Status Icon Only */}
                        <div className={`w-3 h-3 shrink-0 rounded-full ${
                            staff.status === DutyStatus.ONLINE ? 'bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]' : 
                            staff.status === DutyStatus.BERTUGAS ? 'bg-blue-600 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]' :
                            'bg-yellow-500'
                        }`}></div>
                        
                        {/* Name Only */}
                        <span className="text-xs font-bold text-slate-700 truncate">{staff.namaLengkap}</span>
                    </div>
                ))}
             </div>
          </div>
      </div>

      {/* NEW: Task List Modal */}
      {viewingTasksFor && (
        <StaffTaskListModal
          staff={viewingTasksFor}
          reports={reports}
          onClose={() => setViewingTasksFor(null)}
          onUpdateReport={handleUpdateReport}
        />
      )}
    </div>
  );
};

export default MapSection;
