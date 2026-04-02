import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface UseMapInitializationProps {
  initialLat: number;
  initialLng: number;
  onMapClick: (lat: number, lng: number) => void;
  onHintHide: () => void;
  onMapReady: (map: L.Map) => void;
  onGeolocationRequest: () => void;
  hasAttemptedGeolocation: boolean;
}

export const useMapInitialization = ({
  initialLat,
  initialLng,
  onMapClick,
  onHintHide,
  onMapReady,
  onGeolocationRequest,
  hasAttemptedGeolocation,
}: UseMapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current).setView([initialLat, initialLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
      onHintHide();
    });

    mapRef.current = map;
    onMapReady(map);
  }, []);

  return { mapContainer, mapRef };
};
