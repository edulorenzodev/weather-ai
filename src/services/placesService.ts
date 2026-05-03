import axios from 'axios';
import { Place } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;
const BASE_URL = 'https://places-api.foursquare.com';

const BEACH_CATEGORY_IDS = ["52e81612bcbc57f1066b7a0d", "4bf58dd8d48988d1e2941735", "52e81612bcbc57f1066b7a30", 13005, 16003, 16029];
const NATURE_CATEGORY_IDS = [
  '4eb1d4d54b900d56c88a45fc', '4eb1d4dd4b900d56c88a45fd',
  '4bf58dd8d48988d159941735', '52e81612bcbc57f1066b7a21',
  '52e81612bcbc57f1066b7a13', 16000
];

const hasRelevantCategory = (place: Place, categoryIds: (number | string)[]): boolean => {
  const placeCategoryIds = place.categories?.map(c => getCategoryId(c)) || [];
  const targetIds = categoryIds.map(id => String(id));
  return targetIds.some(id => placeCategoryIds.includes(id));
};

const getCategoryId = (cat: any): string => {
  return String(cat.fsq_category_id || cat.id || '');
};

export const searchPlaces = async (
  lat: number,
  lon: number,
  categoryIds: (number | string)[],
  searchQuery: string
): Promise<Place[]> => {
  if (!API_KEY || API_KEY === 'demo_key' || API_KEY === 'YOUR_FOURSQUARE_API_KEY') {
    console.warn('Foursquare API key not configured');
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/places/search`, {
      params: {
        ll: `${lat},${lon}`,
        query: searchQuery,
        limit: 10,
        sort: 'DISTANCE',
      },
      headers: {
        'X-Places-Api-Version': '2025-06-17',
        accept: 'application/json',
        authorization: `Bearer ${API_KEY}`,
      },
      timeout: 15000,
    });

    let results: Place[] = response.data?.results || [];

    console.log('Raw results count:', results.length);
    if (results.length > 0) {
      console.log('Sample categories:', JSON.stringify(results[0].categories));
    }

    results = results.filter((place: Place) => hasRelevantCategory(place, categoryIds));

    console.log(`Found ${results.length} filtered results for "${searchQuery}"`);

    return results.slice(0, 5);
  } catch (error: any) {
    console.error('Places error:', error.message);
    return [];
  }
};

export const searchBeaches = (lat: number, lon: number) =>
  searchPlaces(lat, lon, BEACH_CATEGORY_IDS, 'beach');

export const searchMountains = (lat: number, lon: number) =>
  searchPlaces(lat, lon, NATURE_CATEGORY_IDS, 'Mountain');
