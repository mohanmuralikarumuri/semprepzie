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
// MINCODE SUBJECTS ROUTES
// ============================================

// Get all mincode subjects
const getAllMinCodeSubjects = async (req: Request, res: Response) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('mincode_subjects')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch min code subjects',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Get single mincode subject by code
const getMinCodeSubjectByCode = async (req: Request, res: Response) => {
  const { code } = req.params;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('mincode_subjects')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    return res.status(404).json({
      success: false,
      message: 'Min code subject not found',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Create new mincode subject (Admin only)
const createMinCodeSubject = async (req: Request, res: Response) => {
  const { id, name, code, description, icon } = req.body;
  
  if (!name || !code) {
    return res.status(400).json({
      success: false,
      message: 'Name and code are required'
    });
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('mincode_subjects')
    .insert({
      id: id || `mincode-${code.toLowerCase()}-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      description: description || '',
      icon: icon || '💻',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create min code subject',
      error: error.message
    });
  }

  res.status(201).json({
    success: true,
    data
  });
};

// Update mincode subject (Admin only)
const updateMinCodeSubject = async (req: Request, res: Response) => {
  const { code } = req.params;
  const updates = req.body;
  const supabase = getSupabaseClient();

  // Don't allow changing the code field
  delete updates.code;
  delete updates.created_at;
  
  const { data, error } = await supabase
    .from('mincode_subjects')
    .update(updates)
    .eq('code', code)
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update min code subject',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Delete mincode subject (Admin only)
const deleteMinCodeSubject = async (req: Request, res: Response) => {
  const { code } = req.params;
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('mincode_subjects')
    .delete()
    .eq('code', code);

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete min code subject',
      error: error.message
    });
  }

  res.json({
    success: true,
    message: 'Min code subject deleted successfully'
  });
};

// ============================================
// MINCODE PROGRAMS ROUTES
// ============================================

// Get all mincode programs
const getAllMinCodePrograms = async (req: Request, res: Response) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('mincode_programs')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch min code programs',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Get mincode programs by subject code
const getMinCodeProgramsBySubject = async (req: Request, res: Response) => {
  const { subjectCode } = req.params;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('mincode_programs')
    .select('*')
    .eq('subject_code', subjectCode.toUpperCase())
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch min code programs',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Get single mincode program by ID
const getMinCodeProgramById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('mincode_programs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({
      success: false,
      message: 'Min code program not found',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Create new mincode program (Admin only)
const createMinCodeProgram = async (req: Request, res: Response) => {
  const { id, subject_code, program_name, language, code, sample_input, description, difficulty } = req.body;
  
  if (!subject_code || !program_name || !language || !code) {
    return res.status(400).json({
      success: false,
      message: 'Subject code, program name, language, and code are required'
    });
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('mincode_programs')
    .insert({
      id: id || `${subject_code.toLowerCase()}-mincode-${Date.now()}`,
      subject_code: subject_code.toUpperCase(),
      program_name,
      language: language.toLowerCase(),
      code,
      sample_input: sample_input || '',
      description: description || '',
      difficulty: difficulty || 'easy',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create min code program',
      error: error.message
    });
  }

  res.status(201).json({
    success: true,
    data
  });
};

// Update mincode program (Admin only)
const updateMinCodeProgram = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const supabase = getSupabaseClient();

  // Don't allow changing these fields
  delete updates.id;
  delete updates.created_at;
  
  const { data, error } = await supabase
    .from('mincode_programs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update min code program',
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
};

// Delete mincode program (Admin only)
const deleteMinCodeProgram = async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('mincode_programs')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete min code program',
      error: error.message
    });
  }

  res.json({
    success: true,
    message: 'Min code program deleted successfully'
  });
};

// ============================================
// ROUTE DEFINITIONS
// ============================================

// Public routes
router.get('/subjects', asyncHandler(getAllMinCodeSubjects));
router.get('/subjects/:code', asyncHandler(getMinCodeSubjectByCode));
router.get('/programs', asyncHandler(getAllMinCodePrograms));
router.get('/programs/subject/:subjectCode', asyncHandler(getMinCodeProgramsBySubject));
router.get('/programs/:id', asyncHandler(getMinCodeProgramById));

// Admin routes (require authentication)
router.post('/subjects', authenticateToken, asyncHandler(createMinCodeSubject));
router.put('/subjects/:code', authenticateToken, asyncHandler(updateMinCodeSubject));
router.delete('/subjects/:code', authenticateToken, asyncHandler(deleteMinCodeSubject));
router.post('/programs', authenticateToken, asyncHandler(createMinCodeProgram));
router.put('/programs/:id', authenticateToken, asyncHandler(updateMinCodeProgram));
router.delete('/programs/:id', authenticateToken, asyncHandler(deleteMinCodeProgram));

export default router;
