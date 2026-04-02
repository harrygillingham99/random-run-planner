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

export const useGeolocation = (
  onSuccess?: (result: GeolocationResult) => void,
  onError?: (error: GeolocationError) => void,
  options: UseGeolocationOptions = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GeolocationResult | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      const notSupportedError: GeolocationError = {
        code: 0,
        message: 'Geolocation is not supported by this browser',
      };
      setError(notSupportedError);
      onError?.(notSupportedError);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutMs = options.timeout ?? 8000;
    const maximumAge = options.maximumAge ?? 60000;
    const enableHighAccuracy = options.enableHighAccuracy ?? false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result: GeolocationResult = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setData(result);
        setIsLoading(false);
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
        setError(errorObj);
        setIsLoading(false);
        onError?.(errorObj);
      },
      {
        timeout: timeoutMs,
        maximumAge,
        enableHighAccuracy,
      }
    );
  }, [onSuccess, onError, options.timeout, options.maximumAge, options.enableHighAccuracy]);

  return {
    data,
    error,
    isLoading,
    requestGeolocation,
  };
};
