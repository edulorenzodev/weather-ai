import { memo, useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { searchCities } from '../services/weatherService';
import { City } from '../types';

const IoniconsIcon = require('@expo/vector-icons').Ionicons;

interface SearchBarProps {
  onResults: (results: City[]) => void;
  onLoading?: (loading: boolean) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBarComponent = ({
  onResults,
  onLoading,
  placeholder = 'Buscar ciudad...',
  debounceMs = 300,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      onResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      onLoading?.(true);
      
      try {
        const results = await searchCities(query);
        onResults(results);
      } catch (error) {
        console.error('Search error:', error);
        onResults([]);
      } finally {
        setLoading(false);
        onLoading?.(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onResults, onLoading]);

  const handleClear = useCallback(() => {
    setQuery('');
    onResults([]);
  }, [onResults]);

  return (
    <View style={styles.container}>
      <IoniconsIcon name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {query.length > 0 && (
        <IoniconsIcon 
          name="close-circle" 
          size={20} 
          color="rgba(255, 255, 255, 0.5)" 
          style={styles.clearIcon}
          onPress={handleClear}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    height: '100%',
    ...Platform.select({
      ios: {
        paddingVertical: 0,
      },
    }),
  },
  clearIcon: {
    marginLeft: 8,
  },
});

export const SearchBar = memo(SearchBarComponent);