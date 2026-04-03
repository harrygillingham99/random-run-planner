import { useState, useEffect } from 'react';

const parseDecimalInput = (raw: string): number | null => {
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) return null;
  const value = Number(normalized);
  return Number.isNaN(value) ? null : value;
};

interface UseCoordinateInputsProps {
  lat: number;
  lng: number;
  distance: number;
  onLatChange: (v: number) => void;
  onLngChange: (v: number) => void;
  onDistanceChange: (v: number) => void;
}

export function useCoordinateInputs({
  lat,
  lng,
  distance,
  onLatChange,
  onLngChange,
  onDistanceChange,
}: UseCoordinateInputsProps) {
  const [latRaw, setLatRaw] = useState(String(lat));
  const [lngRaw, setLngRaw] = useState(String(lng));
  const [distanceRaw, setDistanceRaw] = useState(String(distance));

  useEffect(() => {
    setLatRaw(String(lat));
  }, [lat]);
  useEffect(() => {
    setLngRaw(String(lng));
  }, [lng]);
  useEffect(() => {
    setDistanceRaw(String(distance));
  }, [distance]);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLatRaw(raw);
    const value = parseDecimalInput(raw);
    if (value !== null && value >= -90 && value <= 90) onLatChange(value);
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLngRaw(raw);
    const value = parseDecimalInput(raw);
    if (value !== null && value >= -180 && value <= 180) onLngChange(value);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDistanceRaw(raw);
    const value = parseDecimalInput(raw);
    if (value !== null) onDistanceChange(Math.min(30, Math.max(1, value)));
  };

  return {
    latRaw,
    lngRaw,
    distanceRaw,
    handleLatChange,
    handleLngChange,
    handleDistanceChange,
  };
}
