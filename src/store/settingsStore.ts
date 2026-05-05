import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph';

interface SettingsState {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh',

      setTemperatureUnit: (unit: TemperatureUnit) => set({ temperatureUnit: unit }),
      setWindSpeedUnit: (unit: WindSpeedUnit) => set({ windSpeedUnit: unit }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const convertTemperature = (celsius: number, unit: TemperatureUnit): number => {
  if (unit === 'fahrenheit') {
    return (celsius * 9/5) + 32;
  }
  return celsius;
};

export const convertWindSpeed = (kmh: number, unit: WindSpeedUnit): number => {
  if (unit === 'mph') {
    return kmh * 0.621371;
  }
  return kmh;
};