import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { AIRecommendation, WeatherData, Place } from '../types';
import { getAIRecommendation } from '../services/aiService';

export const useAIRecommendation = () => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelTokenSourceRef = useRef(axios.CancelToken.source());
  const isMountedRef = useRef(true);

  const getRecommendation = useCallback(async (
    weather: WeatherData,
    beaches: Place[],
    mountains: Place[]
  ) => {
    cancelTokenSourceRef.current.cancel('Cancelling previous request');
    cancelTokenSourceRef.current = axios.CancelToken.source();
    isMountedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const result = await getAIRecommendation(
        weather, 
        beaches, 
        mountains,
        cancelTokenSourceRef.current.token
      );

      if (!isMountedRef.current) return;
      setRecommendation(result);
    } catch (err: any) {
      if (axios.isCancel(err)) {
        return;
      }
      console.error('AI recommendation error:', err);
      if (isMountedRef.current) {
        setError('Error al generar recomendación');
        setRecommendation({
          activity: 'home',
          title: 'Recomendación no disponible',
          description: 'No pudimos generar una recomendación en este momento.',
          icon: '🤔',
          reason: 'Intenta de nuevo más tarde.',
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  return { recommendation, loading, error, getRecommendation };
};
