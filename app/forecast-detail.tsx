import { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ForecastItem } from '../src/types';
import { useSettingsStore, convertTemperature } from '../src/store/settingsStore';
import { getWeatherIconFromTimestamp } from '../src/utils/weatherIcons';

const Ionicons = require('@expo/vector-icons').Ionicons;

const { width } = Dimensions.get('window');

const getFullDayName = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

const getShortDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

const getDateString = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${months[date.getMonth()]}`;
};

const ForecastSlide = ({ item, index, scrollX }: {
  item: ForecastItem;
  index: number;
  scrollX: Animated.Value;
}) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const temperatureUnit = useSettingsStore((state) => state.temperatureUnit);

  return (
    <Animated.View style={[styles.slide, { transform: [{ scale }], opacity }]}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayName}>
          {index === 0 ? 'Hoy' : getFullDayName(item.dt)}
        </Text>
        <Text style={styles.dateString}>{getDateString(item.dt)}</Text>
      </View>

      <View style={styles.iconContainer}>
        <Text style={styles.weatherIcon}>
          {getWeatherIconFromTimestamp(item.weather[0].main, item.dt)}
        </Text>
        <Text style={styles.weatherDescription}>
          {item.weather[0].main}
        </Text>
      </View>

      <View style={styles.tempSection}>
        <Text style={styles.tempHigh}>
          {Math.round(convertTemperature(item.main.temp_max, temperatureUnit))}°
        </Text>
        <Text style={styles.tempLow}>
          {Math.round(convertTemperature(item.main.temp_min, temperatureUnit))}°
        </Text>
      </View>

      <View style={styles.windSection}>
        <Ionicons name="speedometer-outline" size={16} color="rgba(255,255,255,0.6)" />
        <Text style={styles.windText}>
          {Math.round(item.wind.speed * 3.6)} km/h
        </Text>
      </View>
    </Animated.View>
  );
};

export default function ForecastDetail() {
  const { forecast } = useLocalSearchParams<{ forecast: string }>();
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const parsedForecast = useMemo(() => {
    if (!forecast) return [];
    try {
      return JSON.parse(forecast) as ForecastItem[];
    } catch {
      return [];
    }
  }, [forecast]);

  const dailyForecast = useMemo(() => parsedForecast.slice(0, 5), [parsedForecast]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="chevron-back" 
          size={24} 
          color="white" 
          onPress={() => router.back()}
        />
        <Text style={styles.title}>Previsión para 5 días</Text>
        <View style={{ width: 24 }} />
      </View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {dailyForecast.map((item, index) => (
          <ForecastSlide
            key={item.dt}
            item={item}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
        {dailyForecast.map((_, index) => (
          <AnimatedDot key={index} index={index} scrollX={scrollX} />
        ))}
      </View>
    </View>
  );
}

const AnimatedDot = ({ index, scrollX }: { index: number; scrollX: Animated.Value }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  
  const dotScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1.2, 0.6],
    extrapolate: 'clamp',
  });

  const dotOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { transform: [{ scale: dotScale }], opacity: dotOpacity }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  slide: {
    width: width - 40,
    height: 400,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 24,
    marginRight: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayHeader: {
    alignItems: 'center',
  },
  dayName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  dateString: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 72,
  },
  weatherDescription: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  tempSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  tempHigh: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  tempLow: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.5)',
  },
  windSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  windText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
});