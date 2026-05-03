import axios, { CancelTokenSource } from 'axios';
import { WeatherData, ForecastItem } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'demo_key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

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
