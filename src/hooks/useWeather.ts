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
  const initialLoadRef = useRef(true);
  const [error, setError] = useState<string | null>(null);

  const { activeCity } = useCitiesStore();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchWeather = useCallback(async (cityCoords?: { lat: number; lon: number }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (initialLoadRef.current) {
        setLoading(true);
      }
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

      const signal = abortControllerRef.current?.signal;
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(latitude, longitude, signal),
        getForecast(latitude, longitude, signal),
      ]);

      if (!isMountedRef.current) return;

      setWeather(weatherData);
      
      const dailyGroups: { [key: string]: ForecastItem[] } = {};
      forecastData.list.forEach((item: ForecastItem) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyGroups[date]) {
          dailyGroups[date] = [];
        }
        dailyGroups[date].push(item);
      });

      const dailyForecast = Object.values(dailyGroups).slice(0, 5).map((dayItems: ForecastItem[]) => {
        const dayItem = dayItems[Math.floor(dayItems.length / 2)]!;
        return {
          ...dayItem,
          main: {
            ...dayItem.main,
            temp_min: Math.min(...dayItems.map(i => i.main.temp_min)),
            temp_max: Math.max(...dayItems.map(i => i.main.temp_max)),
          },
        };
      });

      setForecast(dailyForecast);
      setHourlyForecast(forecastData.list.slice(0, 8));
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        return;
      }
      if ((err as { code?: string })?.code === 'ERR_CANCELED') return;
      console.error('Weather error:', err);
      if (isMountedRef.current) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Error al obtener datos del clima');
      }
    } finally {
      if (isMountedRef.current) {
        if (initialLoadRef.current) {
          setLoading(false);
          initialLoadRef.current = false;
        }
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [activeCity, fetchWeather]);

  return { weather, forecast, hourlyForecast, loading, error, refetch: fetchWeather };
};
