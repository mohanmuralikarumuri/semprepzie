import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export interface LatestUpdate {
  id: string;
  title: string;
  type: string;
  url: string;
  original_url: string;
  uploaded_at: string;
  unit_name: string;
  subject_name: string;
  subject_icon: string;
}

interface UseLatestUpdatesReturn {
  updates: LatestUpdate[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useLatestUpdates = (limit: number = 10): UseLatestUpdatesReturn => {
  const [updates, setUpdates] = useState<LatestUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestUpdates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch latest documents with their unit and subject information
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          type,
          url,
          original_url,
          uploaded_at,
          units (
            name,
            subjects (
              name,
              icon
            )
          )
        `)
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (documentsError) {
        throw new Error(`Failed to fetch latest updates: ${documentsError.message}`);
      }

      if (!documentsData) {
        setUpdates([]);
        return;
      }

      // Transform the data to match our interface
      const transformedUpdates: LatestUpdate[] = documentsData.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        url: doc.url,
        original_url: doc.original_url,
        uploaded_at: doc.uploaded_at,
        unit_name: doc.units?.name || 'Unknown Unit',
        subject_name: doc.units?.subjects?.name || 'Unknown Subject',
        subject_icon: doc.units?.subjects?.icon || '📄',
      }));

      setUpdates(transformedUpdates);
    } catch (err) {
      console.error('Error fetching latest updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch latest updates');
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchLatestUpdates();
  };

  useEffect(() => {
    fetchLatestUpdates();
  }, [limit]);

  return {
    updates,
    loading,
    error,
    refetch,
  };
};
