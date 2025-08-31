import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Subject, DocumentItem } from '../utils/documentUtils';

interface UseSubjectsDataReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSubjectsData = (): UseSubjectsDataReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjectsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all subjects with their related units and documents using nested query
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          id,
          name,
          icon,
          units (
            id,
            name,
            documents (
              id,
              title,
              type,
              url,
              original_url,
              uploaded_at
            )
          )
        `)
        .order('name', { ascending: true });

      if (subjectsError) {
        throw new Error(`Failed to fetch subjects: ${subjectsError.message}`);
      }

      if (!subjectsData) {
        throw new Error('No subjects data received');
      }

      // Transform database data to match the existing Subject interface
      const transformedSubjects: Subject[] = subjectsData.map((subject: any) => ({
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        units: subject.units?.map((unit: any) => ({
          id: unit.id,
          name: unit.name,
          documents: unit.documents?.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            type: doc.type,
            url: doc.url,
            originalUrl: doc.original_url,
            lastModified: doc.uploaded_at ? new Date(doc.uploaded_at).getTime() : undefined,
          })) || [],
        })) || [],
      }));

      // Sort units by name for consistency
      transformedSubjects.forEach(subject => {
        subject.units.sort((a, b) => a.name.localeCompare(b.name));
      });

      setSubjects(transformedSubjects);
    } catch (err) {
      console.error('Error fetching subjects data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects data');
      
      // Fallback to empty array on error
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchSubjectsData();
  };

  useEffect(() => {
    fetchSubjectsData();
  }, []);

  return {
    subjects,
    loading,
    error,
    refetch,
  };
};

// Helper functions that work with the hook data
export const getSubjectDocumentsFromHook = (subjects: Subject[], subjectId: string): DocumentItem[] => {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return [];
  
  return subject.units.flatMap(unit => unit.documents);
};

export const getDocumentByIdFromHook = (subjects: Subject[], documentId: string): DocumentItem | null => {
  for (const subject of subjects) {
    for (const unit of subject.units) {
      const document = unit.documents.find(doc => doc.id === documentId);
      if (document) return document;
    }
  }
  return null;
};
