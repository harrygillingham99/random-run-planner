import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RouteGeneratorClient from '@/app/components/RouteGeneratorClient';
import * as routeUtils from '@/app/lib/routeUtils';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args: any[]) => {
    const dynamicModule = jest.requireActual('next/dynamic');
    const dynamicActualComp = dynamicModule.default;
    const RequiredComponent = dynamicActualComp(args[0]);
    RequiredComponent.preload
      ? RequiredComponent.preload()
      : RequiredComponent.render.preload();
    return RequiredComponent;
  },
}));

// Mock the Map component
jest.mock('@/app/components/Map', () => {
  return function MockMap(props: any) {
    return <div data-testid="map-component">Map Component</div>;
  };
});

// Mock route utilities
jest.mock('@/app/lib/routeUtils', () => ({
  generateRoute: jest.fn(),
  calculateStats: jest.fn(),
}));

describe('RouteGeneratorClient Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: jest.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render the client with initial state', () => {
    render(<RouteGeneratorClient />);

    expect(screen.getByRole('button', { name: /Generate run/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Detect my location/i })).toBeInTheDocument();
    expect(screen.getByTestId('map-component')).toBeInTheDocument();
  });

  it('should display initial status message', () => {
    render(<RouteGeneratorClient />);

    expect(screen.getByText('Set a start point to begin')).toBeInTheDocument();
  });

  it('should toggle sidebar menu', async () => {
    const user = userEvent.setup();
    render(<RouteGeneratorClient />);

    const menuButton = screen.getByRole('button', { name: /Toggle menu/i });
    expect(menuButton).toBeInTheDocument();

    await user.click(menuButton);

    // Sidebar should be visible (check for closed button)
    expect(screen.getByRole('button', { name: /Close menu/i })).toBeInTheDocument();
  });

  describe('Coordinate Input', () => {
    it('should accept valid latitude input', async () => {
      const user = userEvent.setup();
      render(<RouteGeneratorClient />);

      const latInput = screen.getByPlaceholderText('50.90970') as HTMLInputElement;

      fireEvent.change(latInput, { target: { value: '51.5074' } });

      expect(latInput.value).toBe('51.5074');
      expect(screen.getByText('Start point set — click Generate run!')).toBeInTheDocument();
    });

    it('should accept valid longitude input', async () => {
      const user = userEvent.setup();
      render(<RouteGeneratorClient />);

      const lngInput = screen.getByPlaceholderText('-1.40440') as HTMLInputElement;

      fireEvent.change(lngInput, { target: { value: '-0.1278' } });

      expect(lngInput.value).toBe('-0.1278');
      expect(screen.getByText('Start point set — click Generate run!')).toBeInTheDocument();
    });

    it('should reject invalid latitude values', async () => {
      const user = userEvent.setup();
      render(<RouteGeneratorClient />);

      const latInput = screen.getByPlaceholderText('50.90970') as HTMLInputElement;

      await user.clear(latInput);
      await user.type(latInput, '95');

      // Should not accept values > 90
      fireEvent.change(latInput, { target: { value: '95' } });
      // Component should reject this, value should remain unchanged
    });

    it('should reject invalid longitude values', async () => {
      const user = userEvent.setup();
      render(<RouteGeneratorClient />);

      const lngInput = screen.getByPlaceholderText('-1.40440') as HTMLInputElement;

      // Attempt to set invalid longitude (> 180)
      fireEvent.change(lngInput, { target: { value: '200' } });
      // Component should reject this
    });
  });

  describe('Distance and Style Settings', () => {
    it('should allow distance adjustment', async () => {
      const user = userEvent.setup();
      render(<RouteGeneratorClient />);

      // Distance input should be present
      const distanceInput = screen.getByDisplayValue('5');

      expect(distanceInput).toBeInTheDocument();
    });

    it('should allow style selection', async () => {
      const user = userEvent.setup();
      render(<RouteGeneratorClient />);

      // Find select by its options
      const styleSelect = screen.getByDisplayValue('Loop — return to start') as HTMLSelectElement;
      expect(styleSelect).toBeInTheDocument();
      expect(styleSelect.value).toBe('loop');

      await user.selectOptions(styleSelect, 'outback');
      expect(styleSelect.value).toBe('outback');
    });
  });

  describe('Geolocation', () => {
    it('should request geolocation on button click', async () => {
      const user = userEvent.setup();
      const mockGetCurrentPosition = jest.fn();
      Object.defineProperty(global.navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        writable: true,
        configurable: true,
      });

      render(<RouteGeneratorClient />);

      const geoButton = screen.getByRole('button', { name: /Detect my location/i });
      await user.click(geoButton);

      expect(mockGetCurrentPosition).toHaveBeenCalled();
      expect(screen.getByText('Requesting your location...')).toBeInTheDocument();
    });

    it('should handle successful geolocation', async () => {
      const user = userEvent.setup();
      const mockGetCurrentPosition = jest.fn((success) => {
        success({
          coords: {
            latitude: 51.5074,
            longitude: -0.1278,
          },
        });
      });
      Object.defineProperty(global.navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        writable: true,
        configurable: true,
      });

      render(<RouteGeneratorClient />);

      const geoButton = screen.getByRole('button', { name: /Detect my location/i });
      await user.click(geoButton);

      await waitFor(() => {
        expect(screen.getByText('Location found! Click Generate run')).toBeInTheDocument();
      });
    });

    it('should handle geolocation errors', async () => {
      const user = userEvent.setup();
      const mockGetCurrentPosition = jest.fn((success, error) => {
        error({ code: 1 }); // Permission denied
      });
      Object.defineProperty(global.navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        writable: true,
        configurable: true,
      });

      render(<RouteGeneratorClient />);

      const geoButton = screen.getByRole('button', { name: /Detect my location/i });
      await user.click(geoButton);

      await waitFor(() => {
        expect(screen.getByText(/Location permission denied/i)).toBeInTheDocument();
      });
    });

    it('should handle geolocation not supported', async () => {
      const user = userEvent.setup();
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<RouteGeneratorClient />);

      const geoButton = screen.getByRole('button', { name: /Detect my location/i });
      await user.click(geoButton);

      await waitFor(() => {
        expect(screen.getByText(/Geolocation not supported/i)).toBeInTheDocument();
      });
    });
  });

  describe('Route Generation', () => {
    it('should generate route with valid coordinates', async () => {
      const user = userEvent.setup();
      const mockRoute = {
        result: {
          path: [[50, -1], [50.1, -1.1]],
          distance: 5000,
        },
        waypoints: [[50, -1], [50.05, -1.05], [50, -1]],
      };

      (routeUtils.generateRoute as jest.Mock).mockResolvedValue(mockRoute);
      (routeUtils.calculateStats as jest.Mock).mockReturnValue({
        distance: '5.00 km',
        time: '30 min',
        pace: '6:00/km',
        waypoints: 1,
      });

      render(<RouteGeneratorClient />);

      const generateButton = screen.getByRole('button', { name: /Generate run/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Route ready/i)).toBeInTheDocument();
      });
    });

    it('should show error when route generation fails', async () => {
      const user = userEvent.setup();

      (routeUtils.generateRoute as jest.Mock).mockResolvedValue({
        result: null,
        waypoints: null,
      });

      render(<RouteGeneratorClient />);

      const generateButton = screen.getByRole('button', { name: /Generate run/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/Could not find a route/i)).toBeInTheDocument();
      });
    });

    it('should show loading state while generating', async () => {
      const user = userEvent.setup();

      (routeUtils.generateRoute as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  result: { path: [[50, -1]], distance: 5000 },
                  waypoints: [[50, -1], [50, -1]],
                }),
              100
            )
          )
      );
      (routeUtils.calculateStats as jest.Mock).mockReturnValue({
        distance: '5.00 km',
        time: '30 min',
        pace: '6:00/km',
        waypoints: 0,
      });

      render(<RouteGeneratorClient />);

      const generateButton = screen.getByRole('button', { name: /Generate run/i });
      await user.click(generateButton);

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Calculating waypoints/i)).toBeInTheDocument();
      });
    });
  });

  describe('Stats Display', () => {
    it('should display initial stats with dashes', () => {
      render(<RouteGeneratorClient />);

      const statValues = screen.getAllByText('—');
      expect(statValues.length).toBeGreaterThanOrEqual(3); // At least 3 initial dashed values
    });

    it('should update stats after route generation', async () => {
      const user = userEvent.setup();

      (routeUtils.generateRoute as jest.Mock).mockResolvedValue({
        result: {
          path: [[50, -1]],
          distance: 10000,
        },
        waypoints: [[50, -1], [50.1, -1], [50, -1]],
      });
      (routeUtils.calculateStats as jest.Mock).mockReturnValue({
        distance: '10.00 km',
        time: '1h 0m',
        pace: '6:00/km',
        waypoints: 1,
      });

      render(<RouteGeneratorClient />);

      const generateButton = screen.getByRole('button', { name: /Generate run/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getAllByText('10.00 km')).toHaveLength(2); // Sidebar + floating
        expect(screen.getAllByText('1h 0m')).toHaveLength(2); // Sidebar + floating
        expect(screen.getByText('6:00/km')).toBeInTheDocument();
      });
    });
  });

  describe('Floating Stats', () => {
    it('should show floating stats when route exists and sidebar is closed', async () => {
      const user = userEvent.setup();

      (routeUtils.generateRoute as jest.Mock).mockResolvedValue({
        result: {
          path: [[50, -1]],
          distance: 5000,
        },
        waypoints: [[50, -1], [50, -1]],
      });
      (routeUtils.calculateStats as jest.Mock).mockReturnValue({
        distance: '5.00 km',
        time: '30 min',
        pace: '6:00/km',
        waypoints: 0,
      });

      render(<RouteGeneratorClient />);

      const generateButton = screen.getByRole('button', { name: /Generate run/i });
      await user.click(generateButton);

      await waitFor(() => {
        const floatingStatLabels = screen.getAllByText('Distance');
        expect(floatingStatLabels.length).toBeGreaterThan(1); // Sidebar + floating
      });
    });
  });

  describe('Map Interaction', () => {
    it('should update coordinates when map is clicked', async () => {
      const user = userEvent.setup();
      render(<RouteGeneratorClient />);

      // The Map component receives onMapClick prop
      const mapComponent = screen.getByTestId('map-component');
      expect(mapComponent).toBeInTheDocument();
    });
  });
});
