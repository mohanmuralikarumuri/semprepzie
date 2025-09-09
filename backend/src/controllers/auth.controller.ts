import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { FirebaseService } from '../services/firebase.service';
import { createError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';
// import { validateCollegeEmail, extractStudentNumber } from '@semprepzie/shared';

// Temporary inline functions to replace shared module
const ALLOWED_EMAIL_DOMAIN = '@aitsrajampet.ac.in';
const VALID_STUDENT_NUMBERS = [
  '0501', '0567', '0568', '0569', '0570', '0571', '0572', '0573', '0574', '0575',
  '0576', '0577', '0578', '0579', '0580', '0581', '0582', '0583', '0584', '0585',
  '0586', '0587', '0588', '0589', '0590', '0591', '0592', '0593', '0594', '0595',
  '0596', '0597', '0598', '0599', '05A0', '05A1', '05A2', '05A3', '05A4', '05A5',
  '05A6', '05A7', '05A8', '05A9', '05B0', '05B1', '05B2', '05B3', '05B4', '05B5',
  '05B6', '05B7', '05C3', '05B8', '05B9', '05C0', '05C1', '05C2', '05C4', '05C5',
  '05C6', '05C7', '05C8', '05C9', '05D0', '05D1', '0510', '0511', '0512', '0513'
];

function extractStudentNumber(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  const localPart = email.split('@')[0];
  if (localPart.length >= 4) {
    return localPart.slice(-4).toUpperCase();
  }
  return '';
}

function validateCollegeEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  if (!email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
    return false;
  }
  const studentNumber = extractStudentNumber(email);
  return VALID_STUDENT_NUMBERS.includes(studentNumber);
}

class AuthController {
  public async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    // Validate email domain and student number
    if (!validateCollegeEmail(email)) {
      const studentNumber = extractStudentNumber(email);
      throw createError(`Access denied: Student number "${studentNumber}" is not in the authorized list`, 403);
    }

    try {
      // TEMPORARY BYPASS: While Firebase Admin SDK permissions are being fixed
      // Just validate the email format and return success
      logger.info(`Login attempt for authorized email: ${email}`);
      
      // TODO: Remove this bypass once Firebase Admin SDK permissions are fixed
      // const firebaseService = FirebaseService.getInstance();
      // const userRecord = await firebaseService.getUserByEmail(email);

      res.json({
        success: true,
        message: 'Login validation successful (bypassing Firebase Admin SDK)',
        user: {
          uid: 'temp-uid-' + Date.now(),
          email: email,
          displayName: email.split('@')[0],
          emailVerified: false,
          note: 'Temporary response while Firebase permissions are being configured'
        }
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      throw createError('Authentication failed', 401);
    }
  }

  public async signup(req: Request, res: Response): Promise<void> {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    // Validate email domain and student number
    if (!validateCollegeEmail(email)) {
      const studentNumber = extractStudentNumber(email);
      throw createError(`Access denied: Student number "${studentNumber}" is not in the authorized list`, 403);
    }

    // Password validation
    if (password.length < 6) {
      throw createError('Password must be at least 6 characters long', 400);
    }

    try {
      // TEMPORARY BYPASS: While Firebase Admin SDK permissions are being fixed
      logger.info(`Signup attempt for authorized email: ${email}`);
      
      // TODO: Remove this bypass once Firebase Admin SDK permissions are fixed
      // const firebaseService = FirebaseService.getInstance();
      // Check if user already exists
      // Create user with Firebase Admin SDK

      res.status(201).json({
        success: true,
        message: 'Account creation validated (bypassing Firebase Admin SDK)',
        user: {
          uid: 'temp-uid-' + Date.now(),
          email: email,
          displayName: displayName || email.split('@')[0],
          emailVerified: false,
          note: 'Temporary response while Firebase permissions are being configured. Use Firebase client SDK for actual account creation.'
        }
      });
    } catch (error: any) {
      logger.error('Signup error:', error);
      throw createError('Failed to validate account creation', 500);
    }
  }

  public async verifyToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      throw createError('Token is required', 400);
    }

    try {
      const firebaseService = FirebaseService.getInstance();
      const decodedToken = await firebaseService.verifyIdToken(token);

      res.json({
        success: true,
        valid: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified
        }
      });
    } catch (error) {
      throw createError('Invalid or expired token', 401);
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    // Validate email domain
    if (!email.endsWith('@aitsrajampet.ac.in')) {
      throw createError('Only @aitsrajampet.ac.in emails are allowed', 400);
    }

    try {
      const firebaseService = FirebaseService.getInstance();
      
      // Check if user exists
      await firebaseService.getUserByEmail(email);

      // Note: Password reset is handled by Firebase Auth on the frontend
      // This endpoint validates the email exists
      
      res.json({
        success: true,
        message: 'Password reset instructions will be sent to your email'
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // For security, don't reveal if email exists or not
        res.json({
          success: true,
          message: 'If an account exists with this email, password reset instructions will be sent'
        });
      } else {
        throw createError('Failed to process password reset', 500);
      }
    }
  }

  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const userRecord = await firebaseService.getAuth().getUser(req.user!.uid);

      res.json({
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
          createdAt: userRecord.metadata.creationTime,
          lastSignIn: userRecord.metadata.lastSignInTime
        }
      });
    } catch (error) {
      throw createError('Failed to fetch user profile', 500);
    }
  }

  public async updateProfile(req: Request, res: Response): Promise<void> {
    const { displayName } = req.body;

    try {
      const firebaseService = FirebaseService.getInstance();
      const userRecord = await firebaseService.updateUser(req.user!.uid, {
        displayName
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified
        }
      });
    } catch (error) {
      throw createError('Failed to update profile', 500);
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    // Firebase logout is handled on the frontend
    // This endpoint can be used for additional cleanup if needed
    
    logger.info(`User logged out: ${req.user!.email}`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

export const authController = new AuthController();
