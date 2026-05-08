# WeatherAI 🌤️

Aplicación del tiempo con IA que te sugiere actividades basadas en el clima y lugares cercanos.

## Características

- **Clima en tiempo real** - Temperatura, humedad, viento y más
- **Pronóstico de 5 días** - Planificación semanal
- **Lugares cercanos** - Playas y montañas cerca de ti
- **Recomendaciones IA** - Sugerencias inteligentes basadas en el clima
- **Diseño moderno** - UI con gradientes y animaciones suaves

## Stack Tecnológico

- **React Native** con Expo SDK 54
- **TypeScript** para tipado estático
- **NativeWind** (Tailwind CSS para React Native)
- **Zustand** para gestión de estado
- **MMKV** para persistencia
- **Expo Router** para navegación

## APIs Integradas

| Servicio | Propósito | Coste |
|----------|-----------|-------|
| OpenWeatherMap | Datos del clima | Gratis (1000 calls/día) |
| Foursquare Places | Lugares cercanos | Gratis (10k calls/mes) |
| OpenAI GPT-4o | Recomendaciones IA | Pay-as-you-go |

## Instalación

### 1. Clonar el proyecto
```bash
git clone <repo-url>
cd weather-ai
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y añade tus API keys:

```bash
cp .env.example .env
```

Edita `.env` con tus API keys:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=tu_api_key_de_openweathermap
EXPO_PUBLIC_FOURSQUARE_API_KEY=tu_api_key_de_foursquare
EXPO_PUBLIC_OPENAI_API_KEY=tu_api_key_de_openai
```

### 4. Obtener API Keys

#### OpenWeatherMap
1. Regístrate en [openweathermap.org](https://openweathermap.org/api)
2. Genera una API key en tu dashboard
3. Copia la key al archivo `.env`

#### Foursquare Places
1. Regístrate en [foursquare.com/developers](https://foursquare.com/developers)
2. Crea un nuevo proyecto
3. Genera una API key
4. Copia la key al archivo `.env`

#### OpenAI
1. Regístrate en [platform.openai.com](https://platform.openai.com/api-keys)
2. Genera una nueva API key
3. Copia la key al archivo `.env`

### 5. Ejecutar la app

```bash
# Desarrollo en Android
npm run android

# Desarrollo en iOS (macOS)
npm run ios

# Desarrollo web
npm run web

# Iniciar con Expo Go
npx expo start
```

## Estructura del Proyecto

```
weather-ai/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Home screen
│   └── manage-cities.tsx        # City management screen
├── src/
│   ├── components/              # UI components
│   │   ├── WeatherCard.tsx
│   │   ├── ForecastList.tsx
│   │   ├── HourlyForecast.tsx
│   │   ├── PlacesList.tsx
│   │   ├── AIRecommendationCard.tsx
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SearchResultItem.tsx
│   │   └── CityItem.tsx
│   ├── services/                # API services
│   │   ├── weatherService.ts
│   │   ├── placesService.ts
│   │   └── aiService.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useWeather.ts
│   │   ├── usePlaces.ts
│   │   └── useAIRecommendation.ts
│   ├── store/                   # Zustand stores
│   │   └── citiesStore.ts
│   └── types/                   # TypeScript types
│       └── index.ts
├── tailwind.config.js           # Tailwind configuration
├── babel.config.js              # Babel configuration
├── metro.config.js             # Metro bundler configuration
└── .env                        # Environment variables
```

## Cómo Funciona

1. **Ubicación**: La app solicita permiso para acceder a tu ubicación GPS
2. **Clima**: Consulta OpenWeatherMap para obtener el clima actual y forecast
3. **Lugares**: Busca playas y montañas cercanas usando Foursquare Places
4. **IA**: Analiza todos los datos y genera una recomendación personalizada
5. **UI**: Muestra toda la información de forma clara y atractiva

## Lógica de Recomendaciones

| Condición | Recomendación |
|-----------|---------------|
| Soleado + >20°C + playa cerca | Ir a la playa 🏖️ |
| Buen clima + montaña cerca | Excursión ⛰️ |
| Lluvia o frío | Quedarse en casa 🏠 |

## Roadmap

### ✅ Completado

- [x] UI principal con temperatura grande y fondo dinámico
- [x] Header con icono de ubicación, nombre ciudad y menú
- [x] Fondo dinámico según clima (sol, nubes, tormenta)
- [x] Pronóstico semanal (5 días) con temp max/min reales
- [x] Pronóstico por horas con scroll horizontal
- [x] Recomendación de IA (playa/montaña/casa)
- [x] Lugares cercanos (playas y montañas)
- [x] Traducción al español
- [x] Estilo de cards transparente con borde sutil
- [x] Iconos Ionicons替换 emojis
- [x] Indicador de Celsius (°C)
- [x] Quitar botón refresh redundante
- [x] Gestión de ciudades (buscar, agregar, reordenar, eliminar)
- [x] Primera ciudad de la lista como ciudad activa
- [x] Persistencia de ciudades con MMKV
- [x] Menú emergente (Compartir, Ajustes)
- [x] Cambio de ciudad con swipe horizontal entre ciudades guardadas
- [x] Indicador visual de puntos para navegación entre ciudades

### 📋 Pendiente

- [ ] Detalles al tocar en pronóstico de 5 días
- [ ] Modo offline con datos cacheados
- [ ] Datos meteorológicos adicionales (presión, visibilidad, índice UV, amanecer/anochecer)
- [ ] Alertas de clima severo (tormentas, lluvia intensa, ola de calor)
- [ ] Calidad del aire (AQI)
- [ ] Gráficos de temperatura
- [ ] Detalle de humedad por hora
- [ ] Modo oscuro
- [ ] Efecto de degradación (fade) en temperatura al hacer scroll
- [ ] Efecto de rotación en temperatura al cambiar de ciudad con swipe
- [ ] Iconos dinámicos según hora del día (sol/luna)

## Licencia

MIT License
