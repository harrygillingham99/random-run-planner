import { renderHook } from '@testing-library/react';
import { useStartMarker } from 'hooks/useStartMarker';
import type React from 'react';
import * as Leaflet from 'leaflet';

// Mock Leaflet
jest.mock('leaflet', (): Record<string, unknown> => {
  const mockMarker = {
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
  };

  return {
    circleMarker: jest.fn(() => mockMarker),
  };
});

describe('useStartMarker', () => {
  const L = Leaflet as unknown as { circleMarker: jest.Mock };
  let mockMapRef: React.MutableRefObject<{
    removeLayer: jest.Mock;
    setView: jest.Mock;
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMapRef = {
      current: {
        removeLayer: jest.fn(),
        setView: jest.fn(),
      },
    };
  });

  it('should return startMarkerRef', () => {
    const { result } = renderHook(() =>
      useStartMarker({ mapRef: mockMapRef, lat: 50.9097, lng: -1.4044 }),
    );

    expect(result.current.startMarkerRef).toBeDefined();
  });

  it('should create a circle marker with correct properties', () => {
    renderHook(() => useStartMarker({ mapRef: mockMapRef, lat: 50.9097, lng: -1.4044 }));

    expect(L.circleMarker).toHaveBeenCalledWith(
      [50.9097, -1.4044],
      expect.objectContaining({
        radius: 10,
        fillColor: '#1D9E75',
        color: '#fff',
        weight: 3,
        fillOpacity: 1,
      }),
    );
  });

  it('should bind popup to marker', () => {
    renderHook(() => useStartMarker({ mapRef: mockMapRef, lat: 50.9097, lng: -1.4044 }));

    const mockMarker = L.circleMarker.mock.results[0].value;
    expect(mockMarker.bindPopup).toHaveBeenCalledWith('<strong>Start / Finish</strong>');
  });

  it('should add marker to map', () => {
    renderHook(() => useStartMarker({ mapRef: mockMapRef, lat: 50.9097, lng: -1.4044 }));

    const mockMarker = L.circleMarker.mock.results[0].value;
    expect(mockMarker.addTo).toHaveBeenCalledWith(mockMapRef.current);
  });

  it('should center map on marker', () => {
    renderHook(() => useStartMarker({ mapRef: mockMapRef, lat: 50.9097, lng: -1.4044 }));

    expect(mockMapRef.current.setView).toHaveBeenCalledWith([50.9097, -1.4044], 14);
  });

  it('should remove previous marker when coordinates change', () => {
    const { rerender } = renderHook(
      ({ lat, lng }) => useStartMarker({ mapRef: mockMapRef, lat, lng }),
      { initialProps: { lat: 50.9097, lng: -1.4044 } },
    );

    const firstMarker = L.circleMarker.mock.results[0].value;

    rerender({ lat: 51.5074, lng: -0.1278 });

    expect(mockMapRef.current.removeLayer).toHaveBeenCalledWith(firstMarker);
  });

  it('should update marker position when coordinates change', () => {
    const { rerender } = renderHook(
      ({ lat, lng }) => useStartMarker({ mapRef: mockMapRef, lat, lng }),
      { initialProps: { lat: 50.9097, lng: -1.4044 } },
    );

    rerender({ lat: 51.5074, lng: -0.1278 });

    expect(L.circleMarker).toHaveBeenLastCalledWith([51.5074, -0.1278], expect.any(Object));
  });
});
