import { memo, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { ForecastItem } from '../types';
import { useSettingsStore, convertTemperature } from '../store/settingsStore';
import { getWeatherIconFromTimestamp } from '../utils/weatherIcons';

const Ionicons = require('@expo/vector-icons').Ionicons;

const getDayName = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

const getShortDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

const ForecastRow = ({ item, index, isLast }: { 
  item: ForecastItem; 
  index: number; 
  isLast: boolean;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    const delay = 200 + index * 60;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.row, !isLast && styles.rowBorder, { opacity, transform: [{ translateX }] }]}>
      <View style={styles.dayContainer}>
        <Text style={styles.dayName}>
          {index === 0 ? 'Hoy' : getShortDay(item.dt)}
        </Text>
        <Text style={styles.dayFull}>
          {getDayName(item.dt).slice(0, 3)}
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <Text style={styles.weatherIcon}>{getWeatherIconFromTimestamp(item.weather[0].main, item.dt)}</Text>
      </View>

      <View style={styles.tempContainer}>
        <Text style={styles.tempHigh}>
          {Math.round(convertTemperature(item.main.temp_max, useSettingsStore.getState().temperatureUnit))}°
        </Text>
        <Text style={styles.tempLow}>
          {Math.round(convertTemperature(item.main.temp_min, useSettingsStore.getState().temperatureUnit))}°
        </Text>
      </View>
    </Animated.View>
  );
};

const ForecastListComponent = ({ forecast }: { forecast: ForecastItem[] }) => {
  const dailyForecast = useMemo(
    () => forecast.slice(0, 5),
    [forecast]
  );

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

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

  if (!dailyForecast || dailyForecast.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
        <View style={styles.header}>
          <Ionicons name="calendar-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.headerText}>Pronóstico semanal</Text>
        </View>
        {dailyForecast.map((item, index) => (
          <ForecastRow
            key={item.dt}
            item={item}
            index={index}
            isLast={index === dailyForecast.length - 1}
          />
        ))}
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
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayContainer: {
    width: 70,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dayFull: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 24,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 80,
    justifyContent: 'flex-end',
  },
  tempHigh: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tempLow: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    width: 35,
  },
});

export const ForecastList = memo(ForecastListComponent);
