'use client';

import { useState, useCallback, useEffect } from 'react';
import L from 'leaflet';
import { useGeolocation } from '../hooks/useGeolocation';
import { useMapInitialization } from '../hooks/useMapInitialization';
import { useStartMarker } from '../hooks/useStartMarker';
import { useRouteVisualization } from '../hooks/useRouteVisualization';
import { useMapHint } from '../hooks/useMapHint';

interface MapProps {
  lat: number;
  lng: number;
  onMapClick: (lat: number, lng: number) => void;
  onLocationFound?: (lat: number, lng: number) => void;
  onLocationError?: (error: string) => void;
  route: any[] | null;
  waypoints: any[] | null;
}

export default function Map({ lat, lng, onMapClick, onLocationFound, onLocationError, route, waypoints }: MapProps) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [hasAttemptedGeolocation, setHasAttemptedGeolocation] = useState(false);

  const { showHint, hideHint } = useMapHint();

  // Memoize callbacks to prevent unnecessary re-renders and recreation of requestGeolocation
  const handleLocationFoundCallback = useCallback((result: { latitude: number; longitude: number }) => {
    onLocationFound?.(result.latitude, result.longitude);
  }, [onLocationFound]);

  const handleLocationErrorCallback = useCallback((error: { message: string }) => {
    onLocationError?.(error.message);
  }, [onLocationError]);

  const { requestGeolocation } = useGeolocation(
    handleLocationFoundCallback,
    handleLocationErrorCallback
  );

  const { mapContainer, mapRef } = useMapInitialization({
    initialLat: lat,
    initialLng: lng,
    onMapClick,
    onHintHide: hideHint,
    onMapReady: setMapInstance,
    onGeolocationRequest: () => {}, // No-op, we'll handle geolocation separately
    hasAttemptedGeolocation,
  });

  useStartMarker({ mapRef, lat, lng });
  useRouteVisualization({ mapRef, route, waypoints });

  // Trigger geolocation once when map is ready
  useEffect(() => {
    if (mapInstance && !hasAttemptedGeolocation) {
      setHasAttemptedGeolocation(true);
      requestGeolocation();
    }
  }, [mapInstance, hasAttemptedGeolocation, requestGeolocation]);

  return (
    <div id="map-container" ref={mapContainer} className="map-container">
      {showHint && <div className="map-hint">Click the map to set your start point</div>}
    </div>
  );
}
