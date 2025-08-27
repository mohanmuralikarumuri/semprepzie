import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../services/firebase.service';
import { createError } from './error.middleware';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        email_verified: boolean;
        [key: string]: any;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw createError('Access token required', 401);
    }

    const firebaseService = FirebaseService.getInstance();
    const decodedToken = await firebaseService.verifyIdToken(token);
    
    req.user = {
      email: decodedToken.email || '',
      email_verified: decodedToken.email_verified || false,
      ...decodedToken
    };

    next();
  } catch (error) {
    next(createError('Invalid or expired token', 403));
  }
};

export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.email_verified) {
    throw createError('Email verification required', 403);
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role || 'student';
    
    if (!roles.includes(userRole)) {
      throw createError('Insufficient permissions', 403);
    }
    
    next();
  };
};
