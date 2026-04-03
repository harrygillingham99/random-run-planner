import { renderHook, act, waitFor } from '@testing-library/react';
import { useRunPlannerState } from 'hooks/useRunPlannerState';
import * as routeUtils from 'lib/routeUtils';

jest.mock('lib/routeUtils', () => ({
  generateRoute: jest.fn(),
  calculateStats: jest.fn(),
}));

jest.mock('hooks/useGeolocation', () => ({
  useGeolocation: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    requestGeolocation: jest.fn(),
  })),
}));

describe('useRunPlannerState hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: jest.fn() },
      writable: true,
      configurable: true,
    });
  });

  describe('initial state', () => {
    it('should return correct initial values', () => {
      const { result } = renderHook(() => useRunPlannerState());

      expect(result.current.lat).toBe(50.9097);
      expect(result.current.lng).toBe(-1.4044);
      expect(result.current.distance).toBe(5);
      expect(result.current.style).toBe('loop');
      expect(result.current.hasValidCoordinates).toBe(true);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.sidebarOpen).toBe(false);
      expect(result.current.status).toEqual({ message: 'Set a start point to begin', type: '' });
      expect(result.current.routeData).toEqual({ route: null, waypoints: null });
      expect(result.current.stats.distance).toBe('—');
      expect(result.current.stats.time).toBe('—');
    });
  });

  describe('onMapClick', () => {
    it('should update coordinates, set status, and close sidebar', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.setSidebarOpen(true);
      });

      act(() => {
        result.current.onMapClick(51.5074, -0.1278);
      });

      expect(result.current.lat).toBe(51.5074);
      expect(result.current.lng).toBe(-0.1278);
      expect(result.current.status).toEqual({
        message: 'Start point set — click Generate run!',
        type: 'ok',
      });
      expect(result.current.sidebarOpen).toBe(false);
    });
  });

  describe('onLocationFound', () => {
    it('should update coordinates and set status', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onLocationFound(48.8566, 2.3522);
      });

      expect(result.current.lat).toBe(48.8566);
      expect(result.current.lng).toBe(2.3522);
      expect(result.current.status).toEqual({
        message: 'Your location found! Ready to generate routes.',
        type: 'ok',
      });
    });
  });

  describe('onLocationError', () => {
    it('should set a neutral status message', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onLocationError('Permission denied');
      });

      expect(result.current.status).toEqual({
        message: 'Ready to generate routes. Click the map to set your location.',
        type: '',
      });
    });
  });

  describe('onGeoLocation', () => {
    it('should set requesting status', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onGeoLocation();
      });

      expect(result.current.status).toEqual({
        message: 'Requesting your location...',
        type: '',
      });
    });
  });

  describe('onLatChange', () => {
    it('should update lat and set status when valid', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onLatChange(51.5074);
      });

      expect(result.current.lat).toBe(51.5074);
      expect(result.current.status).toEqual({
        message: 'Start point set — click Generate run!',
        type: 'ok',
      });
    });

    it('should update lat but not change status when NaN', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onLatChange(NaN);
      });

      // Status should remain the initial message — no "start point set" for invalid input
      expect(result.current.status.message).toBe('Set a start point to begin');
    });
  });

  describe('onLngChange', () => {
    it('should update lng and set status when valid', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onLngChange(-0.1278);
      });

      expect(result.current.lng).toBe(-0.1278);
      expect(result.current.status).toEqual({
        message: 'Start point set — click Generate run!',
        type: 'ok',
      });
    });

    it('should update lng but not change status when NaN', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onLngChange(NaN);
      });

      expect(result.current.status.message).toBe('Set a start point to begin');
    });
  });

  describe('setSidebarOpen', () => {
    it('should toggle sidebar state', () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.setSidebarOpen(true);
      });
      expect(result.current.sidebarOpen).toBe(true);

      act(() => {
        result.current.setSidebarOpen(false);
      });
      expect(result.current.sidebarOpen).toBe(false);
    });
  });

  describe('onGenerateRoute', () => {
    it('should set error status when coordinates are invalid', async () => {
      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onLatChange(NaN);
      });

      await act(async () => {
        await result.current.onGenerateRoute();
      });

      expect(result.current.status).toEqual({
        message: 'Please set a start point first',
        type: 'err',
      });
      expect(routeUtils.generateRoute).not.toHaveBeenCalled();
    });

    it('should set error status when route generation returns null', async () => {
      (routeUtils.generateRoute as jest.Mock).mockResolvedValue({ result: null, waypoints: null });

      const { result } = renderHook(() => useRunPlannerState());

      await act(async () => {
        await result.current.onGenerateRoute();
      });

      expect(result.current.status).toEqual({
        message: 'Could not find a route — try different coordinates or a shorter distance',
        type: 'err',
      });
      expect(result.current.isGenerating).toBe(false);
    });

    it('should populate routeData and stats on success', async () => {
      const mockPath: [number, number][] = [
        [50, -1],
        [50.1, -1.1],
        [50.2, -1.2],
      ];
      const mockWaypoints: [number, number][] = [
        [50, -1],
        [50.1, -1.1],
        [50.2, -1.2],
      ];

      (routeUtils.generateRoute as jest.Mock).mockResolvedValue({
        result: { path: mockPath, distance: 5000 },
        waypoints: mockWaypoints,
      });
      (routeUtils.calculateStats as jest.Mock).mockReturnValue({
        distance: '5.00 km',
        time: '30 min',
        pace: '6:00/km',
      });

      const { result } = renderHook(() => useRunPlannerState());

      await act(async () => {
        await result.current.onGenerateRoute();
      });

      await waitFor(() => {
        expect(result.current.status).toEqual({
          message: 'Route ready! Hit Generate again for a different route.',
          type: 'ok',
        });
      });

      expect(result.current.routeData.route).toEqual(mockPath);
      // display waypoints strip first and last
      expect(result.current.routeData.waypoints).toEqual([mockWaypoints[1]]);
      expect(result.current.stats.distance).toBe('5.00 km');
      expect(result.current.stats.time).toBe('30 min');
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.sidebarOpen).toBe(false);
    });

    it('should set isGenerating true during generation and false after', async () => {
      let resolveRoute!: (v: unknown) => void;
      (routeUtils.generateRoute as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveRoute = resolve;
        }),
      );

      const { result } = renderHook(() => useRunPlannerState());

      act(() => {
        result.current.onGenerateRoute();
      });

      await waitFor(() => expect(result.current.isGenerating).toBe(true));

      await act(async () => {
        resolveRoute({ result: null, waypoints: null });
      });

      await waitFor(() => expect(result.current.isGenerating).toBe(false));
    });

    it('should clear previous routeData when starting new generation', async () => {
      const mockPath: [number, number][] = [
        [50, -1],
        [50.1, -1.1],
        [50.2, -1.2],
      ];
      (routeUtils.generateRoute as jest.Mock).mockResolvedValue({
        result: { path: mockPath, distance: 5000 },
        waypoints: mockPath,
      });
      (routeUtils.calculateStats as jest.Mock).mockReturnValue({
        distance: '5.00 km',
        time: '30 min',
        pace: '6:00/km',
      });

      const { result } = renderHook(() => useRunPlannerState());

      // First generation
      await act(async () => {
        await result.current.onGenerateRoute();
      });
      expect(result.current.routeData.route).not.toBeNull();

      // Second generation fails — route should be cleared during loading
      (routeUtils.generateRoute as jest.Mock).mockResolvedValue({ result: null, waypoints: null });

      await act(async () => {
        await result.current.onGenerateRoute();
      });

      expect(result.current.routeData.route).toBeNull();
    });
  });
});
