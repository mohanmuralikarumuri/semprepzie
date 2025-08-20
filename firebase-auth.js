// Firebase Authentication Module
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBPi_Sl2qELAvamN8s7II-dfw3MGqCujlg",
    authDomain: "semprepzie-315b1.firebaseapp.com",
    projectId: "semprepzie-315b1",
    storageBucket: "semprepzie-315b1.firebasestorage.app",
    messagingSenderId: "247116610802",
    appId: "1:247116610802:web:149f4ee8e5c83c0567a46b",
    measurementId: "G-Q9Y7ZBCV4V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Export auth instance and functions
export { 
    auth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
};

// Firebase Auth Helper Functions
export class FirebaseAuthManager {
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
        onAuthStateChanged(auth, (user) => {
            // Clear temporary session if real user signs in
            if (user && this.hasTemporarySession()) {
                this.clearTemporarySession();
            }
            
            this.currentUser = user;
            this.authStateListeners.forEach(callback => callback(user));
            
            if (user) {
                console.log('User signed in:', user.email);
                this.updateUI(true);
            } else {
                console.log('User signed out');
                this.updateUI(false);
            }
        });
    }

    // Add auth state change listener
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    // Sign in with email link (passwordless authentication for first-time users)
    async signInWithEmailLink(email) {
        try {
            // For our use case, we'll create a temporary session for email-only login
            // This will allow students to access without password initially
            
            // Create a mock user object for first-time access
            const mockUser = {
                email: email,
                displayName: `Student ${email.split('@')[0].slice(-4).toUpperCase()}`,
                uid: email.replace(/[^a-zA-Z0-9]/g, ''), // Simple UID from email
                isTemporary: true // Flag to indicate this needs password setup
            };
            
            // Store temporary session
            localStorage.setItem('tempUser', JSON.stringify(mockUser));
            localStorage.setItem('tempAuthToken', 'temp_' + Date.now());
            
            // Trigger auth state change manually for temporary user
            this.currentUser = mockUser;
            this.authStateListeners.forEach(callback => callback(mockUser));
            
            return {
                success: true,
                user: mockUser,
                isTemporary: true,
                message: 'Temporary access granted. Please set a password for future logins.'
            };
        } catch (error) {
            console.error('Email link sign in error:', error);
            return {
                success: false,
                error: 'Email authentication failed. Please try setting up a password.'
            };
        }
    }

    // Check if user has temporary session
    hasTemporarySession() {
        return localStorage.getItem('tempUser') !== null;
    }

    // Clear temporary session
    clearTemporarySession() {
        localStorage.removeItem('tempUser');
        localStorage.removeItem('tempAuthToken');
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Get ID token for API calls
            const token = await user.getIdToken();
            localStorage.setItem('authToken', token);
            
            return {
                success: true,
                user: user,
                token: token
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Create new user account
    async signUp(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with display name
            if (displayName) {
                await updateProfile(user, { displayName: displayName });
            }

            // Get ID token
            const token = await user.getIdToken();
            localStorage.setItem('authToken', token);

            return {
                success: true,
                user: user,
                token: token
            };
        } catch (error) {
            console.error('Sign up error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign out
    async signOut() {
        try {
            // Clear temporary session if exists
            if (this.hasTemporarySession()) {
                this.clearTemporarySession();
                this.currentUser = null;
                this.authStateListeners.forEach(callback => callback(null));
                localStorage.removeItem('authToken');
                return { success: true };
            }
            
            // Regular Firebase sign out
            await signOut(auth);
            localStorage.removeItem('authToken');
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Send password reset email
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Get current user's ID token
    async getIdToken() {
        if (this.currentUser) {
            try {
                return await this.currentUser.getIdToken();
            } catch (error) {
                console.error('Error getting ID token:', error);
                return null;
            }
        }
        return null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Update UI based on auth state
    updateUI(isAuthenticated) {
        const loginSection = document.getElementById('loginPage');
        const mainSite = document.getElementById('mainSite');
        const authControls = document.getElementById('authControls');

        if (isAuthenticated) {
            if (loginSection) loginSection.classList.add('hidden');
            if (mainSite) mainSite.classList.remove('hidden');
            
            // Update auth controls
            if (authControls) {
                authControls.innerHTML = `
                    <div class="user-info">
                        <span>Welcome, ${this.currentUser.displayName || this.currentUser.email}</span>
                        <button onclick="firebaseAuth.signOut()" class="logout-btn">Logout</button>
                    </div>
                `;
            }
        } else {
            if (loginSection) loginSection.classList.remove('hidden');
            if (mainSite) mainSite.classList.add('hidden');
            
            if (authControls) {
                authControls.innerHTML = '';
            }
        }
    }

    // Convert Firebase error codes to user-friendly messages
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account already exists with this email address.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your internet connection.'
        };

        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }

    // Verify token with backend
    async verifyTokenWithBackend(token) {
        try {
            const response = await fetch('/api/auth/verify-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            return await response.json();
        } catch (error) {
            console.error('Token verification error:', error);
            return { valid: false, error: error.message };
        }
    }
}

// Create global instance
export const firebaseAuth = new FirebaseAuthManager();

// Make it available globally for legacy code
window.firebaseAuth = firebaseAuth;
