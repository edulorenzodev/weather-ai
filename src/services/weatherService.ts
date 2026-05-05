import axios, { CancelTokenSource } from 'axios';
import { WeatherData, ForecastItem, City } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'demo_key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export const searchCities = async (
  query: string,
  limit: number = 10,
  cancelToken?: CancelTokenSource['token']
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
    cancelToken,
  });
  
  return response.data.map((item: any) => ({
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
  cancelToken?: CancelTokenSource['token']
): Promise<WeatherData> => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
    cancelToken,
  });
  return response.data;
};

export const getForecast = async (
  lat: number, 
  lon: number, 
  cancelToken?: CancelTokenSource['token']
): Promise<{ list: ForecastItem[] }> => {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
    cancelToken,
  });
  return response.data;
};
