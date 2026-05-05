import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore, TemperatureUnit, WindSpeedUnit } from '../src/store/settingsStore';

const IoniconsIcon = require('@expo/vector-icons').Ionicons;

export const options = { headerShown: false };

export default function SettingsScreen() {
  const router = useRouter();
  const { temperatureUnit, windSpeedUnit, setTemperatureUnit, setWindSpeedUnit } = useSettingsStore();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e3a5f', '#0d1b2a']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <IoniconsIcon 
              name="arrow-back" 
              size={24} 
              color="white" 
              onPress={() => router.back()} 
            />
            <Text style={styles.title}>Ajustes</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Unidades</Text>
              
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Temperatura</Text>
                <View style={styles.toggleGroup}>
                  <Pressable 
                    style={[styles.toggleButton, temperatureUnit === 'celsius' && styles.toggleActive]}
                    onPress={() => setTemperatureUnit('celsius')}
                  >
                    <Text style={[styles.toggleText, temperatureUnit === 'celsius' && styles.toggleTextActive]}>
                      °C
                    </Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.toggleButton, temperatureUnit === 'fahrenheit' && styles.toggleActive]}
                    onPress={() => setTemperatureUnit('fahrenheit')}
                  >
                    <Text style={[styles.toggleText, temperatureUnit === 'fahrenheit' && styles.toggleTextActive]}>
                      °F
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Velocidad del viento</Text>
                <View style={styles.toggleGroup}>
                  <Pressable 
                    style={[styles.toggleButton, windSpeedUnit === 'kmh' && styles.toggleActive]}
                    onPress={() => setWindSpeedUnit('kmh')}
                  >
                    <Text style={[styles.toggleText, windSpeedUnit === 'kmh' && styles.toggleTextActive]}>
                      km/h
                    </Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.toggleButton, windSpeedUnit === 'mph' && styles.toggleActive]}
                    onPress={() => setWindSpeedUnit('mph')}
                  >
                    <Text style={[styles.toggleText, windSpeedUnit === 'mph' && styles.toggleTextActive]}>
                      mph
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionLabel: {
    fontSize: 16,
    color: 'white',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: '#60a5fa',
  },
  toggleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: 'white',
  },
});