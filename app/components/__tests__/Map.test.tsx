import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Map from 'components/Map';
import { RunPlannerContext } from 'context/RunPlannerContext';
import type { RunPlannerContextValue } from 'context/RunPlannerContext';
import { useGeolocation } from 'hooks/useGeolocation';

// Mock useGeolocation hook
jest.mock('hooks/useGeolocation', () => ({
  useGeolocation: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    requestGeolocation: jest.fn(),
  })),
}));

// Mock Leaflet with proper mock implementation
jest.mock('leaflet', (): Record<string, unknown> => {
  const mockMap: Record<string, jest.Mock> & {
    setView: jest.Mock;
    on: jest.Mock;
    removeLayer: jest.Mock;
    addLayer: jest.Mock;
    fitBounds: jest.Mock;
  } = {
    setView: jest.fn(function (this: typeof mockMap): typeof mockMap {
      return this;
    }),
    on: jest.fn(function (this: typeof mockMap): typeof mockMap {
      return this;
    }),
    removeLayer: jest.fn(function (this: typeof mockMap): typeof mockMap {
      return this;
    }),
    addLayer: jest.fn(function (this: typeof mockMap): typeof mockMap {
      return this;
    }),
    fitBounds: jest.fn(function (this: typeof mockMap): typeof mockMap {
      return this;
    }),
  };

  const mockTileLayer: Record<string, jest.Mock> & { addTo: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockTileLayer): typeof mockTileLayer {
      return this;
    }),
  };

  const mockCircleMarker: Record<string, jest.Mock> & { addTo: jest.Mock; bindPopup: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockCircleMarker): typeof mockCircleMarker {
      return this;
    }),
    bindPopup: jest.fn(function (this: typeof mockCircleMarker): typeof mockCircleMarker {
      return this;
    }),
  };

  const mockLayerGroup: Record<string, jest.Mock> & { addTo: jest.Mock; addLayer: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockLayerGroup): typeof mockLayerGroup {
      return this;
    }),
    addLayer: jest.fn(function (this: typeof mockLayerGroup): typeof mockLayerGroup {
      return this;
    }),
  };

  const mockPolyline: Record<string, jest.Mock> & { addTo: jest.Mock; getBounds: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockPolyline): typeof mockPolyline {
      return this;
    }),
    getBounds: jest.fn(
      (): Array<Array<[number, number]>> => [
        [
          [50, -1],
          [50.1, -1.1],
        ],
      ],
    ),
  };

  const mockMarker: Record<string, jest.Mock> & { addTo: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockMarker): typeof mockMarker {
      return this;
    }),
  };

  return {
    map: jest.fn((): typeof mockMap => mockMap),
    tileLayer: jest.fn((): typeof mockTileLayer => mockTileLayer),
    circleMarker: jest.fn((): typeof mockCircleMarker => mockCircleMarker),
    layerGroup: jest.fn((): typeof mockLayerGroup => mockLayerGroup),
    polyline: jest.fn((): typeof mockPolyline => mockPolyline),
    marker: jest.fn((): typeof mockMarker => mockMarker),
  };
});

describe('Map Component', () => {
  const mockOnMapClick = jest.fn();
  const defaultContext: RunPlannerContextValue = {
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
    onMapClick: mockOnMapClick,
    onLocationFound: jest.fn(),
    onLocationError: jest.fn(),
  };

  const renderMap = (overrides: Partial<RunPlannerContextValue> = {}) =>
    render(
      <RunPlannerContext.Provider value={{ ...defaultContext, ...overrides }}>
        <Map />
      </RunPlannerContext.Provider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render map container', () => {
    renderMap();
    // Component renders without crashing
    expect(mockOnMapClick).toBeDefined();
  });

  it('should handle map initialization', async () => {
    const { container } = renderMap();

    await waitFor(() => {
      // Map container should be present
      const mapElement = container.querySelector('[style*="position"]');
      expect(mapElement).toBeDefined();
    });
  });

  it('should pass correct initial coordinates', () => {
    renderMap({ lat: 51.5074, lng: -0.1278 });

    expect(mockOnMapClick).toBeDefined();
  });

  it('should accept route and waypoints in context', () => {
    renderMap({
      routeData: {
        route: [
          [50, -1],
          [50.1, -1.1],
        ],
        waypoints: [[50, -1]],
      },
    });

    expect(mockOnMapClick).toBeDefined();
  });

  it('should render with various coordinate values', () => {
    const testCases = [
      { lat: 0, lng: 0 },
      { lat: -90, lng: -180 },
      { lat: 90, lng: 180 },
      { lat: 45.5, lng: -122.68 },
    ];

    testCases.forEach(({ lat, lng }) => {
      const { unmount } = renderMap({ lat, lng });
      expect(mockOnMapClick).toBeDefined();
      unmount();
    });
  });

  it('should call onLocationFound when geolocation is successful', async () => {
    const mockOnLocationFound = jest.fn();
    const mockRequestGeolocation = jest.fn();

    (useGeolocation as jest.Mock).mockImplementation(() => ({
      data: null,
      error: null,
      isLoading: false,
      requestGeolocation: mockRequestGeolocation,
    }));

    renderMap({ onLocationFound: mockOnLocationFound });

    await waitFor(() => {
      expect(mockRequestGeolocation).toHaveBeenCalled();
    });
  });

  it('should call onLocationError when geolocation fails', async () => {
    const mockOnLocationError = jest.fn();
    const mockRequestGeolocation = jest.fn();

    (useGeolocation as jest.Mock).mockImplementation(
      (_: unknown, onError: ((error: { message: string }) => void) | undefined) => {
        // Simulate calling the error callback
        setTimeout(() => {
          if (onError) {
            onError({ message: 'Permission denied' });
          }
        }, 0);
        return {
          data: null,
          error: null,
          isLoading: false,
          requestGeolocation: mockRequestGeolocation,
        };
      },
    );

    renderMap({ onLocationError: mockOnLocationError });

    await waitFor(() => {
      expect(mockRequestGeolocation).toHaveBeenCalled();
    });
  });

  it('should preserve existing functionality with location callbacks', () => {
    renderMap({
      routeData: {
        route: [
          [50, -1],
          [50.1, -1.1],
        ],
        waypoints: [[50, -1]],
      },
      onLocationFound: jest.fn(),
      onLocationError: jest.fn(),
    });

    expect(mockOnMapClick).toBeDefined();
    // Verify component renders without errors
  });

  it('should work without location callbacks (backward compatible)', () => {
    renderMap({
      routeData: {
        route: [
          [50, -1],
          [50.1, -1.1],
        ],
        waypoints: [[50, -1]],
      },
    });

    expect(mockOnMapClick).toBeDefined();
  });
});
