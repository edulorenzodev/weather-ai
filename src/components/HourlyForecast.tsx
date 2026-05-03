import { memo, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { ForecastItem } from '../types';

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

const getHourFromTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', hour12: false });
};

interface HourItemProps {
  item: ForecastItem;
  index: number;
}

const HourItem = ({ item, index }: HourItemProps) => {
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
      <Text style={styles.hourTime}>{getHourFromTimestamp(item.dt)}</Text>
      <Text style={styles.hourIcon}>{getWeatherIcon(item.weather[0].main)}</Text>
      <Text style={styles.hourTemp}>{Math.round(item.main.temp)}°</Text>
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
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🕐</Text>
        <Text style={styles.headerText}>Próximas horas</Text>
      </View>

      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
        <View style={styles.hoursContainer}>
          {hourlyData.map((item, index) => (
            <HourItem key={item.dt} item={item} index={index} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourItem: {
    alignItems: 'center',
    flex: 1,
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
  hourTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export const HourlyForecast = memo(HourlyForecastComponent);