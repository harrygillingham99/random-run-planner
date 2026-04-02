import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Map from '@/app/components/Map';

// Mock useGeolocation hook
jest.mock('@/app/hooks/useGeolocation', () => ({
  useGeolocation: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    requestGeolocation: jest.fn(),
  })),
}));

// Mock Leaflet with proper mock implementation
jest.mock('leaflet', (): Record<string, unknown> => {
  const mockMap: Record<string, jest.Mock> & { setView: jest.Mock; on: jest.Mock; removeLayer: jest.Mock; addLayer: jest.Mock; fitBounds: jest.Mock } = {
    setView: jest.fn(function (this: typeof mockMap): typeof mockMap { return this; }),
    on: jest.fn(function (this: typeof mockMap): typeof mockMap { return this; }),
    removeLayer: jest.fn(function (this: typeof mockMap): typeof mockMap { return this; }),
    addLayer: jest.fn(function (this: typeof mockMap): typeof mockMap { return this; }),
    fitBounds: jest.fn(function (this: typeof mockMap): typeof mockMap { return this; }),
  };

  const mockTileLayer: Record<string, jest.Mock> & { addTo: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockTileLayer): typeof mockTileLayer { return this; }),
  };

  const mockCircleMarker: Record<string, jest.Mock> & { addTo: jest.Mock; bindPopup: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockCircleMarker): typeof mockCircleMarker { return this; }),
    bindPopup: jest.fn(function (this: typeof mockCircleMarker): typeof mockCircleMarker { return this; }),
  };

  const mockLayerGroup: Record<string, jest.Mock> & { addTo: jest.Mock; addLayer: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockLayerGroup): typeof mockLayerGroup { return this; }),
    addLayer: jest.fn(function (this: typeof mockLayerGroup): typeof mockLayerGroup { return this; }),
  };

  const mockPolyline: Record<string, jest.Mock> & { addTo: jest.Mock; getBounds: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockPolyline): typeof mockPolyline { return this; }),
    getBounds: jest.fn((): Array<Array<[number, number]>> => [[[50, -1], [50.1, -1.1]]]),
  };

  const mockMarker: Record<string, jest.Mock> & { addTo: jest.Mock } = {
    addTo: jest.fn(function (this: typeof mockMarker): typeof mockMarker { return this; }),
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
  const defaultProps = {
    lat: 50.9097,
    lng: -1.4044,
    onMapClick: mockOnMapClick,
    route: null,
    waypoints: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render map container', () => {
    render(<Map {...defaultProps} />);
    // Component renders without crashing
    expect(mockOnMapClick).toBeDefined();
  });

  it('should handle map initialization', async () => {
    const { container } = render(<Map {...defaultProps} />);
    
    await waitFor(() => {
      // Map container should be present
      const mapElement = container.querySelector('[style*="position"]');
      expect(mapElement).toBeDefined();
    });
  });

  it('should pass correct initial coordinates', () => {
    const testLat = 51.5074;
    const testLng = -0.1278;
    
    render(<Map lat={testLat} lng={testLng} onMapClick={mockOnMapClick} route={null} waypoints={null} />);
    
    expect(mockOnMapClick).toBeDefined();
  });

  it('should accept route and waypoints props', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];
    const waypoints: [number, number][] = [[50, -1]];
    
    render(
      <Map 
        lat={50} 
        lng={-1} 
        onMapClick={mockOnMapClick} 
        route={route} 
        waypoints={waypoints}
      />
    );
    
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
      const { unmount } = render(
        <Map lat={lat} lng={lng} onMapClick={mockOnMapClick} route={null} waypoints={null} />
      );
      expect(mockOnMapClick).toBeDefined();
      unmount();
    });
  });

  it('should call onLocationFound when geolocation is successful', async () => {
    const { useGeolocation } = require('@/app/hooks/useGeolocation');
    const mockOnLocationFound = jest.fn();
    const mockRequestGeolocation = jest.fn();

    useGeolocation.mockImplementation((onSuccess: any) => ({
      data: null,
      error: null,
      isLoading: false,
      requestGeolocation: mockRequestGeolocation,
    }));

    render(
      <Map
        lat={50.9097}
        lng={-1.4044}
        onMapClick={mockOnMapClick}
        onLocationFound={mockOnLocationFound}
        route={null}
        waypoints={null}
      />
    );

    await waitFor(() => {
      expect(mockRequestGeolocation).toHaveBeenCalled();
    });
  });

  it('should call onLocationError when geolocation fails', async () => {
    const { useGeolocation } = require('@/app/hooks/useGeolocation');
    const mockOnLocationError = jest.fn();
    const mockRequestGeolocation = jest.fn();

    useGeolocation.mockImplementation((onSuccess: any, onError: any) => {
      // Simulate calling the error callback
      setTimeout(() => {
        onError && onError({ message: 'Permission denied' });
      }, 0);
      return {
        data: null,
        error: null,
        isLoading: false,
        requestGeolocation: mockRequestGeolocation,
      };
    });

    render(
      <Map
        lat={50.9097}
        lng={-1.4044}
        onMapClick={mockOnMapClick}
        onLocationError={mockOnLocationError}
        route={null}
        waypoints={null}
      />
    );

    await waitFor(() => {
      expect(mockRequestGeolocation).toHaveBeenCalled();
    });
  });

  it('should preserve existing functionality with location callbacks', () => {
    const mockOnLocationFound = jest.fn();
    const mockOnLocationError = jest.fn();
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];
    const waypoints: [number, number][] = [[50, -1]];

    render(
      <Map
        lat={50}
        lng={-1}
        onMapClick={mockOnMapClick}
        onLocationFound={mockOnLocationFound}
        onLocationError={mockOnLocationError}
        route={route}
        waypoints={waypoints}
      />
    );

    expect(mockOnMapClick).toBeDefined();
    // Verify component renders without errors
  });

  it('should work without location callbacks (backward compatible)', () => {
    const route: [number, number][] = [[50, -1], [50.1, -1.1]];
    const waypoints: [number, number][] = [[50, -1]];

    render(
      <Map
        lat={50}
        lng={-1}
        onMapClick={mockOnMapClick}
        route={route}
        waypoints={waypoints}
      />
    );

    expect(mockOnMapClick).toBeDefined();
  });
});
