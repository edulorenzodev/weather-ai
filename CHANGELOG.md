# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [1.0.0] - 2026-05-04

### Added
- UI principal con temperatura grande y fondo dinámico según el clima
- Header con icono de ubicación, nombre de ciudad y menú de opciones
- Fondo dinámico animado (sol, nubes, tormenta)
- Pronóstico semanal de 5 días
- Pronóstico por horas con scroll horizontal (Próximas horas)
- Primera hora muestra "Ahora" en lugar de la hora
- Pronóstico por horas incluye velocidad del viento
- Recomendación de IA (playa/montaña/casa) basada en clima y ubicación
- Playas y montañas cercanas mediante Foursquare API
- Traducción de descripciones del clima al español
- Estilo de cards con fondo transparente y borde sutil
- Iconos Ionicons替换 emojis (ubicación, tiempo, calendario)
- Indicador de Celsius (°C) con letra más pequeña

### Changed
- Peso de la temperatura principal cambiado de 200 a 300 (light)
- Título del pronóstico semanal movido dentro de la card
- Estilos de headers unificados (16px, color al 50%)

### Fixed
- Pronóstico semanal mostrando 5 días correctamente (antes solo mostraba 1)
- Descripción del clima en español en la vista principal
- Fallo en componente HourlyForecast que siempre mostraba "20:00"

### Removed
- Botón de refresh redundante en el header (pull-to-refresh es suficiente)
- Fondo sólido de las cards (ahora transparente)

## [0.1.0] - 2026-03-05

### Added
- Versión inicial del proyecto
- Clima actual con OpenWeatherMap API
- Pronóstico básico
- Recomendación de IA local (fallback)
- UI con gradiente azul oscuro