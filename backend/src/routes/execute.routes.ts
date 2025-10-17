import { Router } from 'express';
import { executeCode } from '../controllers/execute.controller';

const router = Router();

/**
 * POST /api/execute
 * 
 * Execute code using multiple compiler providers
 * 
 * Body:
 *   - language: 'c' | 'cpp' | 'python' (required)
 *   - code: string (required)
 *   - stdin: string (optional) - input for the program
 *   - provider: string (optional) - force specific provider
 * 
 * Response:
 *   - success: boolean
 *   - output: string
 *   - error?: string
 *   - provider: string - which provider was used
 */
router.post('/', executeCode);

export default router;
