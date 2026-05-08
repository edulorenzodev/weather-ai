import { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const Ionicons = require('@expo/vector-icons').Ionicons;

interface HeaderProps {
  cityName: string;
  onMenuPress: () => void;
}

const AddButton = ({ onPress }: { onPress: () => void }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.addButton, animatedStyle]}>
        <Ionicons name="add" size={28} color="white" />
      </Animated.View>
    </Pressable>
  );
};

const MenuButton = ({ onPress }: { onPress: () => void }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.menuButton, animatedStyle]}>
        <Text style={styles.menuIcon}>⋮</Text>
      </Animated.View>
    </Pressable>
  );
};

const HeaderComponent = ({ cityName, onMenuPress }: HeaderProps) => {
  const router = useRouter();
  
  const handleAddPress = () => {
    router.push('/manage-cities');
  };

  return (
    <View style={styles.container}>
      <AddButton onPress={handleAddPress} />
      <View style={styles.titleContainer}>
        <Ionicons name="location-outline" size={24} color="white" style={styles.locationIcon} />
        <Text style={styles.title} numberOfLines={1}>{cityName}</Text>
      </View>
      <MenuButton onPress={onMenuPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  locationIcon: {
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export const Header = memo(HeaderComponent);