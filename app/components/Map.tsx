'use client';

import { useMapInitialization } from 'hooks/useMapInitialization';
import { useStartMarker } from 'hooks/useStartMarker';
import { useRouteVisualization } from 'hooks/useRouteVisualization';
import { useMapHint } from 'hooks/useMapHint';
import { useRunPlanner } from 'context/RunPlannerContext';
import styles from 'styles/Map.module.scss';

export default function Map() {
  const { lat, lng, onMapClick, onLocationFound, onLocationError, routeData } = useRunPlanner();
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
  useRouteVisualization({ mapRef, route: routeData.route, waypoints: routeData.waypoints });

  return (
    <div id="map-container" ref={mapContainer} className={styles.mapContainer}>
      {showHint && <div className={styles.mapHint}>Click the map to set your start point</div>}
    </div>
  );
}
