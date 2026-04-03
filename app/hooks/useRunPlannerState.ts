import { useState, useCallback } from 'react';
import { generateRoute, calculateStats } from 'lib/routeUtils';
import { useGeolocation } from './useGeolocation';
import { useRouteForm } from './useRouteForm';
import type { RunPlannerContextValue, RouteStats } from 'context/RunPlannerContext';

const START_POINT_SET_STATUS = {
  message: 'Start point set — click Generate run!',
  type: 'ok' as const,
};

export const useRunPlannerState = (): RunPlannerContextValue => {
  const {
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
  } = useRouteForm();

  const [status, setStatus] = useState<{ message: string; type: '' | 'ok' | 'err' }>({
    message: 'Set a start point to begin',
    type: '',
  });
  const [routeData, setRouteData] = useState<{
    route: [number, number][] | null;
    waypoints: [number, number][] | null;
  }>({ route: null, waypoints: null });
  const [stats, setStats] = useState<RouteStats>({
    distance: '—',
    time: '—',
    pace: '—',
    waypoints: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMapClick = useCallback(
    (clickLat: number, clickLng: number) => {
      setCoordinates(clickLat, clickLng);
      setStatus(START_POINT_SET_STATUS);
      setSidebarOpen(false);
    },
    [setCoordinates],
  );

  const handleLocationFound = useCallback(
    (locLat: number, locLng: number) => {
      setCoordinates(locLat, locLng);
      setStatus({ message: 'Your location found! Ready to generate routes.', type: 'ok' });
    },
    [setCoordinates],
  );

  const handleLocationError = useCallback(() => {
    setStatus({
      message: 'Ready to generate routes. Click the map to set your location.',
      type: '',
    });
  }, []);

  const { requestGeolocation } = useGeolocation(
    (result) => {
      setCoordinates(result.latitude, result.longitude);
      setStatus({ message: 'Location found! Click Generate run', type: 'ok' });
    },
    (error) => {
      const errorMessage =
        error.code === 0 ? 'Geolocation not supported in this browser' : error.message;
      setStatus({
        message: `${errorMessage} — enter coordinates or click the map`,
        type: 'err',
      });
    },
    { timeout: 8000, maximumAge: 60000 },
  );

  const handleGeoLocation = useCallback(() => {
    setStatus({ message: 'Requesting your location...', type: '' });
    requestGeolocation();
  }, [requestGeolocation]);

  const handleGenerateRoute = useCallback(async () => {
    if (!hasValidCoordinates) {
      setStatus({ message: 'Please set a start point first', type: 'err' });
      return;
    }

    setIsGenerating(true);
    setRouteData({ route: null, waypoints: null });
    setStatus({ message: 'Calculating waypoints...', type: '' });

    const { result, waypoints: newWaypoints } = await generateRoute(lat, lng, distance, style);

    if (!result) {
      setStatus({
        message: 'Could not find a route — try different coordinates or a shorter distance',
        type: 'err',
      });
      setIsGenerating(false);
      return;
    }

    // Remove first and last waypoints from display (they're start/finish)
    const displayWaypoints = newWaypoints?.slice(1, -1) || null;

    setRouteData({ route: result.path, waypoints: displayWaypoints });

    const calculatedStats = calculateStats(result.distance);
    setStats({
      ...calculatedStats,
      waypoints: displayWaypoints?.length || 0,
    });

    setStatus({ message: 'Route ready! Hit Generate again for a different route.', type: 'ok' });
    setIsGenerating(false);
    setSidebarOpen(false);
  }, [hasValidCoordinates, lat, lng, distance, style]);

  const onLatChange = useCallback(
    (value: number) => {
      if (updateLat(value)) setStatus(START_POINT_SET_STATUS);
    },
    [updateLat],
  );

  const onLngChange = useCallback(
    (value: number) => {
      if (updateLng(value)) setStatus(START_POINT_SET_STATUS);
    },
    [updateLng],
  );

  return {
    lat,
    lng,
    distance,
    style,
    hasValidCoordinates,
    onLatChange,
    onLngChange,
    onDistanceChange: setDistance,
    onStyleChange: setStyle,
    onGeoLocation: handleGeoLocation,
    status,
    routeData,
    stats,
    isGenerating,
    sidebarOpen,
    setSidebarOpen,
    onGenerateRoute: handleGenerateRoute,
    onMapClick: handleMapClick,
    onLocationFound: handleLocationFound,
    onLocationError: handleLocationError,
  };
};
