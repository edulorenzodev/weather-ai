import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Place } from '../types';
import { searchBeaches, searchMountains } from '../services/placesService';

export const usePlaces = (lat?: number, lon?: number) => {
  const [beaches, setBeaches] = useState<Place[]>([]);
  const [mountains, setMountains] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchPlaces = useCallback(async () => {
    if (!lat || !lon) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const signal = abortControllerRef.current?.signal;
      const [beachesData, mountainsData] = await Promise.all([
        searchBeaches(lat, lon, signal),
        searchMountains(lat, lon, signal),
      ]);

      if (!isMountedRef.current) return;

      setBeaches(beachesData);
      setMountains(mountainsData);
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        return;
      }
      console.error('Places error:', err);
      if (isMountedRef.current) {
        setError('Error al obtener lugares cercanos');
        setBeaches([]);
        setMountains([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchPlaces();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPlaces]);

  return { beaches, mountains, loading, error, refetch: fetchPlaces };
};
