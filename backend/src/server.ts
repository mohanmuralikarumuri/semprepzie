import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cron from 'node-cron';
import axios from 'axios';

// Import routes
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import contactRoutes from './routes/contact.routes';
import deviceRoutes from './routes/device.routes';

// Import middleware
import { errorHandler } from './middlewares/error.middleware';
import { rateLimiter } from './middlewares/rateLimit.middleware';
import { requestLogger } from './middlewares/logger.middleware';

// Import services
import { FirebaseService } from './services/firebase.service';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeServices();
    this.setupKeepAlive();
  }

  private initializeMiddleware(): void {
    // Disable all CSP headers completely
    this.app.use((req, res, next) => {
      // Remove any existing CSP headers
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('Content-Security-Policy-Report-Only');
      res.removeHeader('X-Content-Security-Policy');
      res.removeHeader('X-WebKit-CSP');
      
      // Set permissive headers for external resources
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      
      next();
    });

    // Security middleware with ALL CSP disabled
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      dnsPrefetchControl: false,
      frameguard: false,
      hidePoweredBy: false,
      hsts: false,
      ieNoOpen: false,
      noSniff: false,
      originAgentCluster: false,
      permittedCrossDomainPolicies: false,
      referrerPolicy: false,
      xssFilter: false
    }));

    // CORS configuration with updated origins
    this.app.use(cors({
      origin: [
        'http://localhost:5173',
        'http://localhost:5174', 
        'https://semprepzie.onrender.com',
        'https://semprepzie-backend.onrender.com',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://lnbjkowlhordgyhzhpgi.supabase.co'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    }));

    // Compression
    this.app.use(compression());

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
    }
    this.app.use(requestLogger);

    // Rate limiting
    this.app.use('/api/', rateLimiter);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/documents', documentRoutes);
    this.app.use('/api/contact', contactRoutes);
    this.app.use('/api/devices', deviceRoutes);

    // Serve static files in production with proper headers
    if (process.env.NODE_ENV === 'production') {
      // Add headers for static files
      this.app.use(express.static('public', {
        setHeaders: (res, path, stat) => {
          // Cache static assets for 1 day
          res.set('Cache-Control', 'public, max-age=86400');
          
          // Remove any CSP headers from static files
          res.removeHeader('Content-Security-Policy');
          res.removeHeader('Content-Security-Policy-Report-Only');
          res.removeHeader('X-Content-Security-Policy');
          res.removeHeader('X-WebKit-CSP');
          
          // Set additional security headers for HTML files
          if (path.endsWith('.html')) {
            res.set({
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'SAMEORIGIN',
              'X-XSS-Protection': '1; mode=block',
              // Explicitly allow all connections
              'Permissions-Policy': 'accelerometer=*, camera=*, geolocation=*, gyroscope=*, magnetometer=*, microphone=*, payment=*, usb=*'
            });
          }
        }
      }));
      
      // Catch-all handler: send back index.html for SPA routes
      this.app.get('*', (req, res) => {
        // Remove CSP headers before sending HTML
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('Content-Security-Policy-Report-Only');
        res.removeHeader('X-Content-Security-Policy');
        res.removeHeader('X-WebKit-CSP');
        
        res.sendFile('index.html', { root: 'public' });
      });
    }

    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'API endpoint not found'
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Firebase Admin SDK
      await FirebaseService.initialize();
      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
      process.exit(1);
    }
  }

  private setupKeepAlive(): void {
    // Keep server alive for deployment platforms like Render
    if (process.env.RENDER_EXTERNAL_URL) {
      cron.schedule('*/14 * * * *', async () => {
        try {
          const url = process.env.RENDER_EXTERNAL_URL;
          await axios.get(`${url}/api/health`);
          logger.info(`Keep-alive ping sent at ${new Date().toISOString()}`);
        } catch (error) {
          logger.error('Keep-alive ping failed:', error);
        }
      });
    }
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Server running on port ${this.port}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`📖 API Documentation: http://localhost:${this.port}/api/health`);
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start();
}

export default Server;
