import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface UseRouteVisualizationProps {
  mapRef: React.MutableRefObject<L.Map | null>;
  route: [number, number][] | null;
  waypoints: [number, number][] | null;
}

export const useRouteVisualization = ({ mapRef, route, waypoints }: UseRouteVisualizationProps) => {
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (route && route.length > 0) {
      const layer = L.layerGroup().addTo(mapRef.current);
      const poly = L.polyline(route, {
        color: '#1D9E75',
        weight: 5,
        opacity: 0.9,
      }).addTo(layer);

      if (waypoints) {
        waypoints.forEach((wp, i) => {
          L.circleMarker(wp, {
            radius: 6,
            fillColor: '#378ADD',
            color: '#fff',
            weight: 2,
            fillOpacity: 1,
          })
            .addTo(layer)
            .bindPopup(`Waypoint ${i + 1}`);
        });
      }

      mapRef.current.fitBounds(poly.getBounds(), { padding: [40, 40] });
      routeLayerRef.current = layer;
    }
  }, [route, waypoints, mapRef]);

  return { routeLayerRef };
};
