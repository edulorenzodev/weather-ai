import { memo, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, ScrollView } from 'react-native';
import { ForecastItem } from '../types';
import { useSettingsStore, convertTemperature, convertWindSpeed } from '../store/settingsStore';

const Ionicons = require('@expo/vector-icons').Ionicons;

const getWeatherIcon = (main: string): string => {
  const icons: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Snow: '❄️',
    Thunderstorm: '⛈️',
    Drizzle: '🌦️',
  };
  return icons[main] || '🌤️';
};

const getWindSpeed = (speed: number, windSpeedUnit: string): string => {
  const converted = Math.round(convertWindSpeed(speed * 3.6, windSpeedUnit as any));
  const unit = windSpeedUnit === 'kmh' ? 'km/h' : 'mph';
  return `${converted} ${unit}`;
};

const getHourFromTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', hour12: false });
};

const formatHour = (index: number): string => {
  if (index === 0) return 'Ahora';
  const date = new Date();
  date.setHours(date.getHours() + index);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', hour12: false });
};

interface HourItemProps {
  item: ForecastItem;
  index: number;
}

const HourItem = ({ item, index }: HourItemProps) => {
  const { temperatureUnit, windSpeedUnit } = useSettingsStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 15,
        stiffness: 120,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.hourItem, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.hourTemp}>{Math.round(convertTemperature(item.main.temp, temperatureUnit))}°</Text>
      <Text style={styles.hourIcon}>{getWeatherIcon(item.weather[0].main)}</Text>
      <Text style={styles.hourWind}>{getWindSpeed(item.wind?.speed || 0, windSpeedUnit)}</Text>
      <Text style={styles.hourTime}>{formatHour(index)}</Text>
    </Animated.View>
  );
};

interface HourlyForecastProps {
  forecast: ForecastItem[];
}

const HourlyForecastComponent = ({ forecast }: HourlyForecastProps) => {
  const hourlyData = useMemo(() => forecast.slice(0, 8), [forecast]);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!hourlyData || hourlyData.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
        <View style={styles.header}>
          <Ionicons name="time-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.headerText}>Próximas horas</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hoursContainer}
        >
          {hourlyData.map((item, index) => (
            <HourItem key={item.dt} item={item} index={index} />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hoursContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 16,
  },
  hourItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  hourTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  hourIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  hourWind: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  hourTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export const HourlyForecast = memo(HourlyForecastComponent);