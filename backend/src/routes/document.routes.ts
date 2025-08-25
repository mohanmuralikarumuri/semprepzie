import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authenticateToken, requireEmailVerification } from '../middlewares/auth.middleware';
import { uploadLimiter } from '../middlewares/rateLimit.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = Router();

// All document routes require authentication
router.use(authenticateToken);

// Document routes
router.get('/', asyncHandler(documentController.getDocuments));
router.get('/:id', asyncHandler(documentController.getDocument));
router.get('/:id/metadata', asyncHandler(documentController.getDocumentMetadata));
router.post('/upload', requireEmailVerification, uploadLimiter, asyncHandler(documentController.uploadDocument));
router.delete('/:id', requireEmailVerification, asyncHandler(documentController.deleteDocument));

export default router;
