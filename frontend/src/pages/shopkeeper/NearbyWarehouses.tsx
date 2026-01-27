import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { warehouseService } from '@/services/warehouseService';
import { Warehouse, Location } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

type LocationState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export default function NearbyWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setLocationState('unavailable');
      setLocationError('Geolocation is not supported by your browser');
      // Fetch warehouses without location
      fetchWarehousesWithoutLocation();
    }
  }, []);

  const requestLocationPermission = () => {
    setLocationState('requesting');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationState('granted');
        // Fetch warehouses with user location
        fetchWarehouses(location);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Showing all warehouses.';
            setLocationState('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Showing all warehouses.';
            setLocationState('unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Showing all warehouses.';
            setLocationState('unavailable');
            break;
        }

        setLocationError(errorMessage);
        // Fetch warehouses without location as fallback
        fetchWarehousesWithoutLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const fetchWarehouses = async (location: Location) => {
    setLoading(true);
    try {
      const data = await warehouseService.getNearbyWarehouses(location);
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch nearby warehouses:', error);
      setLocationError('Failed to fetch warehouses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehousesWithoutLocation = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getNearbyWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      setLocationError('Failed to fetch warehouses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Nearby Warehouses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find warehouses near your location
        </Typography>
      </Box>

      {/* Location Permission Section */}
      {locationState === 'idle' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Typography>
              Enable location access to see warehouses sorted by distance from you
            </Typography>
            <Button
              variant="contained"
              startIcon={<MyLocationIcon />}
              onClick={requestLocationPermission}
            >
              Enable Location
            </Button>
          </Box>
        </Alert>
      )}

      {locationState === 'requesting' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography>Requesting location permission...</Typography>
        </Alert>
      )}

      {locationState === 'granted' && userLocation && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Typography>
              📍 Location enabled: Showing warehouses near you
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)}
            </Typography>
          </Box>
        </Alert>
      )}

      {locationError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Typography>{locationError}</Typography>
            {(locationState === 'denied' || locationState === 'unavailable') && (
              <Button
                size="small"
                startIcon={<LocationOnIcon />}
                onClick={requestLocationPermission}
              >
                Try Again
              </Button>
            )}
          </Box>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner message="Loading warehouses..." />
        </Box>
      )}

      {/* Warehouses Grid */}
      {!loading && warehouses.length === 0 ? (
        <EmptyState
          message="No warehouses found nearby"
          action={
            locationState === 'idle' ? (
              <Button
                variant="contained"
                startIcon={<MyLocationIcon />}
                onClick={requestLocationPermission}
              >
                Enable Location to Find Warehouses
              </Button>
            ) : undefined
          }
        />
      ) : !loading ? (
        <>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Found {warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''}
              {locationState === 'granted' ? ' near you' : ''}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {warehouses.map((warehouse) => (
              <Grid item xs={12} sm={6} md={4} key={warehouse.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" gutterBottom>
                        {warehouse.name}
                      </Typography>
                      <Chip
                        label={warehouse.is_active ? 'Active' : 'Inactive'}
                        color={warehouse.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📍 {warehouse.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📞 {warehouse.contact_number}
                    </Typography>
                    {warehouse.distance_km && (
                      <Box mt={2}>
                        <Chip
                          icon={<LocationOnIcon />}
                          label={`${warehouse.distance_km.toFixed(1)} km away`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : null}
    </Container>
  );
}
