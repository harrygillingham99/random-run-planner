'use client';

import { createContext, useContext } from 'react';

export type RouteStyle = 'loop' | 'outback';

export interface RouteStats {
  distance: string;
  time: string;
  pace: string;
  waypoints: number;
}

export interface RunPlannerContextValue {
  // Form state
  lat: number;
  lng: number;
  distance: number;
  style: RouteStyle;
  hasValidCoordinates: boolean;
  // Form handlers
  onLatChange: (value: number) => void;
  onLngChange: (value: number) => void;
  onDistanceChange: (value: number) => void;
  onStyleChange: (value: RouteStyle) => void;
  onGeoLocation: () => void;
  // Route state
  status: { message: string; type: '' | 'ok' | 'err' };
  routeData: { route: [number, number][] | null; waypoints: [number, number][] | null };
  stats: RouteStats;
  isGenerating: boolean;
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  // Map / route actions
  onGenerateRoute: () => void;
  onMapClick: (lat: number, lng: number) => void;
  onLocationFound: (lat: number, lng: number) => void;
  onLocationError: (error: string) => void;
}

export const RunPlannerContext = createContext<RunPlannerContextValue | null>(null);

export const useRunPlanner = (): RunPlannerContextValue => {
  const ctx = useContext(RunPlannerContext);
  if (!ctx) {
    throw new Error('useRunPlanner must be used inside a RunPlannerContext.Provider');
  }
  return ctx;
};
