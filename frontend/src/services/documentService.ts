import { supabase } from '../config/supabase';

export interface DocumentMetadata {
  title: string;
  subjectId: string;
  unitId: string;
  type: string;
  url: string;
  originalUrl: string;
}

export interface CreateDocumentResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

export interface CreateUnitResult {
  success: boolean;
  unit?: { id: string; name: string };
  error?: string;
}

class DocumentService {
  /**
   * Create a new document in the database
   */
  async createDocument(metadata: DocumentMetadata): Promise<CreateDocumentResult> {
    try {
      // Generate document ID
      const documentId = `${metadata.unitId}-doc-${Date.now()}`;

      // Insert document
      const { data, error } = await supabase
        .from('documents')
        .insert({
          id: documentId,
          unit_id: metadata.unitId,
          title: metadata.title,
          type: metadata.type,
          url: metadata.url,
          original_url: metadata.originalUrl,
          uploaded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        return {
          success: false,
          error: `Failed to save document: ${error.message}`
        };
      }

      return {
        success: true,
        documentId: data.id
      };

    } catch (error) {
      console.error('Document service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create document'
      };
    }
  }

  /**
   * Get all subjects for dropdown
   */
  async getSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, icon')
        .order('name');

      if (error) throw error;

      return { success: true, subjects: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subjects'
      };
    }
  }

  /**
   * Get units for a specific subject
   */
  async getUnits(subjectId: string) {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name')
        .eq('subject_id', subjectId)
        .order('name');

      if (error) throw error;

      return { success: true, units: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch units'
      };
    }
  }

  /**
   * Create a new unit for a subject
   */
  async createUnit(subjectId: string, unitName: string): Promise<CreateUnitResult> {
    try {
      // Generate simple unit ID: subjectId + unitName (cleaned)
      const cleanUnitName = unitName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const unitId = `${subjectId}-${cleanUnitName}`;

      // Insert unit
      const { data, error } = await supabase
        .from('units')
        .insert({
          id: unitId,
          subject_id: subjectId,
          name: unitName.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        return {
          success: false,
          error: `Failed to create unit: ${error.message}`
        };
      }

      return {
        success: true,
        unit: { id: data.id, name: data.name }
      };

    } catch (error) {
      console.error('Unit creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create unit'
      };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string) {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete document'
      };
    }
  }

  /**
   * Get documents by unit ID
   */
  async getDocumentsByUnit(unitId: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('unit_id', unitId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return { success: true, documents: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents'
      };
    }
  }

  /**
   * Create a new subject
   */
  async createSubject(name: string, icon: string = '📚') {
    try {
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const subjectId = `subject-${cleanName}-${Date.now()}`;

      const { data, error } = await supabase
        .from('subjects')
        .insert({
          id: subjectId,
          name: name.trim(),
          icon: icon,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, subject: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subject'
      };
    }
  }

  /**
   * Delete a subject
   */
  async deleteSubject(subjectId: string) {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete subject'
      };
    }
  }

  /**
   * Delete a unit
   */
  async deleteUnit(unitId: string) {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete unit'
      };
    }
  }

  /**
   * Save document metadata
   */
  async saveDocumentMetadata(metadata: { title: string; unit_id: string; file_path: string; file_size: number }) {
    try {
      const documentId = `doc-${Date.now()}`;

      const { data, error } = await supabase
        .from('documents')
        .insert({
          id: documentId,
          unit_id: metadata.unit_id,
          title: metadata.title,
          url: metadata.file_path,
          original_url: metadata.file_path,
          type: 'pdf',
          uploaded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, document: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save document metadata'
      };
    }
  }
}

export const documentService = new DocumentService();
export default documentService;
