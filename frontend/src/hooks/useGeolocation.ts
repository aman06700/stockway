import { useState, useEffect } from 'react';
import { Location } from '@/types';

interface GeolocationState {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = (watch: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      });
      return;
    }

    setState({ ...state, isLoading: true });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState({
          location: null,
          error: errorMessage,
          isLoading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (watch) {
      requestLocation();
    }
  }, [watch]);

  return {
    ...state,
    requestLocation,
  };
};
