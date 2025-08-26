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
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://www.gstatic.com",
            "https://www.googletagmanager.com",
            "https://firebase.googleapis.com",
            "https://apis.google.com",
            "https://cdnjs.cloudflare.com"
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdnjs.cloudflare.com"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdnjs.cloudflare.com"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "https:",
            "blob:"
          ],
          connectSrc: [
            "'self'",
            "https://firebase.googleapis.com",
            "https://firestore.googleapis.com",
            "https://identitytoolkit.googleapis.com",
            "https://securetoken.googleapis.com",
            "https://apis.google.com",
            "https://drive.google.com",
            "https://lnbjkowlhordgyhzhpgi.supabase.co",
            "https://fonts.googleapis.com",
            "https://fonts.gstatic.com",
            "https://semprepzie-backend.onrender.com",
            "wss:"
          ],
          frameSrc: [
            "'self'",
            "https://view.officeapps.live.com",
            "https://drive.google.com",
            "https://docs.google.com",
            "https://lnbjkowlhordgyhzhpgi.supabase.co/"
          ],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
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

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static('public'));
      
      // Catch-all handler: send back index.html for SPA routes
      this.app.get('*', (req, res) => {
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
