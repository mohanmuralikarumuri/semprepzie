import admin from 'firebase-admin';
import { logger } from '../utils/logger';

export class FirebaseService {
  private static instance: FirebaseService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public static async initialize(): Promise<void> {
    const service = FirebaseService.getInstance();
    await service.init();
  }

  private async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize Firebase Admin SDK
      if (!admin.apps.length) {
        // First try to use the service account JSON file
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                                  `${__dirname}/../semprepzie-315b1-firebase-adminsdk-fbsvc-6e77b6f9cb.json`;
        
        try {
          // Try to load the service account file
          const serviceAccount = require(serviceAccountPath);
          
          if (!serviceAccount.project_id) {
            throw new Error('Service account file missing project_id');
          }
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
          });
          
          logger.info(`Firebase initialized with service account file: ${serviceAccountPath}`);
        } catch (fileError) {
          logger.warn(`Failed to load service account file: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
          
          // Fallback to environment variables
          const projectId = process.env.FIREBASE_PROJECT_ID;
          const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
          const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

          if (!projectId || !privateKey || !clientEmail) {
            throw new Error(`Missing required Firebase environment variables:
              - FIREBASE_PROJECT_ID: ${projectId ? 'Set' : 'Missing'}
              - FIREBASE_PRIVATE_KEY: ${privateKey ? 'Set' : 'Missing'}
              - FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'Set' : 'Missing'}`);
          }

          const serviceAccount = {
            type: 'service_account',
            project_id: projectId,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
            private_key: privateKey,
            client_email: clientEmail,
            client_id: process.env.FIREBASE_CLIENT_ID || '',
            auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
            token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || ''
          };

          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            projectId: projectId
          });
          
          logger.info('Firebase initialized with environment variables');
        }
      }

      this.initialized = true;
      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('Error initializing Firebase Admin SDK:', error);
      throw error;
    }
  }

  public getAuth(): admin.auth.Auth {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized');
    }
    return admin.auth();
  }

  public getFirestore(): admin.firestore.Firestore {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized');
    }
    return admin.firestore();
  }

  public async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.getAuth().verifyIdToken(idToken);
    } catch (error) {
      logger.error('Error verifying ID token:', error);
      throw error;
    }
  }

  public async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().getUserByEmail(email);
    } catch (error) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  public async createUser(userData: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().createUser(userData);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  public async updateUser(uid: string, userData: Partial<admin.auth.UpdateRequest>): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().updateUser(uid, userData);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  public async deleteUser(uid: string): Promise<void> {
    try {
      await this.getAuth().deleteUser(uid);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  public async setCustomUserClaims(uid: string, customClaims: object): Promise<void> {
    try {
      await this.getAuth().setCustomUserClaims(uid, customClaims);
    } catch (error) {
      logger.error('Error setting custom user claims:', error);
      throw error;
    }
  }
}
