import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware';
import { authenticateToken, requireEmailVerification } from '../middlewares/auth.middleware';
import { Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const router = Router();

// Lazy initialize Supabase client
let supabase: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

// ============================================
// LAB SUBJECTS ROUTES
// ============================================

// Get all lab subjects
const getAllLabSubjects = async (req: Request, res: Response) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('lab_subjects')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lab subjects',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Get single lab subject by code
const getLabSubjectByCode = async (req: Request, res: Response) => {
  const { code } = req.params;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('lab_subjects')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    return res.status(404).json({
      success: false,
      message: 'Lab subject not found',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Create new lab subject (Admin only)
const createLabSubject = async (req: Request, res: Response) => {
  const { id, name, code, description, icon } = req.body;

  if (!id || !name || !code || !description) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: id, name, code, description'
    });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('lab_subjects')
    .insert([{ id, name, code, description, icon: icon || '📚' }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create lab subject',
      error: error.message
    });
  }

  res.status(201).json({
    success: true,
    data
  });
};

// Delete lab subject (Admin only)
const deleteLabSubject = async (req: Request, res: Response) => {
  const { code } = req.params;
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('lab_subjects')
    .delete()
    .eq('code', code);

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete lab subject',
      error: error.message
    });
  }

  res.json({
    success: true,
    message: 'Lab subject deleted successfully'
  });
};

// ============================================
// LAB PROGRAMS ROUTES
// ============================================

// Get all lab programs by subject code
const getLabProgramsBySubject = async (req: Request, res: Response) => {
  const { code } = req.params;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('lab_programs')
    .select('*')
    .eq('subject_code', code)
    .order('program_name', { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lab programs',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Get single lab program by ID
const getLabProgramById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('lab_programs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({
      success: false,
      message: 'Lab program not found',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Get all lab programs (for practice mode)
const getAllLabPrograms = async (req: Request, res: Response) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('lab_programs')
    .select('*')
    .order('subject_code', { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lab programs',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Create new lab program (Admin only)
const createLabProgram = async (req: Request, res: Response) => {
  const { id, subject_code, program_name, language, code, sample_input, description, difficulty } = req.body;

  if (!id || !subject_code || !program_name || !language || !code) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: id, subject_code, program_name, language, code'
    });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('lab_programs')
    .insert([{ id, subject_code, program_name, language, code, sample_input: sample_input || '', description, difficulty }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create lab program',
      error: error.message
    });
  }

  res.status(201).json({
    success: true,
    data
  });
};

// Delete lab program (Admin only)
const deleteLabProgram = async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('lab_programs')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete lab program',
      error: error.message
    });
  }

  res.json({
    success: true,
    message: 'Lab program deleted successfully'
  });
};

// ============================================
// ROUTES REGISTRATION
// ============================================

// Lab Subjects Routes (Public read, Admin write)
router.get('/subjects', asyncHandler(getAllLabSubjects));
router.get('/subjects/:code', asyncHandler(getLabSubjectByCode));
router.post('/subjects', authenticateToken, requireEmailVerification, asyncHandler(createLabSubject));
router.delete('/subjects/:code', authenticateToken, requireEmailVerification, asyncHandler(deleteLabSubject));

// Lab Programs Routes (Public read, Admin write)
router.get('/programs/subject/:code', asyncHandler(getLabProgramsBySubject));
router.get('/programs/:id', asyncHandler(getLabProgramById));
router.get('/programs', asyncHandler(getAllLabPrograms));
router.post('/programs', authenticateToken, requireEmailVerification, asyncHandler(createLabProgram));
router.delete('/programs/:id', authenticateToken, requireEmailVerification, asyncHandler(deleteLabProgram));

export default router;
