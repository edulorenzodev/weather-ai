import { memo, useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type WeatherCondition = 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle' | 'Mist' | 'Fog' | 'Haze' | 'Unknown';

interface WeatherBackgroundProps {
  condition: WeatherCondition;
  isNight?: boolean;
}

const getBackgroundColors = (condition: WeatherCondition, isNight: boolean): string[] => {
  if (isNight) {
    return ['#0d1b2a', '#1b263b', '#415a77'];
  }

  switch (condition) {
    case 'Clear':
      return ['#4facfe', '#00f2fe'];
    case 'Clouds':
      return ['#667eea', '#764ba2'];
    case 'Rain':
    case 'Drizzle':
      return ['#3a4a5c', '#2c3e50'];
    case 'Snow':
      return ['#e6d9f2', '#c5d0e8'];
    case 'Thunderstorm':
      return ['#2c3e50', '#1a252f'];
    case 'Mist':
    case 'Fog':
    case 'Haze':
      return ['#8e9eab', '#eef2f3'];
    default:
      return ['#4facfe', '#00f2fe'];
  }
};

const SunnyBackground = () => {
  const sunScale = useRef(new Animated.Value(0)).current;
  const sunOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(sunScale, {
        toValue: 1,
        damping: 12,
        stiffness: 80,
        useNativeDriver: true,
      }),
      Animated.timing(sunOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.sunContainer, { transform: [{ scale: sunScale }], opacity: sunOpacity }]}>
      <View style={styles.sun} />
    </Animated.View>
  );
};

const CloudyBackground = () => {
  const cloudOpacity = useRef(new Animated.Value(0)).current;
  const cloudTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cloudOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cloudTranslate, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.cloudContainer, { opacity: cloudOpacity, transform: [{ translateY: cloudTranslate }] }]}>
      <View style={styles.cloud} />
      <View style={[styles.cloud, styles.cloudSmall]} />
    </Animated.View>
  );
};

const StormyBackground = () => {
  const lightningOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(lightningOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]).start(animate);
    };
    animate();
  }, []);

  return (
    <Animated.View style={[styles.stormContainer, { opacity: lightningOpacity }]}>
      <Text style={styles.lightning}>⚡</Text>
    </Animated.View>
  );
};

const WeatherBackgroundComponent = ({ condition, isNight = false }: WeatherBackgroundProps) => {
  const colors = getBackgroundColors(condition, isNight);

  const renderWeatherElement = () => {
    if (isNight) return null;

    switch (condition) {
      case 'Clear':
        return <SunnyBackground />;
      case 'Clouds':
        return <CloudyBackground />;
      case 'Thunderstorm':
        return <StormyBackground />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {renderWeatherElement()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  sunContainer: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  cloudContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 80,
  },
  cloud: {
    position: 'absolute',
    width: 100,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 50,
    top: 20,
    left: 40,
  },
  cloudSmall: {
    width: 70,
    height: 30,
    top: 40,
    left: 20,
  },
  stormContainer: {
    position: 'absolute',
    top: 30,
    right: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightning: {
    fontSize: 50,
  },
});

export const WeatherBackground = memo(WeatherBackgroundComponent);