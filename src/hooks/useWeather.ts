import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import { getCurrentWeather, getForecast } from '../services/weatherService';
import { WeatherData, ForecastItem } from '../types';
import { useCitiesStore } from '../store/citiesStore';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { activeCity } = useCitiesStore();
  
  const cancelTokenSourceRef = useRef(axios.CancelToken.source());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchWeather = useCallback(async (cityCoords?: { lat: number; lon: number }) => {
    cancelTokenSourceRef.current.cancel('Cancelling previous request');
    cancelTokenSourceRef.current = axios.CancelToken.source();

    try {
      setLoading(true);
      setError(null);

      let latitude: number;
      let longitude: number;

      if (cityCoords) {
        latitude = cityCoords.lat;
        longitude = cityCoords.lon;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!isMountedRef.current) return;
          setError('Permiso de ubicación denegado');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMountedRef.current) return;

        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      }

      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(latitude, longitude, cancelTokenSourceRef.current.token),
        getForecast(latitude, longitude, cancelTokenSourceRef.current.token),
      ]);

      if (!isMountedRef.current) return;

      setWeather(weatherData);
      const dailyForecast = forecastData.list.filter((_, index) => index % 8 === 0);
      setForecast(dailyForecast.slice(0, 5));
      setHourlyForecast(forecastData.list.slice(0, 8));
    } catch (err: any) {
      if (axios.isCancel(err)) {
        return;
      }
      console.error('Weather error:', err);
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Error al obtener datos del clima');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (activeCity) {
      fetchWeather({ lat: activeCity.lat, lon: activeCity.lon });
    } else {
      fetchWeather();
    }
    
    return () => {
      cancelTokenSourceRef.current.cancel('Component unmounted');
    };
  }, [activeCity, fetchWeather]);

  return { weather, forecast, hourlyForecast, loading, error, refetch: fetchWeather };
};
