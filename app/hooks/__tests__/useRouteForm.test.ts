import { renderHook, act } from '@testing-library/react';
import { useRouteForm } from 'hooks/useRouteForm';

describe('useRouteForm hook', () => {
  describe('initial state', () => {
    it('should return default values when no options provided', () => {
      const { result } = renderHook(() => useRouteForm());

      expect(result.current.lat).toBe(50.9097);
      expect(result.current.lng).toBe(-1.4044);
      expect(result.current.distance).toBe(5);
      expect(result.current.style).toBe('loop');
      expect(result.current.hasValidCoordinates).toBe(true);
    });

    it('should use provided initial values', () => {
      const { result } = renderHook(() =>
        useRouteForm({
          initialLat: 51.5,
          initialLng: -0.1,
          initialDistance: 10,
          initialStyle: 'outback',
        }),
      );

      expect(result.current.lat).toBe(51.5);
      expect(result.current.lng).toBe(-0.1);
      expect(result.current.distance).toBe(10);
      expect(result.current.style).toBe('outback');
    });
  });

  describe('setCoordinates', () => {
    it('should update lat and lng atomically', () => {
      const { result } = renderHook(() => useRouteForm());

      act(() => {
        result.current.setCoordinates(48.8566, 2.3522);
      });

      expect(result.current.lat).toBe(48.8566);
      expect(result.current.lng).toBe(2.3522);
    });
  });

  describe('updateLat', () => {
    it('should update lat and return true when both coords are valid', () => {
      const { result } = renderHook(() => useRouteForm());
      let isValid: boolean;

      act(() => {
        isValid = result.current.updateLat(51.5074);
      });

      expect(result.current.lat).toBe(51.5074);
      expect(isValid!).toBe(true);
    });

    it('should update lat and return false when new value is NaN', () => {
      const { result } = renderHook(() => useRouteForm());
      let isValid: boolean;

      act(() => {
        isValid = result.current.updateLat(NaN);
      });

      expect(isValid!).toBe(false);
    });
  });

  describe('updateLng', () => {
    it('should update lng and return true when both coords are valid', () => {
      const { result } = renderHook(() => useRouteForm());
      let isValid: boolean;

      act(() => {
        isValid = result.current.updateLng(-0.1278);
      });

      expect(result.current.lng).toBe(-0.1278);
      expect(isValid!).toBe(true);
    });

    it('should update lng and return false when new value is NaN', () => {
      const { result } = renderHook(() => useRouteForm());
      let isValid: boolean;

      act(() => {
        isValid = result.current.updateLng(NaN);
      });

      expect(isValid!).toBe(false);
    });
  });

  describe('setDistance', () => {
    it('should update distance', () => {
      const { result } = renderHook(() => useRouteForm());

      act(() => {
        result.current.setDistance(12);
      });

      expect(result.current.distance).toBe(12);
    });
  });

  describe('setStyle', () => {
    it('should update style to outback', () => {
      const { result } = renderHook(() => useRouteForm());

      act(() => {
        result.current.setStyle('outback');
      });

      expect(result.current.style).toBe('outback');
    });

    it('should update style back to loop', () => {
      const { result } = renderHook(() => useRouteForm({ initialStyle: 'outback' }));

      act(() => {
        result.current.setStyle('loop');
      });

      expect(result.current.style).toBe('loop');
    });
  });

  describe('hasValidCoordinates', () => {
    it('should be true when coords are valid numbers', () => {
      const { result } = renderHook(() => useRouteForm());

      expect(result.current.hasValidCoordinates).toBe(true);
    });

    it('should be false after lat is set to NaN', () => {
      const { result } = renderHook(() => useRouteForm());

      act(() => {
        result.current.updateLat(NaN);
      });

      expect(result.current.hasValidCoordinates).toBe(false);
    });

    it('should be false after lng is set to NaN', () => {
      const { result } = renderHook(() => useRouteForm());

      act(() => {
        result.current.updateLng(NaN);
      });

      expect(result.current.hasValidCoordinates).toBe(false);
    });

    it('should become true again after valid coords are set', () => {
      const { result } = renderHook(() => useRouteForm());

      act(() => {
        result.current.updateLat(NaN);
      });
      expect(result.current.hasValidCoordinates).toBe(false);

      act(() => {
        result.current.setCoordinates(51.5, -0.1);
      });
      expect(result.current.hasValidCoordinates).toBe(true);
    });
  });
});
