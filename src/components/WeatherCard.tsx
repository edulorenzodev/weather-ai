import { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { WeatherData } from '../types';

const getWeatherIcon = (main: string): string => {
  const icons: Record<string, string> = {
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
  return icons[main] || '🌤️';
};

const getSpanishCondition = (condition: string): string => {
  const translations: Record<string, string> = {
    Clear: 'Despejado',
    Clouds: 'Nublado',
    Rain: 'Lluvia',
    Snow: 'Nieve',
    Thunderstorm: 'Tormenta',
    Drizzle: 'Llovizna',
    Mist: 'Neblina',
    Fog: 'Niebla',
    Haze: 'Bruma',
  };
  return translations[condition] || condition;
};

const getSpanishDescription = (description: string): string => {
  const translations: Record<string, string> = {
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
  const lowerDesc = description.toLowerCase();
  return translations[lowerDesc] || description;
};

const MetricItem = ({ metric, index }: { metric: { icon: string; value: string | number; unit: string; label: string; color: string }; index: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: 400 + index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        delay: 400 + index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.metric, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.metricIcon, { backgroundColor: metric.color }]}>
        <Text style={styles.metricEmoji}>{metric.icon}</Text>
      </View>
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={styles.metricValue}>{metric.value}</Text>
      <Text style={styles.metricUnit}>{metric.unit}</Text>
    </Animated.View>
  );
};

const WeatherCardComponent = ({ weather }: { weather: WeatherData }) => {
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const tempScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(iconScale, {
          toValue: 1,
          damping: 10,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(tempScale, {
          toValue: 1,
          damping: 10,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const temp = Math.round(weather.main.temp);
  const feelsLike = Math.round(weather.main.feels_like);
  const humidity = weather.main.humidity;
  const windSpeed = Math.round(weather.wind.speed * 3.6);
  const visibility = (weather.visibility / 1000).toFixed(1);
  const pressure = weather.main.pressure;
  const condition = weather.weather[0].main;

  const metrics = [
    { icon: '💨', value: windSpeed, unit: 'km/h', label: 'Viento', color: 'rgba(59, 130, 246, 0.2)' },
    { icon: '💧', value: humidity, unit: '%', label: 'Humedad', color: 'rgba(34, 211, 238, 0.2)' },
    { icon: '👁️', value: visibility, unit: 'km', label: 'Visibilidad', color: 'rgba(168, 139, 250, 0.2)' },
    { icon: '◉', value: pressure, unit: 'hPa', label: 'Presión', color: 'rgba(251, 146, 60, 0.2)' },
  ];

  return (
    <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationName}>{weather.name}</Text>
          </View>
          <Text style={styles.description}>{getSpanishDescription(weather.weather[0].description)}</Text>
        </View>
        <Animated.Text style={[styles.weatherIcon, { transform: [{ scale: iconScale }], opacity: iconScale }]}>
          {getWeatherIcon(condition)}
        </Animated.Text>
      </View>

      <View style={styles.tempContainer}>
        <Animated.View style={{ transform: [{ scale: tempScale }], opacity: tempScale }}>
          <Text style={styles.temp}>{temp}°</Text>
          <Text style={styles.feelsLike}>Sensación térmica {feelsLike}°</Text>
        </Animated.View>
        <Text style={styles.condition}>{getSpanishCondition(condition)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsContainer}>
        {metrics.map((metric, index) => (
          <MetricItem key={metric.label} metric={metric} index={index} />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  locationContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    fontSize: 18,
  },
  locationName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 26,
    textTransform: 'capitalize',
  },
  weatherIcon: {
    fontSize: 56,
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  temp: {
    fontSize: 80,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: -4,
  },
  feelsLike: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  condition: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricEmoji: {
    fontSize: 16,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  metricUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export const WeatherCard = memo(WeatherCardComponent);
