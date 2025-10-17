import { Request, Response } from 'express';
import { runWithProvider } from '../services/execute.service';
import { logger } from '../utils/logger';

export async function executeCode(req: Request, res: Response) {
  try {
    const { provider, language, code, stdin } = req.body || {};
    
    // Validate required fields
    if (!language || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'language and code are required' 
      });
    }
    
    // Validate language
    if (!['c', 'cpp', 'python', 'java'].includes(language)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid language. Supported: c, cpp, python, java' 
      });
    }
    
    logger.info(`Code execution request: ${language}, stdin length: ${(stdin || '').length}`);
    
    const result = await runWithProvider({ 
      provider, 
      language, 
      code, 
      stdin: stdin || '' 
    });
    
    // Check if there was a compilation or runtime error
    const hasError = result.error && result.error.trim().length > 0;
    
    if (hasError) {
      logger.warn(`Execution completed with errors via provider: ${result.provider}`);
    } else {
      logger.info(`Execution successful via provider: ${result.provider}`);
    }
    
    return res.json({ 
      success: !hasError,  // Only success if no compilation/runtime errors
      ...result 
    });
  } catch (err: any) {
    logger.error(`Execution failed: ${err?.message}`);
    return res.status(500).json({ 
      success: false, 
      error: err?.message || 'Execution failed' 
    });
  }
}
