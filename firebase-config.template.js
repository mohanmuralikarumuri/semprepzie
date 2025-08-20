// Firebase Configuration and Authentication Manager - SECURE VERSION
// Note: This file should be created locally and not committed to Git
// Copy env.example to .env and fill in your actual Firebase credentials

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "your_api_key_here",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your_project.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "your_project_id",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your_project.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your_sender_id",
    appId: process.env.FIREBASE_APP_ID || "your_app_id",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "your_measurement_id"
};

// For development, fallback to hardcoded config if environment variables are not available
// REMOVE THESE LINES IN PRODUCTION AND USE ONLY ENVIRONMENT VARIABLES
if (!process.env.FIREBASE_API_KEY) {
    // WARNING: Replace these with your actual Firebase config
    // This is only for local development - DO NOT COMMIT REAL CREDENTIALS
    firebaseConfig.apiKey = "your_actual_api_key_here";
    firebaseConfig.authDomain = "your_actual_auth_domain_here";
    firebaseConfig.projectId = "your_actual_project_id_here";
    firebaseConfig.storageBucket = "your_actual_storage_bucket_here";
    firebaseConfig.messagingSenderId = "your_actual_sender_id_here";
    firebaseConfig.appId = "your_actual_app_id_here";
    firebaseConfig.measurementId = "your_actual_measurement_id_here";
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Note: Phone authentication requires Firebase Blaze (pay-as-you-go) plan
// Currently disabled due to billing requirements
// auth.settings.appVerificationDisabledForTesting = true;

// Firebase Auth Helper Functions
class FirebaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.init();
    }

    init() {
        // Check for temporary session first
        const tempUser = localStorage.getItem('tempUser');
        if (tempUser) {
            try {
                this.currentUser = JSON.parse(tempUser);
                this.authStateListeners.forEach(callback => callback(this.currentUser));
                console.log('Restored temporary session for:', this.currentUser.email);
                return;
            } catch (error) {
                console.error('Error restoring temporary session:', error);
                this.clearTemporarySession();
            }
        }

        // Listen for auth state changes (regular Firebase auth)
        auth.onAuthStateChanged((user) => {
            // Clear temporary session if real user signs in
            if (user && this.hasTemporarySession()) {
                this.clearTemporarySession();
            }
            
            this.currentUser = user;
            this.authStateListeners.forEach(callback => callback(user));
            
            if (user) {
                console.log('User signed in:', user.email);
                // Check if email is verified
                if (!user.emailVerified) {
                    console.log('Email not verified, sending verification...');
                    this.sendEmailVerification();
                }
            } else {
                console.log('User signed out');
            }
        });
    }

    // Add auth state change listener
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    // Send email verification
    async sendEmailVerification() {
        try {
            if (this.currentUser && !this.currentUser.emailVerified) {
                await this.currentUser.sendEmailVerification();
                return {
                    success: true,
                    message: 'Verification email sent! Please check your inbox and verify your email.'
                };
            }
            return { success: false, error: 'User not found or already verified' };
        } catch (error) {
            console.error('Email verification error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // ... (rest of the FirebaseAuthManager class remains the same)
    // Add all the other methods from the original firebase-config.js here
}

// Create global instance
const firebaseAuth = new FirebaseAuthManager();

// Make it available globally
window.firebaseAuth = firebaseAuth;
