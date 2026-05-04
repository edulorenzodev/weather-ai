import { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { City } from '../types';

const IoniconsIcon = require('@expo/vector-icons').Ionicons;

interface CityItemProps {
  city: City;
  isActive: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  drag?: () => void;
  isActiveAnim?: Animated.AnimatedInterpolation<number>;
}

const CityItemComponent = ({ 
  city, 
  isActive, 
  onPress, 
  onDelete,
  drag,
  isActiveAnim,
}: CityItemProps) => {
  return (
    <Pressable 
      onPress={onPress}
      onLongPress={drag}
    >
      <Animated.View style={[
        styles.container,
        isActive && styles.activeContainer,
        isActiveAnim ? { transform: [{ scale: isActiveAnim }] } : undefined,
      ]}>
        <View style={styles.dragHandle}>
          <IoniconsIcon name="menu" size={20} color="rgba(255, 255, 255, 0.4)" />
        </View>
        
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.cityName}>{city.name}</Text>
              {isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Activa</Text>
                </View>
              )}
            </View>
            <Text style={styles.country}>{city.country}</Text>
          </View>
          
          {onDelete && (
            <Pressable onPress={onDelete} hitSlop={8}>
              <IoniconsIcon name="trash-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
            </Pressable>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeContainer: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  dragHandle: {
    paddingRight: 12,
    paddingLeft: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  activeBadge: {
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#60a5fa',
  },
  country: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
});

export const CityItem = memo(CityItemComponent);