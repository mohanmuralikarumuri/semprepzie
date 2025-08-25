import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = Router();

// Public routes
router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/signup', authLimiter, asyncHandler(authController.signup));
router.post('/reset-password', authLimiter, asyncHandler(authController.resetPassword));
router.post('/verify-token', asyncHandler(authController.verifyToken));

// Protected routes
router.get('/profile', authenticateToken, asyncHandler(authController.getProfile));
router.put('/profile', authenticateToken, asyncHandler(authController.updateProfile));
router.post('/logout', authenticateToken, asyncHandler(authController.logout));

export default router;
