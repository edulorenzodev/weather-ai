import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { LinearGradient } from 'expo-linear-gradient';

const IoniconsIcon = require('@expo/vector-icons').Ionicons;

import { SearchBar } from '../src/components/SearchBar';
import { SearchResultItem } from '../src/components/SearchResultItem';
import { CityItem } from '../src/components/CityItem';
import { useCitiesStore, City } from '../src/store/citiesStore';

export const options = { headerShown: false };

export default function ManageCitiesScreen() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    cities, 
    activeCity, 
    addCity, 
    removeCity, 
    reorderCities,
    setActiveCity,
  } = useCitiesStore();

  const handleAddCity = useCallback((city: City) => {
    addCity(city);
    setSearchResults([]);
  }, [addCity]);

  const handleDeleteCity = useCallback((index: number) => {
    removeCity(index);
  }, [removeCity]);

  const handleDragEnd = useCallback(({ from, to }: { from: number; to: number }) => {
    if (from !== to) {
      reorderCities(from, to);
    }
  }, [reorderCities]);

  const renderCityItem = useCallback(({ item, drag, isActive }: RenderItemParams<City>) => {
    const isCityActive = activeCity && 
      activeCity.name === item.name && 
      activeCity.country === item.country;
    const index = cities.findIndex(
      c => c.name === item.name && c.country === item.country
    );
    
    return (
      <ScaleDecorator>
        <CityItem
          city={item}
          isActive={isCityActive || false}
          drag={drag}
          onDelete={() => handleDeleteCity(index)}
        />
      </ScaleDecorator>
    );
  }, [cities, activeCity, handleDeleteCity]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient colors={['#1e3a5f', '#0d1b2a']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <IoniconsIcon 
              name="arrow-back" 
              size={24} 
              color="white" 
              onPress={() => router.back()} 
            />
            <Text style={styles.title}>Gestionar Ciudades</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchContainer}>
            <SearchBar 
              onResults={setSearchResults}
              onLoading={setIsSearching}
              placeholder="Buscar ciudades del mundo..."
            />
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Resultados</Text>
              <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
                {searchResults.map((city, index) => (
                  <SearchResultItem
                    key={`${city.name}-${city.country}-${index}`}
                    city={city}
                    onPress={handleAddCity}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {searchResults.length === 0 && !isSearching && (
            <View style={styles.citiesContainer}>
              <Text style={styles.sectionTitle}>
                Ciudades guardadas ({cities.length}/10)
              </Text>
              
              {cities.length === 0 ? (
                <View style={styles.emptyState}>
                  <IoniconsIcon name="location-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyText}>
                    Busca una ciudad para comenzar
                  </Text>
                </View>
              ) : (
                <DraggableFlatList
                  data={cities}
                  renderItem={renderCityItem}
                  keyExtractor={(item, index) => `${item.name}-${item.country}-${index}`}
                  onDragEnd={handleDragEnd}
                  contentContainerStyle={styles.listContent}
                />
              )}
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  resultsList: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  citiesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 16,
  },
});