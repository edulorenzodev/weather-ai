import axios, { CancelTokenSource } from 'axios';
import { AIRecommendation, WeatherData, Place } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'demo_key';

export const getAIRecommendation = async (
  weather: WeatherData,
  beaches: Place[],
  mountains: Place[],
  _cancelToken?: CancelTokenSource['token']
): Promise<AIRecommendation> => {
  const temp = weather.main.temp;
  const condition = weather.weather[0].main.toLowerCase();
  const humidity = weather.main.humidity;
  const cityName = weather.name;

  const isGoodWeather = condition === 'clear' || condition === 'clouds';
  const isWarm = temp >= 20;
  const isCold = temp < 10;
  const isRainy = condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm');
  const hasBeachesNearby = beaches.length > 0;
  const hasMountainsNearby = mountains.length > 0;

  if (isRainy || isCold) {
    return {
      activity: 'home',
      title: 'Día para quedarte en casa',
      description: `Hace ${Math.round(temp)}°C y ${condition === 'clear' ? 'despejado' : condition}. Perfecto para actividades indoor.`,
      icon: '🏠',
      reason: 'El clima no es ideal para actividades al aire libre. ¡Aprovecha para descansar!'
    };
  }

  if (isGoodWeather && isWarm && hasBeachesNearby) {
    return {
      activity: 'beach',
      title: '¡Día perfecto para la playa!',
      description: beaches[0].distance !== undefined
        ? `${beaches[0].name} está a ${Math.round(beaches[0].distance)}m. Disfruta del sol y el mar.`
        : `${beaches[0].name} te espera. Disfruta del sol y el mar.`,
      icon: '🏖️',
      reason: `Con ${Math.round(temp)}°C y buen tiempo, es ideal ir a la playa.`
    };
  }

  if (isGoodWeather && hasMountainsNearby) {
    return {
      activity: 'mountain',
      title: '¡Perfecto para una excursion!',
      description: mountains[0].distance !== undefined
        ? `${mountains[0].name} te espera a ${Math.round(mountains[0].distance)}m. Aire fresco y naturaleza.`
        : `${mountains[0].name} te espera. Aire fresco y naturaleza.`,
      icon: '⛰️',
      reason: `Con ${Math.round(temp)}°C, es ideal explorar la naturaleza.`
    };
  }

  if (isGoodWeather && !hasBeachesNearby && !hasMountainsNearby) {
    return {
      activity: 'home',
      title: 'Explora tu ciudad',
      description: `No hay lugares naturales muy cercanos, pero el clima en ${cityName} es perfecto para pasear.`,
      icon: '🚶',
      reason: `Aprovecha el buen clima (${Math.round(temp)}°C) para caminar por la ciudad.`
    };
  }

  return {
    activity: 'home',
    title: 'Mejor en casa',
    description: 'El clima no es óptimo para actividades al exterior.',
    icon: '☕',
    reason: 'Espera un mejor día para salir.'
  };
};

export const getAIRecommendationWithGPT = async (
  weather: WeatherData,
  beaches: Place[],
  mountains: Place[]
): Promise<AIRecommendation> => {
  const getPlaceDistance = (place: Place) => place.distance ? `${Math.round(place.distance)}m` : 'cercana';
  
  const prompt = `Based on this weather and location data:
  - Location: ${weather.name}
  - Temperature: ${weather.main.temp}°C
  - Feels like: ${weather.main.feels_like}°C
  - Condition: ${weather.weather[0].description}
  - Humidity: ${weather.main.humidity}%
  
  Nearby beaches: ${beaches.length > 0 ? beaches.slice(0, 3).map(b => `${b.name} (${getPlaceDistance(b)})`).join(', ') : 'None nearby'}
  Nearby mountains: ${mountains.length > 0 ? mountains.slice(0, 3).map(m => `${m.name} (${getPlaceDistance(m)})`).join(', ') : 'None nearby'}
  
  Respond ONLY with a valid JSON object like this (no markdown, no code blocks):
  {
    "activity": "beach" | "mountain" | "home",
    "title": "Short title in Spanish",
    "description": "Brief description in Spanish",
    "icon": "single emoji",
    "reason": "Why this is recommended in Spanish"
  }`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that recommends outdoor activities based on weather and nearby places. Always respond in Spanish.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.log('GPT API error, using fallback logic:', error);
    return getAIRecommendation(weather, beaches, mountains);
  }
};
