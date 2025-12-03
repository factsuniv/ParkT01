import React, { useEffect, useRef } from 'react';
import { Spot } from '../types';

interface MapProps {
  center: { lat: number; lng: number };
  spots: Spot[];
  selectedSpotId?: string;
  onSpotClick: (spot: Spot) => void;
  onMapClick: () => void;
  isInteracting: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

const Map: React.FC<MapProps> = ({ center, spots, selectedSpotId, onSpotClick, onMapClick, isInteracting }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current && window.L) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [center.lat, center.lng],
        zoom: 16
      });

      // CartoDB Voyager
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      // Handle map clicks to deselect spots
      map.on('click', (e: any) => {
        // We use a small timeout to prevent conflict if clicking directly on a marker
        // But since marker clicks handle stopPropagation usually, this catches background clicks
        onMapClick();
      });

      mapInstanceRef.current = map;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Center
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([center.lat, center.lng], 16, {
        duration: 1.5
      });
    }
  }, [center]);

  // Update Spots Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.keys(markersRef.current).forEach(id => {
      if (!spots.find(s => s.id === id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    spots.forEach(spot => {
      const isSelected = selectedSpotId === spot.id;
      
      const iconHtml = `
        <div class="relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'z-10'}">
          <div class="w-8 h-8 rounded-full bg-brand-500 shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            <span class="text-white font-bold text-xs">P</span>
          </div>
          ${isSelected ? '<div class="absolute -bottom-2 w-2 h-2 bg-brand-500 rotate-45"></div>' : ''}
           <div class="absolute -top-8 bg-white px-2 py-1 rounded shadow-md text-xs font-bold text-gray-800 ${isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity whitespace-nowrap pointer-events-none">
            $${spot.price}
          </div>
        </div>
      `;

      const customIcon = window.L.divIcon({
        className: 'custom-map-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      if (markersRef.current[spot.id]) {
        markersRef.current[spot.id].setIcon(customIcon);
        markersRef.current[spot.id].setZIndexOffset(isSelected ? 1000 : 0);
      } else {
        const marker = window.L.marker([spot.location.lat, spot.location.lng], { icon: customIcon })
          .addTo(map)
          .on('click', (e: any) => {
            window.L.DomEvent.stopPropagation(e); // Prevent map click
            onSpotClick(spot);
          });
        
        markersRef.current[spot.id] = marker;
      }
    });

    // Add User Location Marker
    if (!userMarkerRef.current) {
       const userIconHtml = `
        <div class="relative w-6 h-6">
          <div class="absolute inset-0 bg-blue-500 opacity-20 rounded-full animate-ping"></div>
          <div class="relative w-6 h-6 bg-white rounded-full border-4 border-blue-500 shadow-sm"></div>
        </div>
      `;
      const userIcon = window.L.divIcon({
        className: 'user-marker',
        html: userIconHtml,
        iconSize: [24, 24]
      });
      
      userMarkerRef.current = window.L.marker([center.lat - 0.002, center.lng - 0.002], { icon: userIcon }).addTo(map);
    }

  }, [spots, selectedSpotId, onSpotClick, center]);

  return <div ref={mapContainerRef} className="w-full h-full bg-gray-100" />;
};

export default Map;