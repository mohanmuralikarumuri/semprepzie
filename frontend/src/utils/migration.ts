// Migration utility to populate Supabase tables with existing static data
// Run this once to migrate your static data to Supabase tables

import { supabase } from '../config/supabase';
import { subjectsDataFallback } from '../utils/documentUtils';

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

export const migrateStaticDataToSupabase = async (): Promise<MigrationResult> => {
  try {
    console.log('Starting migration of static data to Supabase...');

    // Step 1: Insert subjects
    console.log('Inserting subjects...');
    const subjectsToInsert = subjectsDataFallback.map(subject => ({
      id: subject.id,
      name: subject.name,
      icon: subject.icon,
    }));

    const { error: subjectsError } = await supabase
      .from('subjects')
      .upsert(subjectsToInsert, { onConflict: 'id' });

    if (subjectsError) {
      throw new Error(`Failed to insert subjects: ${subjectsError.message}`);
    }

    // Step 2: Insert units
    console.log('Inserting units...');
    const unitsToInsert = subjectsDataFallback.flatMap(subject =>
      subject.units.map(unit => ({
        id: unit.id,
        subject_id: subject.id,
        name: unit.name,
      }))
    );

    const { error: unitsError } = await supabase
      .from('units')
      .upsert(unitsToInsert, { onConflict: 'id' });

    if (unitsError) {
      throw new Error(`Failed to insert units: ${unitsError.message}`);
    }

    // Step 3: Insert documents
    console.log('Inserting documents...');
    const documentsToInsert = subjectsDataFallback.flatMap(subject =>
      subject.units.flatMap(unit =>
        unit.documents.map(doc => ({
          id: doc.id,
          unit_id: unit.id,
          title: doc.title,
          type: doc.type,
          url: doc.url,
          original_url: doc.originalUrl,
          uploaded_at: doc.lastModified ? new Date(doc.lastModified).toISOString() : new Date().toISOString(),
        }))
      )
    );

    const { error: documentsError } = await supabase
      .from('documents')
      .upsert(documentsToInsert, { onConflict: 'id' });

    if (documentsError) {
      throw new Error(`Failed to insert documents: ${documentsError.message}`);
    }

    console.log('Migration completed successfully!');
    return {
      success: true,
      message: `Migration completed successfully! Inserted ${subjectsToInsert.length} subjects, ${unitsToInsert.length} units, and ${documentsToInsert.length} documents.`,
      details: {
        subjects: subjectsToInsert.length,
        units: unitsToInsert.length,
        documents: documentsToInsert.length,
      },
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred during migration',
    };
  }
};

// Helper function to verify migration
export const verifyMigration = async (): Promise<MigrationResult> => {
  try {
    console.log('Verifying migration...');

    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');

    if (subjectsError) {
      throw new Error(`Failed to verify subjects: ${subjectsError.message}`);
    }

    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('*');

    if (unitsError) {
      throw new Error(`Failed to verify units: ${unitsError.message}`);
    }

    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*');

    if (documentsError) {
      throw new Error(`Failed to verify documents: ${documentsError.message}`);
    }

    return {
      success: true,
      message: `Verification completed! Found ${subjects?.length || 0} subjects, ${units?.length || 0} units, and ${documents?.length || 0} documents.`,
      details: {
        subjects: subjects?.length || 0,
        units: units?.length || 0,
        documents: documents?.length || 0,
      },
    };
  } catch (error) {
    console.error('Verification failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred during verification',
    };
  }
};
