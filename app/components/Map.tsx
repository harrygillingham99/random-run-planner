'use client';

import { useMapInitialization } from '../hooks/useMapInitialization';
import { useStartMarker } from '../hooks/useStartMarker';
import { useRouteVisualization } from '../hooks/useRouteVisualization';
import { useMapHint } from '../hooks/useMapHint';
import '../styles/Map.scss';

interface MapProps {
  lat: number;
  lng: number;
  onMapClick: (lat: number, lng: number) => void;
  onLocationFound?: (lat: number, lng: number) => void;
  onLocationError?: (error: string) => void;
  route: [number, number][] | null;
  waypoints: [number, number][] | null;
}

export default function Map({ lat, lng, onMapClick, onLocationFound, onLocationError, route, waypoints }: MapProps) {
  const { showHint, hideHint } = useMapHint();

  const { mapContainer, mapRef } = useMapInitialization({
    initialLat: lat,
    initialLng: lng,
    onMapClick,
    onHintHide: hideHint,
    onLocationFound,
    onLocationError,
  });

  useStartMarker({ mapRef, lat, lng });
  useRouteVisualization({ mapRef, route, waypoints });

  return (
    <div id="map-container" ref={mapContainer} className="map-container">
      {showHint && <div className="map-hint">Click the map to set your start point</div>}
    </div>
  );
}
