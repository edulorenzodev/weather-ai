import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWeather } from '../src/hooks/useWeather';
import { usePlaces } from '../src/hooks/usePlaces';
import { useAIRecommendation } from '../src/hooks/useAIRecommendation';
import { useCitiesStore } from '../src/store/citiesStore';
import { Header } from '../src/components/Header';
import { ShareMenu } from '../src/components/ShareMenu';
import { WeatherBackground, WeatherCondition } from '../src/components/WeatherBackground';
import { ForecastList } from '../src/components/ForecastList';
import { HourlyForecast } from '../src/components/HourlyForecast';
import { PlacesList } from '../src/components/PlacesList';
import { AIRecommendationCard } from '../src/components/AIRecommendationCard';

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

const LoadingScreen = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={['#1e3a5f', '#0d1b2a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Animated.View style={[styles.loadingIcon, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.loadingEmoji}>🌤️</Text>
          </Animated.View>
          <Text style={styles.loadingTitle}>WeatherAI</Text>
          <Text style={styles.loadingSubtitle}>Cargando datos del clima...</Text>
          <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 32 }} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const ErrorScreen = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient colors={['#1e3a5f', '#0d1b2a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorEmoji}>⚠️</Text>
          </View>
          <Text style={styles.errorTitle}>No se pudo cargar</Text>
          <Text style={styles.errorMessage}>
            {error || 'Verifica tu conexión e intenta de nuevo'}
          </Text>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable style={styles.retryButton} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onRetry}>
              <Text style={styles.retryText}>Intentar de nuevo</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default function Home() {
  const { weather, forecast, hourlyForecast, loading, error, refetch } = useWeather();
  const { activeCity } = useCitiesStore();
  const { recommendation, loading: aiLoading, getRecommendation } = useAIRecommendation();
  const { beaches, mountains, loading: placesLoading, refetch: refetchPlaces } = usePlaces(
    weather?.coord.lat,
    weather?.coord.lon
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareMenuVisible, setShareMenuVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    await refetchPlaces();
    setIsRefreshing(false);
  }, [refetch, refetchPlaces]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !weather) {
    return <ErrorScreen error={error || ''} onRetry={refetch} />;
  }

  const weatherCondition = (weather.weather[0]?.main || 'Clear') as WeatherCondition;

  const handleAddCity = () => {
    console.log('Add city pressed');
  };

  const handleMenuPress = () => {
    setShareMenuVisible(true);
  };

  const weatherShareText = weather
    ? `El clima en ${activeCity?.name || weather.name} es de ${Math.round(weather.main.temp)}°C - ${getSpanishDescription(weather.weather[0]?.description || '')}`
    : '';

  return (
    <View style={styles.container}>
      <WeatherBackground condition={weatherCondition} />
      <SafeAreaView style={styles.safeArea}>
        <Header cityName={activeCity?.name || weather?.name || ''} onMenuPress={handleMenuPress} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
          <View style={styles.mainTempContainer}>
            <View style={styles.tempRow}>
              <Text style={styles.mainTemp}>{Math.round(weather.main.temp)}</Text>
              <Text style={styles.tempUnit}>°C</Text>
            </View>
            <Text style={styles.conditionMaxMin}>
              {getSpanishDescription(weather.weather[0]?.description || '')} {Math.round(weather.main.temp_max)}° {Math.round(weather.main.temp_min)}°
            </Text>
            <Text style={styles.feelsLike}>Sensación térmica {Math.round(weather.main.feels_like)}°</Text>
          </View>

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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingEmoji: {
    fontSize: 36,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorEmoji: {
    fontSize: 28,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
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
  retryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#60a5fa',
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
  loadingPlaces: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingPlacesText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
