import { useMemo, useState } from 'react';

export type RouteStyle = 'loop' | 'outback';

export interface RouteFormState {
  lat: number;
  lng: number;
  distance: number;
  style: RouteStyle;
}

interface UseRouteFormOptions {
  initialLat?: number;
  initialLng?: number;
  initialDistance?: number;
  initialStyle?: RouteStyle;
}

export const useRouteForm = (options: UseRouteFormOptions = {}) => {
  const [coords, setCoords] = useState({
    lat: options.initialLat ?? 50.9097,
    lng: options.initialLng ?? -1.4044,
  });
  const [distance, setDistance] = useState<number>(options.initialDistance ?? 5);
  const [style, setStyle] = useState<RouteStyle>(options.initialStyle ?? 'loop');

  const setCoordinates = (newLat: number, newLng: number) => {
    setCoords({ lat: newLat, lng: newLng });
  };

  const updateLat = (newLat: number) => {
    setCoords((prev) => ({ ...prev, lat: newLat }));
    return !isNaN(newLat) && !isNaN(coords.lng);
  };

  const updateLng = (newLng: number) => {
    setCoords((prev) => ({ ...prev, lng: newLng }));
    return !isNaN(coords.lat) && !isNaN(newLng);
  };

  const hasValidCoordinates = useMemo(
    () => !isNaN(coords.lat) && !isNaN(coords.lng),
    [coords.lat, coords.lng],
  );

  return {
    lat: coords.lat,
    lng: coords.lng,
    distance,
    style,
    setDistance,
    setStyle,
    setCoordinates,
    updateLat,
    updateLng,
    hasValidCoordinates,
  } as const;
};
