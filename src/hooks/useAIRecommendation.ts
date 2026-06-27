import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { AIRecommendation, WeatherData, Place } from '../types';
import { getAIRecommendation } from '../services/aiService';

export const useAIRecommendation = () => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const getRecommendation = useCallback(async (
    weather: WeatherData,
    beaches: Place[],
    mountains: Place[]
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    isMountedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const result = await getAIRecommendation(
        weather, 
        beaches, 
        mountains,
        abortControllerRef.current?.signal
      );

      if (!isMountedRef.current) return;
      setRecommendation(result);
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        return;
      }
      if ((err as { code?: string })?.code === 'ERR_CANCELED') return;
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
