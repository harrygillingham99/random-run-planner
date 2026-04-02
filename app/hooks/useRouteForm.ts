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
  const [lat, setLat] = useState<number>(options.initialLat ?? 50.9097);
  const [lng, setLng] = useState<number>(options.initialLng ?? -1.4044);
  const [distance, setDistance] = useState<number>(options.initialDistance ?? 5);
  const [style, setStyle] = useState<RouteStyle>(options.initialStyle ?? 'loop');

  const setCoordinates = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  };

  const updateLat = (newLat: number) => {
    setLat(newLat);
    return !isNaN(newLat) && !isNaN(lng);
  };

  const updateLng = (newLng: number) => {
    setLng(newLng);
    return !isNaN(lat) && !isNaN(newLng);
  };

  const hasValidCoordinates = useMemo(() => !isNaN(lat) && !isNaN(lng), [lat, lng]);

  return {
    lat,
    lng,
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
