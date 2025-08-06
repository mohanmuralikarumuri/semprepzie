// Firebase Configuration and Authentication Manager
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
        this.setupCrossTabCommunication();
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

    // Force email verification for new devices (security measure)
    async forceEmailVerificationForNewDevice(user) {
        try {
            // Always send verification email for new devices
            await user.sendEmailVerification();
            
            // Create a flag to indicate this device needs verification
            const deviceId = this.generateDeviceId();
            const deviceVerificationKey = `device_verified_${deviceId}`;
            
            // Mark this device as NOT verified (even if user.emailVerified is true)
            localStorage.setItem(deviceVerificationKey, 'false');
            
            console.log('Email verification sent for new device security');
            return true;
        } catch (error) {
            console.error('Failed to send verification email:', error);
            return false;
        }
    }

    // Check if current device has been verified
    isCurrentDeviceVerified() {
        const deviceId = this.generateDeviceId();
        const deviceVerificationKey = `device_verified_${deviceId}`;
        const deviceVerified = localStorage.getItem(deviceVerificationKey);
        
        // For new devices, we require device-specific verification
        return deviceVerified === 'true';
    }

    // Mark current device as verified
    markCurrentDeviceAsVerified() {
        const deviceId = this.generateDeviceId();
        const deviceVerificationKey = `device_verified_${deviceId}`;
        localStorage.setItem(deviceVerificationKey, 'true');
        console.log('Device marked as verified:', deviceId);
        
        // Broadcast verification to other tabs
        this.broadcastDeviceVerification();
    }

    // Set/clear new device flag
    setNewDeviceFlag(isNew) {
        const deviceId = this.generateDeviceId();
        const newDeviceKey = `new_device_${deviceId}`;
        if (isNew) {
            localStorage.setItem(newDeviceKey, 'true');
        } else {
            localStorage.removeItem(newDeviceKey);
        }
    }

    // Check if device is flagged as new
    isDeviceFlaggedAsNew() {
        const deviceId = this.generateDeviceId();
        const newDeviceKey = `new_device_${deviceId}`;
        return localStorage.getItem(newDeviceKey) === 'true';
    }

    // Mark device as verified after email confirmation
    markDeviceAsVerifiedAfterEmailConfirmation() {
        if (this.isNewDevice()) {
            console.log('Marking new device as verified after email confirmation');
            this.markCurrentDeviceAsVerified();
            this.setNewDeviceFlag(false); // Clear new device flag
        }
    }
    
    // Broadcast device verification to other tabs
    broadcastDeviceVerification() {
        if (typeof(Storage) !== "undefined") {
            // Use storage event to communicate across tabs
            const timestamp = Date.now();
            const deviceId = this.generateDeviceId();
            localStorage.setItem('device_verified_broadcast_' + deviceId, timestamp.toString());
            
            // Clean up old broadcast messages
            setTimeout(() => {
                localStorage.removeItem('device_verified_broadcast_' + deviceId);
            }, 5000);
        }
    }

    // Broadcast logout to other tabs
    broadcastLogout() {
        if (typeof(Storage) !== "undefined") {
            const timestamp = Date.now();
            localStorage.setItem('logout_broadcast', timestamp.toString());
            
            // Clean up old broadcast messages
            setTimeout(() => {
                localStorage.removeItem('logout_broadcast');
            }, 1000);
        }
    }

    // Set up cross-tab communication listeners
    setupCrossTabCommunication() {
        // Listen for storage events (cross-tab communication)
        window.addEventListener('storage', (e) => {
            // Handle logout broadcasts
            if (e.key === 'logout_broadcast' && e.newValue) {
                console.log('Received logout broadcast from another tab');
                this.handleCrossTabLogout();
            }
            
            // Handle device verification broadcasts
            if (e.key && e.key.startsWith('device_verified_broadcast_') && e.newValue) {
                console.log('Received device verification broadcast from another tab');
                this.handleCrossTabDeviceVerification();
            }
        });
    }

    // Handle logout from another tab
    async handleCrossTabLogout() {
        // Clear local session without firing auth state change to prevent loops
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        
        // Clear current user
        this.currentUser = null;
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }

    // Handle device verification from another tab
    async handleCrossTabDeviceVerification() {
        if (this.currentUser && !this.currentUser.emailVerified) {
            // Reload user to check verification status
            await this.currentUser.reload();
            
            if (this.currentUser.emailVerified) {
                console.log('Email verified in another tab, updating current tab');
                this.markDeviceAsVerifiedAfterEmailConfirmation();
                
                // Trigger auth state change to update UI
                this.authStateListeners.forEach(callback => callback(this.currentUser));
            }
        }
    }

    // Enhanced email verification check for new devices
    async checkEmailAndDeviceVerification(autoMarkVerified = true) {
        if (!this.currentUser) return false;
        
        // Reload user to get fresh verification status
        await this.currentUser.reload();
        
        const emailVerified = this.currentUser.emailVerified;
        const deviceVerified = this.isCurrentDeviceVerified();
        const isNewDevice = this.isNewDevice();
        
        console.log('Verification status:', { 
            emailVerified, 
            deviceVerified, 
            isNewDevice,
            requiresDeviceVerification: isNewDevice && !deviceVerified,
            autoMarkVerified
        });
        
        // For new devices, ALWAYS require device verification regardless of email status
        if (isNewDevice) {
            if (emailVerified && !deviceVerified) {
                // Email is verified but this is a new device
                if (autoMarkVerified) {
                    // Only auto-mark during manual verification flow, not auto-login
                    console.log('New device detected - requiring fresh verification even though email is verified');
                    return false;
                } else {
                    // During auto-login, don't mark as verified
                    console.log('Auto-login: New device detected - not auto-marking as verified');
                    return false;
                }
            } else if (emailVerified && deviceVerified) {
                // Both verified, allow access
                return true;
            } else {
                // Email not verified or device not verified
                return false;
            }
        }
        
        // For known devices, normal verification process
        if (emailVerified && !deviceVerified && autoMarkVerified) {
            // Email is verified, mark device as verified for known devices
            this.markCurrentDeviceAsVerified();
            return true;
        }
        
        return emailVerified && deviceVerified;
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
                isTemporary: true, // Flag to indicate this needs password setup
                emailVerified: false // Needs verification
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
                needsVerification: true,
                message: 'Please check your email for verification link before accessing content.'
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

    // Device tracking and management
    generateDeviceId() {
        let deviceId = localStorage.getItem('semprepzie_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('semprepzie_device_id', deviceId);
        }
        return deviceId;
    }

    async logoutFromOtherDevices(email) {
        try {
            const deviceId = this.generateDeviceId();
            // Use correct server URL (adjust port as needed)
            const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:3001' 
                : '';
            
            const response = await fetch(`${serverUrl}/api/logout-other-devices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, currentDeviceId: deviceId })
            });
            
            if (response.ok) {
                console.log('Other devices logged out successfully');
                return true;
            } else {
                console.warn('Failed to logout other devices:', response.status);
                return false;
            }
        } catch (error) {
            console.log('Device logout not available (server offline):', error.message);
            // Continue with local logout - don't block the login process
            return true;
        }
    }

    // Enhanced device tracking with Firebase integration
    async registerDeviceWithServer(email, deviceId) {
        try {
            const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:3001' 
                : '';
                
            const response = await fetch(`${serverUrl}/api/register-device`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, deviceId })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return null;
        } catch (error) {
            console.log('Device registration failed:', error.message);
            return null;
        }
    }

    async checkDeviceCount(email) {
        try {
            const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:3001' 
                : '';
                
            const response = await fetch(`${serverUrl}/api/check-devices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return { hasMultipleDevices: false, deviceCount: 1 };
        } catch (error) {
            console.log('Device check failed:', error.message);
            return { hasMultipleDevices: false, deviceCount: 1 };
        }
    }

    // Enhanced device detection with localStorage backup
    isNewDevice() {
        const lastLoginDevice = localStorage.getItem('semprepzie_last_login_device');
        const currentDevice = this.generateDeviceId();
        
        // Also check if we have any login history for this browser
        const loginHistory = JSON.parse(localStorage.getItem('semprepzie_login_history') || '[]');
        const hasLoginHistory = loginHistory.length > 0;
        
        console.log('Device check:', { 
            lastLoginDevice, 
            currentDevice, 
            hasLoginHistory, 
            isNew: !lastLoginDevice || lastLoginDevice !== currentDevice || !hasLoginHistory 
        });
        
        return !lastLoginDevice || lastLoginDevice !== currentDevice || !hasLoginHistory;
    }

    markDeviceAsUsed(email) {
        const deviceId = this.generateDeviceId();
        localStorage.setItem('semprepzie_last_login_device', deviceId);
        
        // Update login history
        const loginHistory = JSON.parse(localStorage.getItem('semprepzie_login_history') || '[]');
        const newEntry = {
            email,
            deviceId,
            timestamp: Date.now(),
            verified: true
        };
        
        // Keep only last 5 logins
        loginHistory.unshift(newEntry);
        if (loginHistory.length > 5) {
            loginHistory.splice(5);
        }
        
        localStorage.setItem('semprepzie_login_history', JSON.stringify(loginHistory));
    }

    // Sign in with email and password - Enhanced with device management
    async signIn(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Check if this is a new device (await the Promise)
            const isNewDevice = this.isNewDevice();
            const deviceId = this.generateDeviceId();
            
            console.log(`Login attempt - Email: ${email}, New Device: ${isNewDevice}, Device ID: ${deviceId}`);
            
            // Set new device flag if this is a new device
            if (isNewDevice) {
                this.setNewDeviceFlag(true);
            }
            
            // Get ID token for API calls
            const token = await user.getIdToken();
            localStorage.setItem('authToken', token);
            
            // Register this device with the server
            await this.registerDeviceWithServer(email, deviceId);
            
            // Check device count on server
            const deviceInfo = await this.checkDeviceCount(email);
            console.log('Device count info:', deviceInfo);
            
            // For new devices, ALWAYS require email verification (even if already verified)
            if (isNewDevice) {
                console.log('New device detected - requiring email verification');
                
                // First, logout other devices
                await this.logoutFromOtherDevices(email);
                
                // ALWAYS send verification email for new devices (security measure)
                console.log('Sending email verification for new device security...');
                await this.forceEmailVerificationForNewDevice(user);
                
                // For new devices, we ALWAYS require fresh verification
                return {
                    success: true,
                    user: user,
                    token: token,
                    emailVerified: user.emailVerified,
                    isNewDevice: true,
                    requiresVerification: true, // Always require verification for new devices
                    needsDeviceVerification: true, // Flag to indicate device-specific verification
                    message: 'New device detected! For security, please verify your email again. Other devices have been logged out.'
                };
            }
            
            // For returning devices, check if email is verified
            if (!user.emailVerified) {
                console.log('Returning device but email not verified');
                await user.sendEmailVerification();
                
                return {
                    success: true,
                    user: user,
                    token: token,
                    emailVerified: false,
                    isNewDevice: false,
                    requiresVerification: true,
                    message: 'Please verify your email to access all features.'
                };
            }
            
            // User is verified on known device - proceed normally
            console.log('Verified user on known device - login successful');
            this.markDeviceAsUsed(email);
            
            return {
                success: true,
                user: user,
                token: token,
                emailVerified: user.emailVerified,
                isNewDevice: false,
                requiresVerification: false,
                message: 'Login successful!'
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Create new user account with email verification
    async signUp(email, password, displayName) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update profile with display name
            if (displayName) {
                await user.updateProfile({ displayName: displayName });
            }

            // Send verification email immediately
            await user.sendEmailVerification();

            // Get ID token
            const token = await user.getIdToken();
            localStorage.setItem('authToken', token);

            // Set up single device login
            await this.setupSingleDeviceLogin(user);

            return {
                success: true,
                user: user,
                token: token,
                needsVerification: true,
                message: 'Account created! Please check your email and verify your account before accessing content.'
            };
        } catch (error) {
            console.error('Sign up error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Setup single device login
    async setupSingleDeviceLogin(user) {
        try {
            const deviceId = this.getDeviceId();
            const currentTime = Date.now();
            
            // Store device info in Firebase (you can extend this with Firestore)
            await user.updateProfile({
                displayName: user.displayName,
                photoURL: JSON.stringify({
                    lastDevice: deviceId,
                    lastLogin: currentTime
                })
            });
            
            // Store device info locally
            localStorage.setItem('deviceId', deviceId);
            localStorage.setItem('lastLogin', currentTime.toString());
            
        } catch (error) {
            console.error('Device setup error:', error);
        }
    }

    // Generate unique device ID
    getDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    // Check if user is logged in on another device
    async checkMultipleDevices() {
        if (!this.currentUser) return false;
        
        try {
            const photoURL = this.currentUser.photoURL;
            if (photoURL) {
                const deviceInfo = JSON.parse(photoURL);
                const currentDeviceId = this.getDeviceId();
                
                if (deviceInfo.lastDevice !== currentDeviceId) {
                    // User is logged in on a different device
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Device check error:', error);
            return false;
        }
    }

    // Sign out
    async signOut() {
        try {
            // Broadcast logout to other tabs BEFORE clearing local storage
            this.broadcastLogout();
            
            // Clear device verification status
            const deviceId = this.generateDeviceId();
            const deviceVerificationKey = `device_verified_${deviceId}`;
            localStorage.removeItem(deviceVerificationKey);
            
            // Clear temporary session if exists
            if (this.hasTemporarySession()) {
                this.clearTemporarySession();
                this.currentUser = null;
                this.authStateListeners.forEach(callback => callback(null));
                localStorage.removeItem('authToken');
                return { success: true };
            }
            
            // Regular Firebase sign out
            await auth.signOut();
            localStorage.removeItem('authToken');
            localStorage.removeItem('deviceId');
            localStorage.removeItem('lastLogin');
            localStorage.removeItem('semprepzie_last_login_device');
            
            console.log('User signed out and device verification cleared');
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
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
        if (this.currentUser && !this.hasTemporarySession()) {
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

    // Convert Firebase error codes to user-friendly messages
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account already exists with this email address.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your internet connection.',
            'auth/project-not-found': 'Firebase project configuration error. Please contact support.',
            'auth/invalid-api-key': 'Invalid Firebase configuration. Please contact support.'
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

    // Start monitoring email verification for new devices
    startEmailVerificationMonitoring() {
        if (this.verificationMonitorInterval) {
            clearInterval(this.verificationMonitorInterval);
        }

        this.verificationMonitorInterval = setInterval(async () => {
            if (this.currentUser && !this.currentUser.emailVerified) {
                await this.currentUser.reload();
                
                if (this.currentUser.emailVerified) {
                    console.log('Email verification detected!');
                    
                    // For new devices, mark as verified after email confirmation
                    if (this.isDeviceFlaggedAsNew() || this.isNewDevice()) {
                        this.markDeviceAsVerifiedAfterEmailConfirmation();
                    }
                    
                    // Stop monitoring
                    this.stopEmailVerificationMonitoring();
                    
                    // Trigger auth state change to update UI
                    this.authStateListeners.forEach(callback => callback(this.currentUser));
                    
                    // Broadcast verification to other tabs
                    this.broadcastDeviceVerification();
                }
            }
        }, 2000); // Check every 2 seconds
    }

    // Stop monitoring email verification
    stopEmailVerificationMonitoring() {
        if (this.verificationMonitorInterval) {
            clearInterval(this.verificationMonitorInterval);
            this.verificationMonitorInterval = null;
        }
    }

    // Check if verification is complete (for new devices)
    async checkVerificationComplete() {
        if (!this.currentUser) return false;
        
        await this.currentUser.reload();
        
        const emailVerified = this.currentUser.emailVerified;
        const deviceVerified = this.isCurrentDeviceVerified();
        const isNewDevice = this.isDeviceFlaggedAsNew() || this.isNewDevice();
        
        console.log('Verification check:', { emailVerified, deviceVerified, isNewDevice });
        
        // For new devices, both email and device must be verified
        if (isNewDevice) {
            if (emailVerified && !deviceVerified) {
                // Email just got verified, mark device as verified too
                this.markDeviceAsVerifiedAfterEmailConfirmation();
                return true;
            }
            return emailVerified && deviceVerified;
        }
        
        // For existing devices, just email verification is enough
        return emailVerified;
    }
}

// Create global instance
const firebaseAuth = new FirebaseAuthManager();

// Make it available globally
window.firebaseAuth = firebaseAuth;
