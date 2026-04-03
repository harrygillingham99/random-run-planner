import { renderHook, act } from '@testing-library/react';
import { useCoordinateInputs } from '../useCoordinateInputs';

const makeEvent = (value: string) => ({ target: { value } }) as React.ChangeEvent<HTMLInputElement>;

describe('useCoordinateInputs', () => {
  const defaults = {
    lat: 50.9097,
    lng: -1.4044,
    distance: 5,
    onLatChange: jest.fn(),
    onLngChange: jest.fn(),
    onDistanceChange: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  describe('initial state', () => {
    it('initialises raw values from props', () => {
      const { result } = renderHook(() => useCoordinateInputs(defaults));
      expect(result.current.latRaw).toBe('50.9097');
      expect(result.current.lngRaw).toBe('-1.4044');
      expect(result.current.distanceRaw).toBe('5');
    });
  });

  describe('syncing with external prop changes', () => {
    it('updates latRaw when lat prop changes', () => {
      const props = { ...defaults };
      const { result, rerender } = renderHook((p) => useCoordinateInputs(p), {
        initialProps: props,
      });
      rerender({ ...props, lat: 51.5074 });
      expect(result.current.latRaw).toBe('51.5074');
    });

    it('updates lngRaw when lng prop changes', () => {
      const props = { ...defaults };
      const { result, rerender } = renderHook((p) => useCoordinateInputs(p), {
        initialProps: props,
      });
      rerender({ ...props, lng: -0.1276 });
      expect(result.current.lngRaw).toBe('-0.1276');
    });

    it('updates distanceRaw when distance prop changes', () => {
      const props = { ...defaults };
      const { result, rerender } = renderHook((p) => useCoordinateInputs(p), {
        initialProps: props,
      });
      rerender({ ...props, distance: 10 });
      expect(result.current.distanceRaw).toBe('10');
    });
  });

  describe('handleLatChange', () => {
    it('updates latRaw and calls onLatChange for valid input', () => {
      const onLatChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLatChange }));
      act(() => {
        result.current.handleLatChange(makeEvent('51.5074'));
      });
      expect(result.current.latRaw).toBe('51.5074');
      expect(onLatChange).toHaveBeenCalledWith(51.5074);
    });

    it('updates latRaw but does not call onLatChange for partial input', () => {
      const onLatChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLatChange }));
      act(() => {
        result.current.handleLatChange(makeEvent('51.'));
      });
      expect(result.current.latRaw).toBe('51.');
      expect(onLatChange).not.toHaveBeenCalled();
    });

    it('does not call onLatChange when value exceeds 90', () => {
      const onLatChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLatChange }));
      act(() => {
        result.current.handleLatChange(makeEvent('91'));
      });
      expect(onLatChange).not.toHaveBeenCalled();
    });

    it('does not call onLatChange when value is below -90', () => {
      const onLatChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLatChange }));
      act(() => {
        result.current.handleLatChange(makeEvent('-91'));
      });
      expect(onLatChange).not.toHaveBeenCalled();
    });

    it('accepts comma as decimal separator', () => {
      const onLatChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLatChange }));
      act(() => {
        result.current.handleLatChange(makeEvent('51,5'));
      });
      expect(onLatChange).toHaveBeenCalledWith(51.5);
    });

    it('does not call onLatChange for empty input', () => {
      const onLatChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLatChange }));
      act(() => {
        result.current.handleLatChange(makeEvent(''));
      });
      expect(onLatChange).not.toHaveBeenCalled();
    });
  });

  describe('handleLngChange', () => {
    it('updates lngRaw and calls onLngChange for valid input', () => {
      const onLngChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLngChange }));
      act(() => {
        result.current.handleLngChange(makeEvent('-0.1276'));
      });
      expect(result.current.lngRaw).toBe('-0.1276');
      expect(onLngChange).toHaveBeenCalledWith(-0.1276);
    });

    it('does not call onLngChange when value exceeds 180', () => {
      const onLngChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLngChange }));
      act(() => {
        result.current.handleLngChange(makeEvent('181'));
      });
      expect(onLngChange).not.toHaveBeenCalled();
    });

    it('does not call onLngChange when value is below -180', () => {
      const onLngChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onLngChange }));
      act(() => {
        result.current.handleLngChange(makeEvent('-181'));
      });
      expect(onLngChange).not.toHaveBeenCalled();
    });
  });

  describe('handleDistanceChange', () => {
    it('updates distanceRaw and calls onDistanceChange for valid input', () => {
      const onDistanceChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onDistanceChange }));
      act(() => {
        result.current.handleDistanceChange(makeEvent('10'));
      });
      expect(result.current.distanceRaw).toBe('10');
      expect(onDistanceChange).toHaveBeenCalledWith(10);
    });

    it('clamps distance to minimum of 1', () => {
      const onDistanceChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onDistanceChange }));
      act(() => {
        result.current.handleDistanceChange(makeEvent('0.1'));
      });
      expect(onDistanceChange).toHaveBeenCalledWith(1);
    });

    it('clamps distance to maximum of 30', () => {
      const onDistanceChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onDistanceChange }));
      act(() => {
        result.current.handleDistanceChange(makeEvent('50'));
      });
      expect(onDistanceChange).toHaveBeenCalledWith(30);
    });

    it('does not call onDistanceChange for partial input', () => {
      const onDistanceChange = jest.fn();
      const { result } = renderHook(() => useCoordinateInputs({ ...defaults, onDistanceChange }));
      act(() => {
        result.current.handleDistanceChange(makeEvent('5.'));
      });
      expect(onDistanceChange).not.toHaveBeenCalled();
    });
  });
});
