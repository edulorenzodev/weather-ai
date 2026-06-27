const weatherDescriptions: Record<string, string> = {
  'clear sky': 'cielo despejado',
  'few clouds': 'pocas nubes',
  'scattered clouds': 'nubes dispersas',
  'broken clouds': 'nubes fragmentadas',
  'overcast clouds': 'nublado',
  'light rain': 'lluvia ligera',
  'moderate rain': 'lluvia moderada',
  'heavy intensity rain': 'lluvia intensa',
  'very heavy rain': 'lluvia muy fuerte',
  'extreme rain': 'lluvia extrema',
  'light snow': 'nieve ligera',
  'moderate snow': 'nieve moderada',
  'heavy snow': 'nieve intensa',
  'sleet': 'aguanieve',
  'light shower': 'chubasco ligero',
  'shower rain': 'chubasco',
  'thunderstorm': 'tormenta',
  'thunderstorm with light rain': 'tormenta con lluvia ligera',
  'thunderstorm with rain': 'tormenta con lluvia',
  'thunderstorm with heavy rain': 'tormenta con lluvia intensa',
  'mist': 'neblina',
  'fog': 'niebla',
  'haze': 'bruma',
  'dust': 'polvo',
  'sand': 'arena',
  'volcanic ash': 'ceniza volcánica',
  'squalls': 'chubascos',
  'tornado': 'tornado',
};

export const getSpanishDescription = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  return weatherDescriptions[lowerDesc] || description;
};
