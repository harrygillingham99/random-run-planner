import { renderHook, waitFor } from '@testing-library/react';
import { useRouteVisualization } from 'hooks/useRouteVisualization';
import type React from 'react';
import * as Leaflet from 'leaflet';

// Mock Leaflet
jest.mock('leaflet', (): Record<string, unknown> => {
  const mockPolyline = {
    addTo: jest.fn().mockReturnThis(),
    getBounds: jest.fn(() => [
      [
        [50, -1],
        [50.1, -1.1],
      ],
    ]),
  };

  const mockMarker = {
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
  };

  const mockLayerGroup = {
    addTo: jest.fn().mockReturnThis(),
  };

  return {
    polyline: jest.fn(() => mockPolyline),
    circleMarker: jest.fn(() => mockMarker),
    layerGroup: jest.fn(() => mockLayerGroup),
  };
});

describe('useRouteVisualization', () => {
  const L = Leaflet as unknown as {
    layerGroup: jest.Mock;
    polyline: jest.Mock;
    circleMarker: jest.Mock;
  };
  let mockMapRef: React.MutableRefObject<L.Map | null>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMapRef = {
      current: {
        removeLayer: jest.fn(),
        fitBounds: jest.fn(),
      },
    } as unknown as React.MutableRefObject<L.Map | null>;
  });

  it('should return routeLayerRef', () => {
    const { result } = renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route: null,
        waypoints: null,
      }),
    );

    expect(result.current.routeLayerRef).toBeDefined();
  });

  it('should not create layers when route is null', () => {
    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route: null,
        waypoints: null,
      }),
    );

    expect(L.layerGroup).not.toHaveBeenCalled();
  });

  it('should not create layers when route is empty', () => {
    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route: [],
        waypoints: null,
      }),
    );

    expect(L.layerGroup).not.toHaveBeenCalled();
  });

  it('should create layer group and add to map', async () => {
    const route: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints: null,
      }),
    );

    await waitFor(() => expect(L.layerGroup).toHaveBeenCalled());
    const mockLayer = L.layerGroup.mock.results[0].value;
    expect(mockLayer.addTo).toHaveBeenCalledWith(mockMapRef.current);
  });

  it('should create polyline with correct properties', async () => {
    const route: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints: null,
      }),
    );

    await waitFor(() => {
      expect(L.polyline).toHaveBeenCalledWith(
        route,
        expect.objectContaining({
          color: '#1D9E75',
          weight: 5,
          opacity: 0.9,
        }),
      );
    });
  });

  it('should add polyline to layer group', async () => {
    const route: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints: null,
      }),
    );

    await waitFor(() => expect(L.polyline).toHaveBeenCalled());
    const mockPolyline = L.polyline.mock.results[0].value;
    expect(mockPolyline.addTo).toHaveBeenCalled();
  });

  it('should create waypoint markers', async () => {
    const route: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];
    const waypoints: [number, number][] = [
      [50.05, -1.05],
      [50.08, -1.08],
    ];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints,
      }),
    );

    await waitFor(() => expect(L.circleMarker).toHaveBeenCalledTimes(waypoints.length));
  });

  it('should create waypoint markers with correct properties', async () => {
    const route: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];
    const waypoints: [number, number][] = [[50.05, -1.05]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints,
      }),
    );

    await waitFor(() => {
      expect(L.circleMarker).toHaveBeenCalledWith(
        [50.05, -1.05],
        expect.objectContaining({
          radius: 6,
          fillColor: '#378ADD',
          color: '#fff',
          weight: 2,
          fillOpacity: 1,
        }),
      );
    });
  });

  it('should bind popup to waypoint markers', async () => {
    const route: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];
    const waypoints: [number, number][] = [[50.05, -1.05]];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints,
      }),
    );

    await waitFor(() => expect(L.circleMarker).toHaveBeenCalled());
    const mockMarker = L.circleMarker.mock.results[0].value;
    expect(mockMarker.bindPopup).toHaveBeenCalledWith('Waypoint 1');
  });

  it('should fit map bounds to route', async () => {
    const route: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];

    renderHook(() =>
      useRouteVisualization({
        mapRef: mockMapRef,
        route,
        waypoints: null,
      }),
    );

    await waitFor(() => {
      expect(mockMapRef.current!.fitBounds).toHaveBeenCalledWith(
        [
          [
            [50, -1],
            [50.1, -1.1],
          ],
        ],
        { padding: [40, 40] },
      );
    });
  });

  it('should remove previous route when route prop changes', async () => {
    const route1: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];
    const route2: [number, number][] = [
      [51, -2],
      [51.1, -2.1],
    ];

    const { rerender } = renderHook(
      ({ route }) =>
        useRouteVisualization({
          mapRef: mockMapRef,
          route,
          waypoints: null,
        }),
      { initialProps: { route: route1 } },
    );

    await waitFor(() => expect(L.layerGroup).toHaveBeenCalledTimes(1));

    rerender({ route: route2 });

    await waitFor(() => expect(mockMapRef.current!.removeLayer).toHaveBeenCalled());
    await waitFor(() => expect(L.layerGroup).toHaveBeenCalledTimes(2));
  });

  it('should clear route layer when route is removed', async () => {
    const route: [number, number][] = [
      [50, -1],
      [50.1, -1.1],
    ];

    const { rerender } = renderHook(
      ({ route: routeProp }: { route: [number, number][] | null }) =>
        useRouteVisualization({
          mapRef: mockMapRef,
          route: routeProp,
          waypoints: null,
        }),
      { initialProps: { route } as { route: [number, number][] | null } },
    );

    await waitFor(() => expect(L.layerGroup).toHaveBeenCalledTimes(1));

    rerender({ route: null });

    await waitFor(() => expect(mockMapRef.current!.removeLayer).toHaveBeenCalled());
  });
});
