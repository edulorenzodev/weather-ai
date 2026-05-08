export interface WeatherData {
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  sys?: {
    sunrise: number;
    sunset: number;
  };
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    main: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

export interface Place {
  fsq_place_id: string;
  name: string;
  categories: Array<{
    fsq_category_id?: string;
    id?: number;
    name: string;
    icon?: {
      prefix: string;
      suffix: string;
    };
  }>;
  distance?: number;
  latitude: number;
  longitude: number;
  location: {
    address?: string;
    formatted_address?: string;
    locality?: string;
    country?: string;
  };
  timezone?: string;
}

export interface AIRecommendation {
  activity: 'beach' | 'mountain' | 'home';
  title: string;
  description: string;
  icon: string;
  reason: string;
}

export interface City {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}
