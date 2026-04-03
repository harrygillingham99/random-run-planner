import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface UseStartMarkerProps {
  mapRef: React.MutableRefObject<L.Map | null>;
  lat: number;
  lng: number;
}

export const useStartMarker = ({ mapRef, lat, lng }: UseStartMarkerProps) => {
  const startMarkerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (startMarkerRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
    }

    const marker = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#1D9E75',
      color: '#fff',
      weight: 3,
      fillOpacity: 1,
    })
      .addTo(mapRef.current)
      .bindPopup('<strong>Start / Finish</strong>');

    startMarkerRef.current = marker;
    mapRef.current.setView([lat, lng], 14);
  }, [lat, lng, mapRef]);

  return { startMarkerRef };
};
