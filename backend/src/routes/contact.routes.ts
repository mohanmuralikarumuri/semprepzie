import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { contactFormLimiter } from '../middlewares/rateLimit.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = Router();

// Contact form submission
router.post('/submit', contactFormLimiter, asyncHandler(contactController.submitForm));

export default router;
