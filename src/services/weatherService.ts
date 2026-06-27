import axios from 'axios';
import { WeatherData, ForecastItem, City } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'demo_key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export const searchCities = async (
  query: string,
  limit: number = 10,
  signal?: AbortSignal
): Promise<City[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const response = await axios.get(`${GEO_URL}/direct`, {
    params: {
      q: query.trim(),
      limit,
      appid: API_KEY,
    },
    signal,
  });
  
  return response.data.map((item: { name?: string; state?: string; country?: string; country_code?: string; lat?: number; lon?: number }) => ({
    name: item.name || '',
    state: item.state || undefined,
    country: item.country || item.country_code || '',
    lat: item.lat || 0,
    lon: item.lon || 0,
  }));
};

export const getCurrentWeather = async (
  lat: number, 
  lon: number, 
  signal?: AbortSignal
): Promise<WeatherData> => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
    signal,
  });
  return response.data;
};

export const getForecast = async (
  lat: number, 
  lon: number, 
  signal?: AbortSignal
): Promise<{ list: ForecastItem[] }> => {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
    signal,
  });
  return response.data;
};
