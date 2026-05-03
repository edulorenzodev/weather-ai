import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import { getCurrentWeather, getForecast } from '../services/weatherService';
import { WeatherData, ForecastItem } from '../types';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cancelTokenSourceRef = useRef(axios.CancelToken.source());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchWeather = useCallback(async () => {
    cancelTokenSourceRef.current.cancel('Cancelling previous request');
    cancelTokenSourceRef.current = axios.CancelToken.source();

    try {
      setLoading(true);
      setError(null);

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

      const { latitude, longitude } = location.coords;

      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(latitude, longitude, cancelTokenSourceRef.current.token),
        getForecast(latitude, longitude, cancelTokenSourceRef.current.token),
      ]);

      if (!isMountedRef.current) return;

      setWeather(weatherData);
      const dailyForecast = forecastData.list.filter((_, index) => index % 8 === 0);
      setForecast(dailyForecast.slice(0, 5));
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
    fetchWeather();
    return () => {
      cancelTokenSourceRef.current.cancel('Component unmounted');
    };
  }, [fetchWeather]);

  return { weather, forecast, loading, error, refetch: fetchWeather };
};
