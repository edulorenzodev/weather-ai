import { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { City } from '../types';

const IoniconsIcon = require('@expo/vector-icons').Ionicons;

interface SearchResultItemProps {
  city: City;
  onPress: (city: City) => void;
}

const SearchResultItemComponent = ({ city, onPress }: SearchResultItemProps) => {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(city)}
    >
      <IoniconsIcon name="location-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
      <View style={styles.textContainer}>
        <Text style={styles.cityName}>{city.name}</Text>
        <Text style={styles.country}>{city.country}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textContainer: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  country: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});

export const SearchResultItem = memo(SearchResultItemComponent);