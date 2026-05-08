const isDayTime = (timestamp: number, sunrise?: number, sunset?: number): boolean => {
  if (!sunrise || !sunset) return true;
  return timestamp >= sunrise && timestamp < sunset;
};

export const getWeatherIcon = (main: string, timestamp?: number, sunrise?: number, sunset?: number): string => {
  const isDay = timestamp ? isDayTime(timestamp, sunrise, sunset) : true;

  const dayIcons: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Snow: '❄️',
    Thunderstorm: '⛈️',
    Drizzle: '🌦️',
    Mist: '🌫️',
    Fog: '🌫️',
    Haze: '🌫️',
  };

  const nightIcons: Record<string, string> = {
    Clear: '🌙',
    Clouds: '☁️',
    Rain: '🌧️',
    Snow: '❄️',
    Thunderstorm: '⛈️',
    Drizzle: '🌦️',
    Mist: '🌫️',
    Fog: '🌫️',
    Haze: '🌫️',
  };

  return isDay ? (dayIcons[main] || '🌤️') : (nightIcons[main] || '🌤️');
};

export const getWeatherIconFromTimestamp = (
  main: string,
  timestamp: number,
  sunrise?: number,
  sunset?: number
): string => {
  return getWeatherIcon(main, timestamp, sunrise, sunset);
};