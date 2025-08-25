import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log request
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;
    
    logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('Content-Length')
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};
