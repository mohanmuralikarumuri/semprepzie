import rateLimit from 'express-rate-limit';
import { APP_CONFIG } from '@semprepzie/shared';

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: APP_CONFIG.RATE_LIMIT.WINDOW_MS,
  max: APP_CONFIG.RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to include user ID if available
  keyGenerator: (req) => {
    return req.ip + ':' + (req.user?.uid || 'anonymous');
  }
});

// Strict rate limiter for contact form
export const contactFormLimiter = rateLimit({
  windowMs: APP_CONFIG.RATE_LIMIT.WINDOW_MS,
  max: APP_CONFIG.RATE_LIMIT.CONTACT_FORM_MAX,
  message: {
    success: false,
    error: 'Too many contact form submissions. Please wait before sending another message.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP and email if provided
    const email = req.body?.email || '';
    return req.ip + ':' + email;
  }
});

// Auth rate limiter (stricter for login attempts)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // Rate limit by IP and email for login attempts
    const email = req.body?.email || '';
    return req.ip + ':auth:' + email;
  }
});

// Document upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Allow 50 uploads per hour
  message: {
    success: false,
    error: 'Upload limit exceeded. Please wait before uploading more files.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + ':upload:' + (req.user?.uid || 'anonymous');
  }
});
