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
import { WeatherCard } from '../src/components/WeatherCard';
import { ForecastList } from '../src/components/ForecastList';
import { PlacesList } from '../src/components/PlacesList';
import { AIRecommendationCard } from '../src/components/AIRecommendationCard';

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

const RefreshButton = ({ onPress, isRefreshing }: { onPress: () => void; isRefreshing: boolean }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotationAnim.stopAnimation();
      rotationAnim.setValue(0);
    }
  }, [isRefreshing]);

  const handlePressIn = () => {
    if (!isRefreshing) {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!isRefreshing) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate: spin }] }}>
      <Pressable
        style={styles.refreshButton}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={isRefreshing}
      >
        <Text style={styles.refreshIcon}>↻</Text>
      </Pressable>
    </Animated.View>
  );
};

export default function Home() {
  const { weather, forecast, loading, error, refetch } = useWeather();
  const { recommendation, loading: aiLoading, getRecommendation } = useAIRecommendation();
  const { beaches, mountains, loading: placesLoading, refetch: refetchPlaces } = usePlaces(
    weather?.coord.lat,
    weather?.coord.lon
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <LinearGradient colors={['#1e3a5f', '#0d1b2a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Clima actual</Text>
            <Text style={styles.headerDate}>{currentDate}</Text>
          </View>
          <RefreshButton onPress={handleRefresh} isRefreshing={isRefreshing} />
        </View>

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
          <WeatherCard weather={weather} />
          <AIRecommendationCard recommendation={recommendation} loading={aiLoading} />
          <ForecastList forecast={forecast} />
          <PlacesList beaches={beaches} mountains={mountains} />

          {placesLoading && (
            <View style={styles.loadingPlaces}>
              <ActivityIndicator size="small" color="#60a5fa" />
              <Text style={styles.loadingPlacesText}>Buscando lugares...</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  refreshIcon: {
    fontSize: 18,
    color: '#ffffff',
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
