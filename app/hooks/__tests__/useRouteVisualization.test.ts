import { renderHook } from '@testing-library/react';
import { useRouteVisualization } from '@/app/hooks/useRouteVisualization';
import React from 'react';

// Mock Leaflet
jest.mock('leaflet', (): Record<string, unknown> => {
  const mockPolyline = {
    addTo: jest.fn(function (this: any) { return this; }),
    getBounds: jest.fn(() => [[[50, -1], [50.1, -1.1]]]),
  };

  const mockMarker = {
    addTo: jest.fn(function (this: any) { return this; }),
    bindPopup: jest.fn(function (this: any) { return this; }),
  };

  const mockLayerGroup = {
    addTo: jest.fn(function (this: any) { return this; }),
  };

  const mockMap = {
    removeLayer: jest.fn(),
    fitBounds: jest.fn(),
  };

  return {
    polyline: jest.fn(() => mockPolyline),
    circleMarker: jest.fn(() => mockMarker),
    layerGroup: jest.fn(() => mockLayerGroup),
  };
});

describe('useRouteVisualization', () => {
  const L = require('leaflet');
  let mockMapRef: React.MutableRefObject<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMapRef = {
      current: {
        removeLayer: jest.fn(),
        fitBounds: jest.fn(),
      },
    };
  });

  it('should return routeLayerRef', () => {
    const { result } = renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route: null,
        waypoints: null,
      })
    );

    expect(result.current.routeLayerRef).toBeDefined();
  });

  it('should not create layers when route is null', () => {
    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route: null,
        waypoints: null,
      })
    );

    expect(L.layerGroup).not.toHaveBeenCalled();
  });

  it('should not create layers when route is empty', () => {
    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route: [],
        waypoints: null,
      })
    );

    expect(L.layerGroup).not.toHaveBeenCalled();
  });

  it('should create layer group and add to map', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints: null,
      })
    );

    expect(L.layerGroup).toHaveBeenCalled();
    const mockLayer = L.layerGroup.mock.results[0].value;
    expect(mockLayer.addTo).toHaveBeenCalledWith(mockMapRef.current);
  });

  it('should create polyline with correct properties', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints: null,
      })
    );

    expect(L.polyline).toHaveBeenCalledWith(
      route,
      expect.objectContaining({
        color: '#1D9E75',
        weight: 5,
        opacity: 0.9,
      })
    );
  });

  it('should add polyline to layer group', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints: null,
      })
    );

    const mockPolyline = L.polyline.mock.results[0].value;
    expect(mockPolyline.addTo).toHaveBeenCalled();
  });

  it('should create waypoint markers', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];
    const waypoints: [number, number][] = [[50.05, -1.05], [50.08, -1.08]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints,
      })
    );

    expect(L.circleMarker).toHaveBeenCalledTimes(waypoints.length);
  });

  it('should create waypoint markers with correct properties', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];
    const waypoints: [number, number][] = [[50.05, -1.05]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints,
      })
    );

    expect(L.circleMarker).toHaveBeenCalledWith(
      [50.05, -1.05],
      expect.objectContaining({
        radius: 6,
        fillColor: '#378ADD',
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      })
    );
  });

  it('should bind popup to waypoint markers', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];
    const waypoints: [number, number][] = [[50.05, -1.05]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints,
      })
    );

    const mockMarker = L.circleMarker.mock.results[0].value;
    expect(mockMarker.bindPopup).toHaveBeenCalledWith('Waypoint 1');
  });

  it('should fit map bounds to route', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints: null,
      })
    );

    expect(mockMapRef.current.fitBounds).toHaveBeenCalledWith(
      [[[50, -1], [50.1, -1.1]]],
      { padding: [40, 40] }
    );
  });

  it('should remove previous route when route prop changes', () => {
    const route1: [number, number][] = [[50, -1], [50.1, -1.1]];
    const route2: [number, number][] = [[51, -2], [51.1, -2.1]];

    const { rerender } = renderHook(
      ({ route }) =>
        useRouteVisualization({
          mapRef: mockMapRef,
          route,
          waypoints: null,
        }),
      { initialProps: { route: route1 } }
    );

    expect(L.layerGroup).toHaveBeenCalledTimes(1);

    rerender({ route: route2 });

    expect(mockMapRef.current.removeLayer).toHaveBeenCalled();
    expect(L.layerGroup).toHaveBeenCalledTimes(2);
  });

  it('should clear route layer when route is removed', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];

    const { rerender } = renderHook(
      ({ route: routeProp }: { route: [number, number][] | null }) =>
        useRouteVisualization({
          mapRef: mockMapRef,
          route: routeProp,
          waypoints: null,
        }),
      { initialProps: { route } as any }
    );

    rerender({ route: null } as any);

    expect(mockMapRef.current.removeLayer).toHaveBeenCalled();
  });
});
