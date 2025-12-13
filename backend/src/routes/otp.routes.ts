import { Router, Request, Response } from 'express';
import otpController from '../controllers/otp.controller';
import { asyncHandler } from '../middlewares/error.middleware';
import { body } from 'express-validator';

const router = Router();

// Send OTP for password reset
router.post(
  '/send',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  asyncHandler((req: Request, res: Response) => otpController.sendOTP(req, res))
);

// Verify OTP
router.post(
  '/verify',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  asyncHandler((req: Request, res: Response) => otpController.verifyOTP(req, res))
);

// Resend OTP
router.post(
  '/resend',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  asyncHandler((req: Request, res: Response) => otpController.resendOTP(req, res))
);

export default router;
