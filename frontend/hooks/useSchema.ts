/**
 * useSchema Hook
 * 
 * Fetches and caches model schema from Django backend.
 * This is the bridge between backend schema and frontend UI.
 * 
 * Adaptive Convergence Principle:
 * Frontend reads schema once, generates UI dynamically.
 */

'use client';

import { useState, useEffect } from 'react';
import { ModelSchema } from '@/types/schema';

interface UseSchemaResult {
  schema: ModelSchema | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSchema(modelName: string): UseSchemaResult {
  const [schema, setSchema] = useState<ModelSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchema = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined');
      }

      const response = await fetch(`${apiUrl}/api/schema/${modelName}/`);

      if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${response.statusText}`);
      }

      const data: ModelSchema = await response.json();
      setSchema(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, [modelName]);

  return {
    schema,
    loading,
    error,
    refetch: fetchSchema,
  };
}