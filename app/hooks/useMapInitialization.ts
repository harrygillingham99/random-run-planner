import { useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useGeolocation } from './useGeolocation';

interface UseMapInitializationProps {
  initialLat: number;
  initialLng: number;
  onMapClick: (lat: number, lng: number) => void;
  onHintHide: () => void;
  onMapReady?: (map: L.Map) => void;
  onLocationFound?: (lat: number, lng: number) => void;
  onLocationError?: (error: string) => void;
}

export const useMapInitialization = ({
  initialLat,
  initialLng,
  onMapClick,
  onHintHide,
  onMapReady,
  onLocationFound,
  onLocationError,
}: UseMapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const hasRequestedGeolocationRef = useRef(false);

  const handleLocationFound = useCallback(
    (result: { latitude: number; longitude: number }) => {
      onLocationFound?.(result.latitude, result.longitude);
    },
    [onLocationFound]
  );

  const handleLocationError = useCallback(
    (error: { message: string }) => {
      onLocationError?.(error.message);
    },
    [onLocationError]
  );

  const { requestGeolocation } = useGeolocation(handleLocationFound, handleLocationError);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current).setView([initialLat, initialLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
      onHintHide();
    };

    map.on('click', handleMapClick);

    mapRef.current = map;
    onMapReady?.(map);

    if (!hasRequestedGeolocationRef.current) {
      hasRequestedGeolocationRef.current = true;
      requestGeolocation();
    }

    return () => {
      if (typeof map.off === 'function') {
        map.off('click', handleMapClick);
      }
      if (typeof map.remove === 'function') {
        map.remove();
      }
      mapRef.current = null;
    };
  }, []);

  return { mapContainer, mapRef };
};
