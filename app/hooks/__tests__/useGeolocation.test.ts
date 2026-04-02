import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeolocation } from '@/app/hooks/useGeolocation';

describe('useGeolocation hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null data and no error', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful geolocation', async () => {
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
      },
    };

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success(mockPosition);
      }),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useGeolocation(onSuccess));

    act(() => {
      result.current.requestGeolocation();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        latitude: 51.5074,
        longitude: -0.1278,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith({
      latitude: 51.5074,
      longitude: -0.1278,
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle geolocation permission denied error', async () => {
    const mockError = {
      code: 1,
      message: 'Permission denied',
    };

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error(mockError);
      }),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useGeolocation(undefined, onError));

    act(() => {
      result.current.requestGeolocation();
    });

    await waitFor(() => {
      expect(result.current.error).toEqual({
        code: 1,
        message: 'Location permission denied',
      });
    });

    expect(onError).toHaveBeenCalledWith({
      code: 1,
      message: 'Location permission denied',
    });
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle position unavailable error', async () => {
    const mockError = {
      code: 2,
      message: 'Position unavailable',
    };

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error(mockError);
      }),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useGeolocation(undefined, onError));

    act(() => {
      result.current.requestGeolocation();
    });

    await waitFor(() => {
      expect(result.current.error).toEqual({
        code: 2,
        message: 'Position information is unavailable',
      });
    });

    expect(onError).toHaveBeenCalledWith({
      code: 2,
      message: 'Position information is unavailable',
    });
  });

  it('should handle timeout error', async () => {
    const mockError = {
      code: 3,
      message: 'Request timed out',
    };

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error(mockError);
      }),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useGeolocation(undefined, onError));

    act(() => {
      result.current.requestGeolocation();
    });

    await waitFor(() => {
      expect(result.current.error).toEqual({
        code: 3,
        message: 'Request timed out',
      });
    });

    expect(onError).toHaveBeenCalledWith({
      code: 3,
      message: 'Request timed out',
    });
  });

  it('should handle geolocation not supported', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useGeolocation(undefined, onError));

    act(() => {
      result.current.requestGeolocation();
    });

    expect(result.current.error).toEqual({
      code: 0,
      message: 'Geolocation is not supported by this browser',
    });

    expect(onError).toHaveBeenCalledWith({
      code: 0,
      message: 'Geolocation is not supported by this browser',
    });
  });

  it('should accept custom options', async () => {
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
      },
    };

    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error, options) => {
        expect(options).toEqual({
          timeout: 5000,
          maximumAge: 30000,
          enableHighAccuracy: true,
        });
        success(mockPosition);
      }),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    const { result } = renderHook(() =>
      useGeolocation(undefined, undefined, {
        timeout: 5000,
        maximumAge: 30000,
        enableHighAccuracy: true,
      })
    );

    act(() => {
      result.current.requestGeolocation();
    });

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });

  it('should set loading state during request', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn(),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestGeolocation();
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };
      const successCallback = mockGeolocation.getCurrentPosition.mock.calls[0][0];
      successCallback(mockPosition);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
