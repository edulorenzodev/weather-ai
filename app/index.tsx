import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  PanResponder,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWeather } from '../src/hooks/useWeather';
import { usePlaces } from '../src/hooks/usePlaces';
import { useAIRecommendation } from '../src/hooks/useAIRecommendation';
import { useCitiesStore } from '../src/store/citiesStore';
import { useSettingsStore, convertTemperature, convertWindSpeed } from '../src/store/settingsStore';
import { Header } from '../src/components/Header';
import { ShareMenu } from '../src/components/ShareMenu';
import { CityIndicator } from '../src/components/CityIndicator';
import { WeatherBackground, WeatherCondition } from '../src/components/WeatherBackground';
import { ForecastList } from '../src/components/ForecastList';
import { HourlyForecast } from '../src/components/HourlyForecast';
import { PlacesList } from '../src/components/PlacesList';
import { AIRecommendationCard } from '../src/components/AIRecommendationCard';
import { getSpanishDescription } from '../src/utils/translations';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { ErrorScreen } from '../src/components/ErrorScreen';

export default function Home() {
  const { weather, forecast, hourlyForecast, loading, error, refetch } = useWeather();
  const { activeCity, cities, goToNextCity, goToPreviousCity } = useCitiesStore();
  const { temperatureUnit, windSpeedUnit } = useSettingsStore();
  const { recommendation, loading: aiLoading, getRecommendation } = useAIRecommendation();
  const { beaches, mountains, loading: placesLoading, refetch: refetchPlaces } = usePlaces(
    weather?.coord.lat,
    weather?.coord.lon
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareMenuVisible, setShareMenuVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSwipeTime = useRef(0);
  const scrollY = useSharedValue(0);
  const rotateX = useSharedValue(0);
  const currentCityIndexRef = useRef(0);

  const fadeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 120],
      [1, 0.15],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateX.value}deg` }
      ]
    };
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 10,
      onPanResponderRelease: (_, gs) => {
        const now = Date.now();
        if (now - lastSwipeTime.current < 300) return;

        const SWIPE_THRESHOLD = 50;
        const currentCities = useCitiesStore.getState().cities;
        const currentIndex = currentCityIndexRef.current;
        const isFirstCity = currentIndex <= 0;
        const isLastCity = currentIndex >= currentCities.length - 1;

        if (gs.dx > SWIPE_THRESHOLD) {
          if (isLastCity) {
            rotateX.value = 15;
            rotateX.value = withSpring(0, { damping: 15, stiffness: 200 });
          } else {
            rotateX.value = -90;
            rotateX.value = withSpring(0, { damping: 12, stiffness: 80 });
            goToNextCity();
          }
          lastSwipeTime.current = now;
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          if (isFirstCity) {
            rotateX.value = -15;
            rotateX.value = withSpring(0, { damping: 15, stiffness: 200 });
          } else {
            rotateX.value = 90;
            rotateX.value = withSpring(0, { damping: 12, stiffness: 80 });
            goToPreviousCity();
          }
          lastSwipeTime.current = now;
        }
      },
    })
  ).current;

  const fetchAIRecommendation = useCallback(() => {
    if (weather && beaches && mountains) {
      getRecommendation(weather, beaches, mountains);
    }
  }, [weather, beaches, mountains, getRecommendation]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchAIRecommendation();
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [fetchAIRecommendation]);

  useEffect(() => {
    if (cities.length > 0) {
      const index = activeCity 
        ? cities.findIndex(
            c => c.name === activeCity.name && c.country === activeCity.country
          )
        : 0;
      currentCityIndexRef.current = index >= 0 ? index : 0;
    }
  }, [activeCity, cities]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    await refetchPlaces();
    setIsRefreshing(false);
  }, [refetch, refetchPlaces]);

  const hasData = weather !== null;

  if (loading && !hasData) {
    return <LoadingScreen />;
  }

  if ((error || !weather) && !hasData) {
    return <ErrorScreen error={error || ''} onRetry={refetch} />;
  }

  const weatherCondition = (weather.weather[0]?.main || 'Clear') as WeatherCondition;
  const now = Math.floor(Date.now() / 1000);
  const isNight = weather.sys?.sunrise && weather.sys?.sunset 
    ? now < weather.sys.sunrise || now >= weather.sys.sunset 
    : false;

  const handleMenuPress = () => {
    setShareMenuVisible(true);
  };

  const tempSymbol = temperatureUnit === 'celsius' ? '°C' : '°F';
  const weatherShareText = weather
    ? `El clima en ${activeCity?.name || weather.name} es de ${Math.round(convertTemperature(weather.main.temp, temperatureUnit))}${tempSymbol} - ${getSpanishDescription(weather.weather[0]?.description || '')}`
    : '';

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <WeatherBackground condition={weatherCondition} isNight={isNight} />
      <SafeAreaView style={styles.safeArea}>
        <Header cityName={activeCity?.name || weather?.name || ''} onMenuPress={handleMenuPress} />
        <CityIndicator />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={(event) => {
            scrollY.value = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#60a5fa"
              colors={['#60a5fa']}
              progressBackgroundColor="rgba(255,255,255,0.1)"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.mainTempContainer, fadeOverlayStyle, rotateStyle]}>
            <View style={styles.tempRow}>
              <Text style={styles.mainTemp}>{Math.round(convertTemperature(weather.main.temp, temperatureUnit))}</Text>
              <Text style={styles.tempUnit}>{tempSymbol}</Text>
            </View>
            <Text style={styles.conditionMaxMin}>
              {getSpanishDescription(weather.weather[0]?.description || '')} {Math.round(convertTemperature(weather.main.temp_max, temperatureUnit))}° {Math.round(convertTemperature(weather.main.temp_min, temperatureUnit))}°
            </Text>
            <Text style={styles.feelsLike}>Sensación térmica {Math.round(convertTemperature(weather.main.feels_like, temperatureUnit))}°</Text>
          </Animated.View>

          <HourlyForecast forecast={hourlyForecast} />
          <AIRecommendationCard recommendation={recommendation} loading={aiLoading} />
          <ForecastList forecast={forecast} />
          <PlacesList beaches={beaches} mountains={mountains} />
        </ScrollView>
      </SafeAreaView>
      <ShareMenu
        visible={shareMenuVisible}
        onClose={() => setShareMenuVisible(false)}
        weatherText={weatherShareText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainTempContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainTemp: {
    fontSize: 120,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: -8,
    lineHeight: 120,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -8,
  },
  tempUnit: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    marginTop: 8,
    marginLeft: 3,
  },
  conditionMaxMin: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  feelsLike: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
