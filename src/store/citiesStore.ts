import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

export interface City {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

const storage = createMMKV({
  id: 'cities-storage',
});

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

interface CitiesState {
  cities: City[];
  activeCity: City | null;
  addCity: (city: City) => void;
  removeCity: (index: number) => void;
  reorderCities: (from: number, to: number) => void;
  setActiveCity: (city: City) => void;
  clearCities: () => void;
}

const MAX_CITIES = 10;

export const useCitiesStore = create<CitiesState>()(
  persist(
    (set, get) => ({
      cities: [],
      activeCity: null,

      addCity: (city: City) => {
        const { cities } = get();
        
        const cityCountry = city.country || '';
        
        const exists = cities.some(
          c => c.name.toLowerCase() === city.name.toLowerCase() && (c.country || '') === cityCountry
        );
        
        if (exists) return;
        
        if (cities.length >= MAX_CITIES) return;
        
        const newCities = [...cities, city];
        
        set({
          cities: newCities,
          activeCity: newCities[0],
        });
      },

      removeCity: (index: number) => {
        const { cities } = get();
        const newCities = cities.filter((_, i) => i !== index);
        
        const activeCity = get().activeCity;
        const removedCity = cities[index];
        
        let newActiveCity = activeCity;
        if (activeCity && removedCity) {
          const wasActive = activeCity.name === removedCity.name && activeCity.country === removedCity.country;
          if (wasActive && newCities.length > 0) {
            newActiveCity = newCities[0];
          } else if (wasActive) {
            newActiveCity = null;
          }
        }
        
        set({
          cities: newCities,
          activeCity: newActiveCity,
        });
      },

      reorderCities: (from: number, to: number) => {
        const { cities } = get();
        const newCities = [...cities];
        const [moved] = newCities.splice(from, 1);
        newCities.splice(to, 0, moved);
        
        set({
          cities: newCities,
          activeCity: newCities[0] || null,
        });
      },

      setActiveCity: (city: City) => {
        set({ activeCity: city });
      },

      clearCities: () => {
        set({ cities: [], activeCity: null });
      },
    }),
    {
      name: 'cities-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);