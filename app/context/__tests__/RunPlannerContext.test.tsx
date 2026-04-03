import React from 'react';
import { renderHook } from '@testing-library/react';
import {
  RunPlannerContext,
  useRunPlanner,
  type RunPlannerContextValue,
} from 'context/RunPlannerContext';

const mockContextValue: RunPlannerContextValue = {
  lat: 50.9097,
  lng: -1.4044,
  distance: 5,
  style: 'loop',
  hasValidCoordinates: true,
  onLatChange: jest.fn(),
  onLngChange: jest.fn(),
  onDistanceChange: jest.fn(),
  onStyleChange: jest.fn(),
  onGeoLocation: jest.fn(),
  status: { message: '', type: '' },
  routeData: { route: null, waypoints: null },
  stats: { distance: '—', time: '—', pace: '—', waypoints: 0 },
  isGenerating: false,
  sidebarOpen: false,
  setSidebarOpen: jest.fn(),
  onGenerateRoute: jest.fn(),
  onMapClick: jest.fn(),
  onLocationFound: jest.fn(),
  onLocationError: jest.fn(),
};

describe('RunPlannerContext', () => {
  it('should throw when useRunPlanner is used outside provider', () => {
    expect(() => renderHook(() => useRunPlanner())).toThrow(
      'useRunPlanner must be used inside a RunPlannerContext.Provider',
    );
  });

  it('should return context value when used within provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RunPlannerContext.Provider value={mockContextValue}>{children}</RunPlannerContext.Provider>
    );

    const { result } = renderHook(() => useRunPlanner(), { wrapper });

    expect(result.current).toBe(mockContextValue);
    expect(result.current.distance).toBe(5);
    expect(result.current.style).toBe('loop');
  });
});
