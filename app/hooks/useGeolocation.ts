import { useState, useCallback } from 'react';

interface GeolocationResult {
  latitude: number;
  longitude: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface UseGeolocationOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

interface GeolocationState {
  isLoading: boolean;
  data: GeolocationResult | null;
  error: GeolocationError | null;
}

const INITIAL_STATE: GeolocationState = { isLoading: false, data: null, error: null };

export const useGeolocation = (
  onSuccess?: (result: GeolocationResult) => void,
  onError?: (error: GeolocationError) => void,
  options: UseGeolocationOptions = {},
) => {
  const [state, setState] = useState<GeolocationState>(INITIAL_STATE);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      const notSupportedError: GeolocationError = {
        code: 0,
        message: 'Geolocation is not supported by this browser',
      };
      setState({ isLoading: false, data: null, error: notSupportedError });
      onError?.(notSupportedError);
      return;
    }

    setState({ isLoading: true, data: null, error: null });

    const timeoutMs = options.timeout ?? 8000;
    const maximumAge = options.maximumAge ?? 60000;
    const enableHighAccuracy = options.enableHighAccuracy ?? false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result: GeolocationResult = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setState({ isLoading: false, data: result, error: null });
        onSuccess?.(result);
      },
      (err) => {
        const errorMessageMap: { [key: number]: string } = {
          1: 'Location permission denied',
          2: 'Position information is unavailable',
          3: 'Request timed out',
        };
        const errorObj: GeolocationError = {
          code: err.code,
          message: errorMessageMap[err.code] || 'Unknown geolocation error',
        };
        setState({ isLoading: false, data: null, error: errorObj });
        onError?.(errorObj);
      },
      {
        timeout: timeoutMs,
        maximumAge,
        enableHighAccuracy,
      },
    );
  }, [onSuccess, onError, options.timeout, options.maximumAge, options.enableHighAccuracy]);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    requestGeolocation,
  };
};
