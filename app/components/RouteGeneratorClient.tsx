'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { generateRoute, calculateStats } from '../lib/routeUtils';
import Sidebar from './Sidebar';
import FloatingStats from './FloatingStats';

const Map = dynamic(() => import('./Map'), { ssr: false });

interface Stats {
  distance: string;
  time: string;
  pace: string;
  waypoints: number;
}

export default function RouteGeneratorClient() {
  const [lat, setLat] = useState<number>(50.9097);
  const [lng, setLng] = useState<number>(-1.4044);
  const [distance, setDistance] = useState<number>(5);
  const [style, setStyle] = useState<'loop' | 'outback'>('loop');
  const [status, setStatus] = useState<{ message: string; type: '' | 'ok' | 'err' }>(
    { message: 'Set a start point to begin', type: '' }
  );
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [waypoints, setWaypoints] = useState<[number, number][] | null>(null);
  const [stats, setStats] = useState<Stats>({
    distance: '—',
    time: '—',
    pace: '—',
    waypoints: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMapClick = useCallback((clickLat: number, clickLng: number) => {
    setLat(clickLat);
    setLng(clickLng);
    setStatus({ message: 'Start point set — click Generate run!', type: 'ok' });
    setSidebarOpen(false);
  }, []);

  const handleLocationFound = useCallback((locLat: number, locLng: number) => {
    setLat(locLat);
    setLng(locLng);
    setStatus({ message: 'Your location found! Ready to generate routes.', type: 'ok' });
  }, []);

  const handleLocationError = useCallback((errorMessage: string) => {
    // Gracefully fall back to default location without showing error
    // User can still click the map or use the sidebar to set location
    console.log('Geolocation failed:', errorMessage);
    setStatus({ message: 'Ready to generate routes. Click the map to set your location.', type: '' });
  }, []);

  const checkCoordinates = (newLat: number, newLng: number) => {
    if (!isNaN(newLat) && !isNaN(newLng)) {
      setStatus({ message: 'Start point set — click Generate run!', type: 'ok' });
    }
  };

  const handleGeoLocation = () => {
    setStatus({ message: 'Requesting your location...', type: '' });
    if (!navigator.geolocation) {
      setStatus({ message: 'Geolocation not supported in this browser', type: 'err' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        setStatus({ message: 'Location found! Click Generate run', type: 'ok' });
      },
      (err) => {
        const msgs: { [key: number]: string } = {
          1: 'Location permission denied',
          2: 'Position unavailable',
          3: 'Request timed out',
        };
        setStatus({
          message: (msgs[err.code] || 'Location failed') + ' — enter coordinates or click the map',
          type: 'err',
        });
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleGenerateRoute = async () => {
    if (isNaN(lat) || isNaN(lng)) {
      setStatus({ message: 'Please set a start point first', type: 'err' });
      return;
    }

    setIsGenerating(true);
    setRoute(null);
    setWaypoints(null);

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

    setRoute(result.path);
    setWaypoints(displayWaypoints);

    const calculatedStats = calculateStats(result.distance);
    setStats({
      ...calculatedStats,
      waypoints: displayWaypoints?.length || 0,
    });

    setStatus({ message: 'Route ready! Hit Generate again for a different route.', type: 'ok' });
    setIsGenerating(false);
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="menu-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        lat={lat}
        lng={lng}
        onLatChange={(value) => {
          setLat(value);
          checkCoordinates(value, lng);
        }}
        onLngChange={(value) => {
          setLng(value);
          checkCoordinates(lat, value);
        }}
        onGeoLocation={handleGeoLocation}
        distance={distance}
        onDistanceChange={setDistance}
        style={style}
        onStyleChange={setStyle}
        onGenerateRoute={handleGenerateRoute}
        isGenerating={isGenerating}
        status={status}
        stats={stats}
      />

      <Map 
        lat={lat} 
        lng={lng} 
        onMapClick={handleMapClick} 
        onLocationFound={handleLocationFound}
        onLocationError={handleLocationError}
        route={route} 
        waypoints={waypoints} 
      />

      <FloatingStats
        distance={stats.distance}
        time={stats.time}
        isVisible={route !== null && !sidebarOpen}
      />

      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </>
  );
}
