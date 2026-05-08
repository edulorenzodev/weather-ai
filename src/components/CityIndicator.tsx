import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useCitiesStore } from '../store/citiesStore';

interface DotProps {
  index: number;
  isActive: boolean;
}

const Dot = ({ isActive }: DotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isActive ? 1.4 : 1, { damping: 15, stiffness: 200 }) }],
      opacity: withSpring(isActive ? 1 : 0.5, { damping: 15, stiffness: 200 }),
    };
  });

  return (
    <Animated.View style={[styles.dot, animatedStyle]} />
  );
};

const CityIndicatorComponent = () => {
  const { cities, activeCity } = useCitiesStore();

  if (cities.length <= 1) {
    return null;
  }

  const activeIndex = activeCity
    ? cities.findIndex(c => c.name === activeCity.name && c.country === activeCity.country)
    : 0;

  return (
    <View style={styles.container}>
      {cities.map((_, index) => (
        <Dot key={index} index={index} isActive={index === activeIndex} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
});

export const CityIndicator = memo(CityIndicatorComponent);