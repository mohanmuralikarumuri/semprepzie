// Valid student numbers (extracted from college IDs)
const validStudentNumbers = [
    '0501', '0567', '0568', '0569', '0570', '0571', '0572', '0573', '0574', '0575',
    '0576', '0577', '0578', '0579', '0580', '0581', '0582', '0583', '0584', '0585',
    '0586', '0587', '0588', '0589', '0590', '0591', '0592', '0593', '0594', '0595',
    '0596', '0597', '0598', '0599', '05A0', '05A1', '05A2', '05A3', '05A4', '05A5',
    '05A6', '05A7', '05A8', '05A9', '05B0', '05B1', '05B2', '05B3', '05B4', '05B5',
    '05B6', '05B7', '05C3', '05B8', '05B9', '05C0', '05C1', '05C2', '05C4', '05C5',
    '05C6', '05C7', '05C8', '05C9', '05D0', '05D1', '0510', '0511', '0512', '0513'
];

// College email domain
const COLLEGE_DOMAIN = '@aitsrajampet.ac.in';

// Theme management
let currentTheme = 'light';
let isLoggedIn = false;
let authMethod = 'firebase'; // Only Firebase now

// Firebase Auth Integration
let firebaseAuthManager = null;

// Initialize Firebase Auth when available
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Set up event listeners for auth elements
    setupEventListeners();
    
    // Wait for Firebase Auth to be available
    setTimeout(() => {
        if (window.firebaseAuth) {
            firebaseAuthManager = window.firebaseAuth;
            
            // Listen for auth state changes
            firebaseAuthManager.onAuthStateChange(async (user) => {
                console.log('Auth state changed:', user ? `${user.email} (verified: ${user.emailVerified})` : 'logged out');
                
                if (user) {
                    // Validate user email domain and student number
                    const userEmail = user.email || (user.photoURL ? JSON.parse(user.photoURL).email : '');
                    
                    if (validateCollegeEmail(userEmail)) {
                        // For auto-login (page load), check if this is a new device
                        const isNewDevice = firebaseAuthManager.isNewDevice();
                        const deviceVerified = firebaseAuthManager.isCurrentDeviceVerified();
                        
                        console.log('Auto-login check:', { 
                            isNewDevice, 
                            deviceVerified, 
                            emailVerified: user.emailVerified,
                            email: userEmail 
                        });
                        
                        // If it's a new device, don't auto-login - require proper verification flow
                        if (isNewDevice && !deviceVerified) {
                            console.log('New device detected on auto-login - requiring manual verification');
                            isLoggedIn = false;
                            authMethod = 'firebase-pending';
                            updateAuthenticationControls();
                            
                            // Show login page to force proper verification flow
                            showLoginPage();
                            showNotification('🔐 New device detected. Please log in to verify this device.', 'info');
                            return;
                        }
                        
                        // Check both email and device verification for existing devices
                        const isFullyVerified = await firebaseAuthManager.checkEmailAndDeviceVerification(false);
                        
                        if (isFullyVerified) {
                            // User is fully authenticated
                            isLoggedIn = true;
                            authMethod = 'firebase';
                            updateAuthenticationControls();
                            
                            // Clear any verification prompts
                            clearVerificationPrompts();
                            
                            // Check for requested section
                            const requestedSection = sessionStorage.getItem('requestedSection');
                            if (requestedSection) {
                                sessionStorage.removeItem('requestedSection');
                                showSection(requestedSection);
                            }
                            
                            console.log('User fully authenticated:', userEmail);
                        } else {
                            // Email or device not verified - user cannot access protected content
                            isLoggedIn = false;
                            authMethod = 'firebase-pending';
                            updateAuthenticationControls();
                            console.log('User signed in but verification incomplete:', userEmail);
                        }
                    } else {
                        // Invalid email - sign out the user
                        firebaseAuthManager.signOut();
                        showNotification('Access denied: You are not in the authorized student list.', 'error');
                    }
                } else {
                    isLoggedIn = false;
                    authMethod = 'none';
                    updateAuthenticationControls();
                    
                    // Clear any verification checkers
                    if (window.verificationChecker) {
                        clearInterval(window.verificationChecker);
                    }
                }
            });
        }
    }, 1000);
});

// Setup authentication controls in the navigation
function setupAuthenticationControls() {
    const authControls = document.getElementById('authControls');
    if (authControls) {
        updateAuthenticationControls();
    }
}

// Update authentication controls based on login state
function updateAuthenticationControls() {
    const authControls = document.getElementById('authControls');
    if (!authControls) return;
    
    if (isLoggedIn) {
        // Show logout button
        authControls.innerHTML = `
            <div class="user-info">
                <span class="user-email">${firebaseAuthManager.currentUser?.email || 'User'}</span>
                <button onclick="handleLogout()" class="auth-btn logout-btn">🚪 Logout</button>
            </div>
        `;
    } else {
        // Show login button
        authControls.innerHTML = `
            <button onclick="showLoginModal()" class="auth-btn login-btn">🔐 Login</button>
        `;
    }
}

// Show login modal when accessing protected content
function showLoginModal() {
    // Show login page
    document.getElementById('mainSite').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

// Handle logout
async function handleLogout() {
    if (firebaseAuthManager) {
        try {
            await firebaseAuthManager.signOut();
            isLoggedIn = false;
            authMethod = 'none';
            updateAuthenticationControls();
            showNotification('Logged out successfully! 👋', 'success');
        } catch (error) {
            showNotification('Error logging out', 'error');
        }
    }
}

// Check if user is authenticated for protected content
function requireAuthentication(feature) {
    if (!isLoggedIn) {
        showNotification(`Please login to access ${feature}`, 'info');
        showLoginModal();
        return false;
    }
    return true;
}

// Protected content access functions
function accessTheoryContent() {
    if (requireAuthentication('Theory Content')) {
        showSection('theory');
        loadTheoryContent();
    }
}

function accessLabContent() {
    if (requireAuthentication('Lab Materials')) {
        showSection('lab');
        loadLabContent();
    }
}

function accessMincodeContent() {
    if (requireAuthentication('Minimized Code')) {
        showSection('mincode');
        loadMincodeContent();
    }
}

// Show main site (home page is always accessible)
function showMainSite() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainSite').classList.remove('hidden');
    updateAuthenticationControls();
}

// Show login page
function showLoginPage() {
    document.getElementById('mainSite').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

// Email and student number validation functions
function validateCollegeEmail(email) {
    if (!email || !email.endsWith(COLLEGE_DOMAIN)) {
        return false;
    }
    
    // Extract student number from email
    const studentNumber = extractStudentNumber(email);
    return validStudentNumbers.includes(studentNumber);
}

function extractStudentNumber(email) {
    // Extract the part before @ and get the last 4 characters
    // e.g., 23701A05B8@aitsrajampet.ac.in -> 05B8
    const localPart = email.split('@')[0];
    if (localPart.length >= 4) {
        return localPart.slice(-4).toUpperCase();
    }
    return '';
}

function getStudentIdFromEmail(email) {
    // Extract full student ID from email
    // e.g., 23701A05B8@aitsrajampet.ac.in -> 23701A05B8
    return email.split('@')[0].toUpperCase();
}

// Global test function for debugging
window.testContentLoading = function() {
    console.log('=== TESTING CONTENT LOADING ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('theoryContent element:', document.getElementById('theoryContent'));
    console.log('labContent element:', document.getElementById('labContent'));
    
    loadTheoryContent();
    loadLabContent();
    loadMincodeContent();
    
    console.log('=== TEST COMPLETE ===');
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Show loading screen first
    setTimeout(() => {
        console.log('Loading screen timeout complete');
        document.getElementById('loadingScreen').classList.add('hidden');
        
        // Always show home page first (no login required for home)
        showMainSite();
        showSection('home');
        
        // Initialize hero effects
        initializeHeroEffects();
        
        // Setup authentication controls
        setupAuthenticationControls();
        
    }, 1500);

    // Set initial theme
    updateTheme();
    
    // Create floating particles
    createFloatingParticles();
    
    // Add stagger animation to course cards
    setTimeout(addStaggerAnimation, 2000);
});

// Initialize hero effects
function initializeHeroEffects() {
    // Add glowing orbs to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        // Create glowing orbs
        for (let i = 0; i < 3; i++) {
            const glow = document.createElement('div');
            glow.className = 'hero-glow';
            hero.appendChild(glow);
        }
        
        // Create particles container
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        hero.appendChild(particlesContainer);
        
        // Generate particles
        setInterval(() => {
            createParticle(particlesContainer);
        }, 800);
        
        // Add shimmer effect to title
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            setInterval(() => {
                heroTitle.classList.add('shimmer');
                setTimeout(() => {
                    heroTitle.classList.remove('shimmer');
                }, 3000);
            }, 8000);
        }
        
        // Add interactive mouse effects
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Move glowing orbs based on mouse position
            const glows = hero.querySelectorAll('.hero-glow');
            glows.forEach((glow, index) => {
                const intensity = (index + 1) * 0.3;
                glow.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
            });
        });
    }
}

// Create individual particle
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const animationDuration = Math.random() * 10 + 10;
    const opacity = Math.random() * 0.5 + 0.3;
    
    // Random colors
    const colors = ['var(--primary-color)', 'var(--secondary-color)', 'var(--accent-color)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        background: ${color};
        animation-duration: ${animationDuration}s;
        opacity: ${opacity};
    `;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, animationDuration * 1000);
}

// Firebase Authentication Functions
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    clearErrorMessages();
    clearVerificationPrompts();
    resetFormStates();
}

function showForgotPassword() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.remove('hidden');
    clearErrorMessages();
    clearVerificationPrompts();
}

function showEmailVerificationPrompt(email, type = 'email-verification') {
    const errorDiv = document.getElementById('loginError') || document.getElementById('phoneError');
    
    // Create verification prompt
    const verificationPrompt = document.createElement('div');
    verificationPrompt.id = 'verificationPrompt';
    verificationPrompt.style.cssText = `
        margin-top: 15px;
        padding: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border-radius: 12px;
        text-align: center;
        animation: slideDown 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    `;
    
    const isNewDevice = type === 'new-device';
    const icon = isNewDevice ? '🔐' : '📧';
    const title = isNewDevice ? 'New Device Verification' : 'Email Verification Required';
    const message = isNewDevice 
        ? `Security verification required for this new device`
        : `Please verify your email address`;
    
    verificationPrompt.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 15px;">${icon}</div>
        <h4 style="margin: 0 0 10px 0; color: white;">${title}</h4>
        <p style="margin: 0 0 15px 0; opacity: 0.9; font-size: 14px;">
            ${message} for <strong>${email}</strong>
        </p>
        <p style="margin: 0 0 20px 0; opacity: 0.8; font-size: 13px;">
            ${isNewDevice 
                ? 'We\'ve sent a verification email. Please check your inbox and click the link.'
                : 'Please check your inbox and click the verification link to access your account.'
            }
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="resendVerificationEmail('${email}')" 
                    style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                📤 Resend Email
            </button>
            <button onclick="checkEmailVerification()" 
                    style="background: rgba(255,255,255,0.9); color: #059669; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                ✓ I've Verified
            </button>
        </div>
    `;
    
    // Remove existing prompts
    const existingPrompt = document.getElementById('verificationPrompt');
    if (existingPrompt) {
        existingPrompt.remove();
    }
    
    // Add new prompt to the appropriate form
    const targetForm = document.getElementById('loginForm').classList.contains('hidden') 
        ? document.getElementById('phoneLoginForm') 
        : document.getElementById('loginForm');
    targetForm.appendChild(verificationPrompt);
    
    // Send verification email automatically if new device
    if (isNewDevice) {
        resendVerificationEmail(email);
        
        // Start monitoring for email verification on new devices
        if (firebaseAuthManager && firebaseAuthManager.startEmailVerificationMonitoring) {
            firebaseAuthManager.startEmailVerificationMonitoring();
        }
    }
    
    // Auto-check verification every 5 seconds
    const verificationChecker = setInterval(async () => {
        if (firebaseAuthManager && firebaseAuthManager.currentUser) {
            // Use the enhanced verification check for new devices
            const isVerified = isNewDevice 
                ? await firebaseAuthManager.checkVerificationComplete()
                : await firebaseAuthManager.checkEmailAndDeviceVerification();
            
            if (isVerified) {
                clearInterval(verificationChecker);
                verificationPrompt.remove();
                
                // Stop monitoring if it was started
                if (firebaseAuthManager.stopEmailVerificationMonitoring) {
                    firebaseAuthManager.stopEmailVerificationMonitoring();
                }
                
                // Update login state
                isLoggedIn = true;
                authMethod = 'firebase';
                
                // Show main site and check for requested section
                showMainSite();
                updateAuthenticationControls();
                
                const requestedSection = sessionStorage.getItem('requestedSection');
                if (requestedSection) {
                    sessionStorage.removeItem('requestedSection');
                    showSection(requestedSection);
                }
                
                showNotification('Verification successful! Welcome to Semprepzie! 🎉', 'success');
            }
        }
    }, 5000);
    
    // Store checker to clear it later
    window.verificationChecker = verificationChecker;
}

async function resendVerificationEmail(email) {
    if (firebaseAuthManager) {
        try {
            const result = await firebaseAuthManager.sendEmailVerification();
            if (result.success) {
                showNotification('Verification email sent! 📧', 'success');
            } else {
                showNotification('Failed to send verification email', 'error');
            }
        } catch (error) {
            showNotification('Failed to send verification email', 'error');
        }
    }
}

async function checkEmailVerification() {
    if (firebaseAuthManager) {
        try {
            await firebaseAuthManager.currentUser.reload();
            
            // Use the enhanced verification check that handles new devices
            const isVerified = await firebaseAuthManager.checkVerificationComplete();
            
            if (isVerified) {
                // Clear verification prompts
                clearVerificationPrompts();
                
                // Stop monitoring if it was started
                if (firebaseAuthManager.stopEmailVerificationMonitoring) {
                    firebaseAuthManager.stopEmailVerificationMonitoring();
                }
                
                showMainSite();
                showNotification('Email verified successfully! Welcome to Semprepzie! 🎉', 'success');
            } else {
                showNotification('Email not yet verified. Please check your inbox.', 'warning');
            }
        } catch (error) {
            showNotification('Failed to check verification status', 'error');
        }
    }
}

async function checkEmailVerification() {
    if (firebaseAuthManager && firebaseAuthManager.getCurrentUser()) {
        // Use the enhanced verification check
        const isVerified = await firebaseAuthManager.checkEmailAndDeviceVerification();
        
        if (isVerified) {
            const verificationPrompt = document.getElementById('verificationPrompt');
            if (verificationPrompt) {
                verificationPrompt.remove();
            }
            if (window.verificationChecker) {
                clearInterval(window.verificationChecker);
            }
            
            // Update login state
            isLoggedIn = true;
            authMethod = 'firebase';
            
            // Show main site and update controls
            showMainSite();
            updateAuthenticationControls();
            
            // Check for requested section
            const requestedSection = sessionStorage.getItem('requestedSection');
            if (requestedSection) {
                sessionStorage.removeItem('requestedSection');
                showSection(requestedSection);
            }
            
            showNotification('Email verified! Welcome to Semprepzie! 🎉', 'success');
        } else {
            showNotification('Email not yet verified. Please check your inbox and click the verification link.', 'error');
        }
    }
}
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    if (!email || !password) {
        showError(errorDiv, 'Please enter both email and password');
        return;
    }

    // Validate college email domain
    if (!email.endsWith(COLLEGE_DOMAIN)) {
        showError(errorDiv, `Please use your college email ending with ${COLLEGE_DOMAIN}`);
        return;
    }

    // Validate student number
    if (!validateCollegeEmail(email)) {
        const studentNumber = extractStudentNumber(email);
        showError(errorDiv, `Access denied: Student number "${studentNumber}" is not in the authorized list.`);
        return;
    }

    if (!firebaseAuthManager) {
        showError(errorDiv, 'Authentication system not ready. Please try again.');
        return;
    }

    try {
        showLoading(true);
        console.log(`Attempting login for: ${email}`);
        
        const result = await firebaseAuthManager.signIn(email, password);
        console.log('Login result:', result);
        
        if (result.success) {
            if (result.requiresVerification) {
                // User needs email verification
                console.log('Email verification required');
                showEmailVerificationPrompt(email, result.isNewDevice ? 'new-device' : 'email-verification');
                
                if (result.isNewDevice) {
                    showNotification('🔐 New device detected! Please verify your email to continue. Other devices have been logged out for security.', 'info');
                } else {
                    showNotification('📧 Please verify your email to access all features.', 'info');
                }
            } else {
                // Login successful and verified
                console.log('Login successful, user verified');
                clearErrorMessages();
                showMainSite();
                isLoggedIn = true;
                authMethod = 'firebase';
                updateAuthenticationControls();
                
                // Check for requested section
                const requestedSection = sessionStorage.getItem('requestedSection');
                if (requestedSection) {
                    sessionStorage.removeItem('requestedSection');
                    showSection(requestedSection);
                    showNotification(`✅ Login successful! Loading ${requestedSection}...`, 'success');
                } else {
                    showNotification('✅ Login successful! Welcome back! 🎉', 'success');
                }
            }
        } else {
            showError(errorDiv, result.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorDiv, 'Login failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handlePasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    const errorDiv = document.getElementById('resetError');
    const successDiv = document.getElementById('resetSuccess');

    if (!email) {
        showError(errorDiv, 'Please enter your email address');
        return;
    }

    // Validate college email domain
    if (!email.endsWith(COLLEGE_DOMAIN)) {
        showError(errorDiv, `Please use your college email ending with ${COLLEGE_DOMAIN}`);
        return;
    }

    if (!firebaseAuthManager) {
        showError(errorDiv, 'Authentication system not ready. Please try again.');
        return;
    }

    try {
        showLoading(true);
        const result = await firebaseAuthManager.resetPassword(email);
        
        if (result.success) {
            showSuccess(successDiv, 'Password reset email sent! Check your inbox.');
            errorDiv.textContent = '';
        } else {
            showError(errorDiv, result.error);
        }
    } catch (error) {
        showError(errorDiv, 'Failed to send reset email. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Logout function
async function logout() {
    try {
        if (firebaseAuthManager) {
            await firebaseAuthManager.signOut();
        }
        
        isLoggedIn = false;
        authMethod = 'none';
        showLoginPage();
        clearProtectedContent();
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// UI Helper Functions
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.color = '#ef4444';
    }
}

function showSuccess(element, message) {
    if (element) {
        element.textContent = message;
        element.style.color = '#10b981';
    }
}

function clearVerificationPrompts() {
    const verificationPrompt = document.getElementById('verificationPrompt');
    if (verificationPrompt) {
        verificationPrompt.remove();
    }
    
    if (window.verificationChecker) {
        clearInterval(window.verificationChecker);
        window.verificationChecker = null;
    }
    
    // Stop email verification monitoring if it's running
    if (firebaseAuthManager && firebaseAuthManager.stopEmailVerificationMonitoring) {
        firebaseAuthManager.stopEmailVerificationMonitoring();
    }
}

function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message, .success-message');
    errorElements.forEach(el => el.textContent = '');
}

function resetFormStates() {
    // Clear form values
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
    
    // Clear any pending sessions
    window.pendingPhoneEmail = null;
}

function showLoading(show) {
    const buttons = document.querySelectorAll('.auth-btn');
    buttons.forEach(btn => {
        btn.disabled = show;
        btn.textContent = show ? 'Loading...' : btn.getAttribute('data-original-text') || btn.textContent;
        if (!show && !btn.getAttribute('data-original-text')) {
            btn.setAttribute('data-original-text', btn.textContent);
        }
    });
}

function showMainSite() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainSite').classList.remove('hidden');
    
    const requestedSection = sessionStorage.getItem('requestedSection');
    if (requestedSection) {
        showSection(requestedSection);
        sessionStorage.removeItem('requestedSection');
    } else {
        showSection('home');
    }
}

function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainSite').classList.add('hidden');
}

// Load protected content
function loadProtectedContent() {
    loadTheoryContent();
    loadLabContent();
    loadMincodeContent();
}

// Clear protected content
function clearProtectedContent() {
    const theoryContent = document.getElementById('theoryContent');
    const labContent = document.getElementById('labContent');
    const mincodeContent = document.getElementById('mincodeContent');
    
    if (theoryContent) theoryContent.innerHTML = '<p>Please login to access content</p>';
    if (labContent) labContent.innerHTML = '<p>Please login to access content</p>';
    if (mincodeContent) mincodeContent.innerHTML = '<p>Please login to access content</p>';
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">${type === 'success' ? '✅' : '❌'}</span>
            <div style="font-size: 14px;">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Legacy notification function (kept for compatibility)
function showLoginNotification(message, type) {
    showNotification(message, type);
}

// Allow Enter key for login
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !document.getElementById('loginPage').classList.contains('hidden')) {
        const activeForm = document.querySelector('.auth-form:not(.hidden)');
        if (activeForm) {
            if (activeForm.id === 'loginForm') {
                handleLogin();
            } else if (activeForm.id === 'phoneLoginForm') {
                // Check if OTP section is visible
                const otpSection = document.getElementById('otpSection');
                if (!otpSection.classList.contains('hidden')) {
                    verifyPhoneOTP();
                } else {
                    sendPhoneOTP();
                }
            } else if (activeForm.id === 'forgotPasswordForm') {
                handlePasswordReset();
            }
        }
    }
});

// Logout functionality (now handled by the main logout function)
// function logout() - removed, using the updated logout function above

// Add login/logout button to navigation  
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const authControls = document.getElementById('authControls');
        if (authControls && !isLoggedIn) {
            authControls.innerHTML = `
                <button id="loginToggle" onclick="toggleLogin()" class="login-btn">
                    🔐 Login
                </button>
            `;
        }
    }, 100);
});

// Toggle login/logout
function toggleLogin() {
    if (isLoggedIn) {
        logout();
    } else {
        document.getElementById('mainSite').classList.add('hidden');
        document.getElementById('loginPage').classList.remove('hidden');
        
        setTimeout(() => {
            const loginInput = document.getElementById('loginInput');
            if (loginInput) {
                loginInput.focus();
            }
        }, 100);
    }
}

// Update login button text based on status
function updateLoginButton() {
    const loginToggle = document.getElementById('loginToggle');
    if (loginToggle) {
        if (isLoggedIn) {
            loginToggle.innerHTML = '🔓 Logout';
            loginToggle.classList.add('logged-in');
        } else {
            loginToggle.innerHTML = '🔐 Login';
            loginToggle.classList.remove('logged-in');
        }
    }
}

// Section navigation with login check
function showSection(sectionName) {
    // Check if section requires login
    if ((sectionName === 'theory' || sectionName === 'lab' || sectionName === 'mincode') && !isLoggedIn) {
        // Store the requested section and show login modal
        sessionStorage.setItem('requestedSection', sectionName);
        const sectionDisplayName = sectionName === 'theory' ? 'Theory Content' : 
                                   sectionName === 'lab' ? 'Lab Materials' : 'Minimized Code';
        showNotification(`Please login to access ${sectionDisplayName}`, 'info');
        showLoginModal();
        return;
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Load content dynamically for protected sections
    if (sectionName === 'theory' && isLoggedIn) {
        loadTheoryContent();
    } else if (sectionName === 'lab' && isLoggedIn) {
        loadLabContent();
    } else if (sectionName === 'mincode' && isLoggedIn) {
        loadMincodeContent();
    }

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        link.style.color = 'var(--text-primary)';
    });
    
    // Find and highlight current nav item
    const currentNavItem = Array.from(navLinks).find(link => 
        link.onclick && link.onclick.toString().includes(sectionName)
    );
    if (currentNavItem) {
        currentNavItem.classList.add('active');
        currentNavItem.style.color = 'var(--primary-color)';
    }
    
    // Close mobile menu after selection
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    if (navMenu && mobileToggle) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = '';
        body.style.position = '';
        body.style.width = '';
    }
}

// Show login prompt when trying to access restricted sections
function showLoginPrompt(sectionName) {
    const sectionTitle = sectionName === 'theory' ? 'Theory Courses' : 
                        sectionName === 'lab' ? 'Lab Materials' : 'Minimized Code';
    
    document.getElementById('mainSite').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    
    // Update login page title to show what they're trying to access
    const loginContainer = document.querySelector('.login-container h1');
    if (loginContainer) {
        loginContainer.innerHTML = `🎓 Login Required`;
    }
    
    // Add a message about what they're trying to access
    let accessMessage = document.getElementById('accessMessage');
    if (!accessMessage) {
        accessMessage = document.createElement('div');
        accessMessage.id = 'accessMessage';
        accessMessage.style.cssText = `
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        `;
        
        const loginContainer = document.querySelector('.login-container');
        const authToggle = document.querySelector('.auth-toggle');
        if (authToggle) {
            loginContainer.insertBefore(accessMessage, authToggle);
        }
    }
    
    const sectionEmoji = sectionName === 'theory' ? '📚' : 
                        sectionName === 'lab' ? '🔬' : '💻';
    
    accessMessage.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;">
            <span style="font-size: 18px;">${sectionEmoji}</span>
            <strong>Accessing ${sectionTitle}</strong>
        </div>
        <div style="opacity: 0.9; font-size: 13px;">
            Please login with your college email to continue to ${sectionTitle}
        </div>
    `;
    
    // Focus on email input field
    setTimeout(() => {
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) {
            emailInput.focus();
        }
    }, 100);
}

// Load Theory content dynamically
function loadTheoryContent() {
    console.log('Loading theory content...');
    const theoryContent = document.getElementById('theoryContent');
    console.log('Theory content element:', theoryContent);
    if (!theoryContent) return; // Only check if element exists
    
    // Clear any existing content first
    theoryContent.innerHTML = '';
    
    const courseCards = `
        <div class="course-card" onclick="openCourse('course1')" data-tilt>
            <div class="course-content">
                <div class="course-icon">📐</div>
                <h3>Object Oriented Analysis and Design</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course2')" data-tilt>
            <div class="course-content">
                <div class="course-icon">⚛️</div>
                <h3>Introduction to Quantum Technology and Applications</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course3')" data-tilt>
            <div class="course-content">
                <div class="course-icon">🧪</div>
                <h3>Artificial Intelligence</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course4')" data-tilt>
            <div class="course-content">
                <div class="course-icon">💻</div>
                <h3>Computer Networks</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course5')" data-tilt>
            <div class="course-content">
                <div class="course-icon">📚</div>
                <h3>English for Competitive Examination</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course6')" data-tilt>
            <div class="course-content">
                <div class="course-icon">⚙️</div>
                <h3>Automata Theory and Compiler Design</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
    `;
    
    theoryContent.innerHTML = courseCards;
    console.log('Theory content loaded, cards added:', courseCards.length);
    
    // Add entrance animation to newly loaded cards
    setTimeout(() => {
        const cards = theoryContent.querySelectorAll('.course-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 50);
}

// Load Lab content dynamically
function loadLabContent() {
    console.log('Loading lab content...');
    const labContent = document.getElementById('labContent');
    console.log('Lab content element:', labContent);
    if (!labContent) return; // Only check if element exists
    
    // Clear any existing content first
    labContent.innerHTML = '';
    
    const labCards = `
        <div class="lab-card" onclick="openLab('lab1')">
            <h3>Artificial Intelligence Lab</h3>
            <p>10 Exercises</p>
            <div class="lab-icon">👨‍💻</div>
        </div>
        <div class="lab-card" onclick="openLab('lab2')">
            <h3>Computer Networks Lab</h3>
            <p>10 Exercises</p>
            <div class="lab-icon">🔌</div>
        </div>
        <div class="lab-card" onclick="openLab('lab3')">
            <h3>Full Stack Development Lab</h3>
            <p>10 Exercises</p>
            <div class="lab-icon">🔬</div>
        </div>
        <div class="lab-card" onclick="openLab('lab4')">
            <h3>Tinkering Lab</h3>
            <p>10 Exercises</p>
            <div class="lab-icon">⚗️</div>
        </div>
    `;
    
    labContent.innerHTML = labCards;
    console.log('Lab content loaded, cards added:', labCards.length);
    
    // Add entrance animation to newly loaded cards
    setTimeout(() => {
        const cards = labContent.querySelectorAll('.lab-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 50);
}

// Load Minimized Code content dynamically
function loadMincodeContent() {
    const mincodeContent = document.getElementById('mincodeContent');
    if (!mincodeContent) return; // Only check if element exists
    
    // Clear any existing content first
    mincodeContent.innerHTML = '';
    
    const codeCards = `
        <div class="code-card">
            <div class="code-icon">🔧</div>
            <h3>Algorithms</h3>
            <p>Optimized code snippets for sorting, searching, and graph algorithms</p>
            <button class="view-btn" onclick="viewCode('algorithms')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">📊</div>
            <h3>Data Structures</h3>
            <p>Efficient implementations of arrays, trees, stacks, and queues</p>
            <button class="view-btn" onclick="viewCode('datastructures')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🌐</div>
            <h3>Web Development</h3>
            <p>Clean and minimal HTML, CSS, and JavaScript code</p>
            <button class="view-btn" onclick="viewCode('webdev')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🖥️</div>
            <h3>System Programming</h3>
            <p>Low-level programming and system optimization</p>
            <button class="view-btn" onclick="viewCode('system')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🤖</div>
            <h3>Machine Learning</h3>
            <p>Simplified ML algorithms and neural networks</p>
            <button class="view-btn" onclick="viewCode('ml')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">📱</div>
            <h3>Mobile Development</h3>
            <p>Cross-platform mobile app code snippets</p>
            <button class="view-btn" onclick="viewCode('mobile')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🔐</div>
            <h3>Cryptography</h3>
            <p>Security algorithms and encryption methods</p>
            <button class="view-btn" onclick="viewCode('crypto')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🚀</div>
            <h3>Performance</h3>
            <p>Code optimization and performance patterns</p>
            <button class="view-btn" onclick="viewCode('performance')">View Code</button>
        </div>
    `;
    
    mincodeContent.innerHTML = codeCards;
    
    // Add entrance animation to newly loaded cards
    setTimeout(() => {
        const cards = mincodeContent.querySelectorAll('.code-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 50);
}

// Clear content when logging out
function clearProtectedContent() {
    const theoryContent = document.getElementById('theoryContent');
    const labContent = document.getElementById('labContent');
    const mincodeContent = document.getElementById('mincodeContent');
    
    if (theoryContent) theoryContent.innerHTML = '';
    if (labContent) labContent.innerHTML = '';
    if (mincodeContent) mincodeContent.innerHTML = '';
}

// View code function for minimized code section
function viewCode(codeType) {
    // Create a modal for code viewing
    const codeModal = document.createElement('div');
    codeModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const codeContent = document.createElement('div');
    codeContent.style.cssText = `
        background: var(--bg-card);
        border-radius: 15px;
        padding: 30px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: codeModalIn 0.3s ease-out;
    `;
    
    const codeMap = {
        algorithms: {
            title: 'Algorithm Code Snippets',
            icon: '🔧',
            code: `// Quick Sort Algorithm
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}

// Binary Search
function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
        },
        datastructures: {
            title: 'Data Structure Implementations',
            icon: '📊',
            code: `// Stack Implementation
class Stack {
    constructor() { this.items = []; }
    push(item) { this.items.push(item); }
    pop() { return this.items.pop(); }
    peek() { return this.items[this.items.length - 1]; }
    isEmpty() { return this.items.length === 0; }
}

// Binary Tree Node
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = this.right = null;
    }
}`
        },
        webdev: {
            title: 'Web Development Code',
            icon: '🌐',
            code: `<!-- Clean HTML Structure -->
<div class="card">
    <h3 class="card-title">Title</h3>
    <p class="card-content">Content</p>
    <button class="btn-primary">Action</button>
</div>

/* Minimalist CSS */
.card {
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}
.card:hover { transform: translateY(-5px); }`
        },
        system: {
            title: 'System Programming',
            icon: '🖥️',
            code: `// Memory Management
#include <stdlib.h>
#include <stdio.h>

void* safe_malloc(size_t size) {
    void* ptr = malloc(size);
    if (!ptr) {
        fprintf(stderr, "Memory allocation failed\\n");
        exit(1);
    }
    return ptr;
}

// File Operations
int read_file(const char* filename, char** buffer) {
    FILE* file = fopen(filename, "r");
    if (!file) return -1;
    // ... implementation
    fclose(file);
    return 0;
}`
        },
        ml: {
            title: 'Machine Learning Code',
            icon: '🤖',
            code: `// Simple Neural Network Neuron
class Neuron {
    constructor(weights, bias) {
        this.weights = weights;
        this.bias = bias;
    }
    
    activate(inputs) {
        let sum = this.bias;
        for (let i = 0; i < inputs.length; i++) {
            sum += inputs[i] * this.weights[i];
        }
        return this.sigmoid(sum);
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
}`
        },
        mobile: {
            title: 'Mobile Development',
            icon: '📱',
            code: `// React Native Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonText: { color: 'white', fontWeight: 'bold' }
});`
        },
        crypto: {
            title: 'Cryptography Algorithms',
            icon: '🔐',
            code: `// Caesar Cipher Implementation
class CaesarCipher {
    static encrypt(text, shift) {
        return text.replace(/[a-zA-Z]/g, char => {
            const base = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(
                ((char.charCodeAt(0) - base + shift) % 26) + base
            );
        });
    }
    
    static decrypt(text, shift) {
        return this.encrypt(text, 26 - shift);
    }
}

// Simple Hash Function
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// Base64 Encoding/Decoding
const Base64 = {
    encode: str => btoa(unescape(encodeURIComponent(str))),
    decode: str => decodeURIComponent(escape(atob(str)))
};`
        },
        performance: {
            title: 'Performance Optimization',
            icon: '🚀',
            code: `// Memoization Pattern
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Debounce Function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle Function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy Loading Implementation
class LazyLoader {
    static observe(elements, callback) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        elements.forEach(el => observer.observe(el));
    }
}`
        }
    };
    
    const selectedCode = codeMap[codeType] || codeMap.algorithms;
    
    codeContent.innerHTML = `
        <div style="margin-bottom: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">${selectedCode.icon}</div>
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">${selectedCode.title}</h3>
        </div>
        <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin-bottom: 20px; overflow-x: auto;">
            <pre style="color: #f8f8f2; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; margin: 0;"><code>${selectedCode.code}</code></pre>
        </div>
        <div style="text-align: center;">
            <button onclick="closeCodeModal()" style="
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
            ">✕ Close</button>
        </div>
    `;
    
    codeModal.appendChild(codeContent);
    document.body.appendChild(codeModal);
    
    // Add animation styles
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes codeModalIn {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
    `;
    document.head.appendChild(animationStyle);
    
    // Close modal when clicking outside
    codeModal.addEventListener('click', function(e) {
        if (e.target === codeModal) {
            closeCodeModal();
        }
    });
    
    // Store reference for closing
    window.currentCodeModal = codeModal;
}

// Close code modal
function closeCodeModal() {
    if (window.currentCodeModal) {
        window.currentCodeModal.style.animation = 'fadeOut 0.3s ease-in forwards';
        
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(fadeOutStyle);
        
        setTimeout(() => {
            if (window.currentCodeModal && window.currentCodeModal.parentNode) {
                document.body.removeChild(window.currentCodeModal);
                window.currentCodeModal = null;
            }
        }, 300);
    }
}

// Theme toggle
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme();
}

function updateTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggle) themeToggle.textContent = '🌙';
    }
}

// Mobile menu toggle function
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    
    if (navMenu && mobileToggle) {
        const isActive = navMenu.classList.contains('active');
        
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        
        // Toggle body scroll lock for mobile
        if (!isActive) {
            body.classList.add('menu-open');
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
        } else {
            body.classList.remove('menu-open');
            body.style.overflow = '';
            body.style.position = '';
            body.style.width = '';
        }
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navbar = document.querySelector('.navbar');
    const body = document.body;
    
    if (navMenu && mobileToggle && navbar) {
        if (!navbar.contains(event.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
            body.style.position = '';
            body.style.width = '';
        }
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    
    if (window.innerWidth > 768 && navMenu && mobileToggle) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = '';
        body.style.position = '';
        body.style.width = '';
    }
});

// Course data structure
const courseData = {
    course1: {
        title: 'Object Oriented Analysis and Design',
        icon: '📐',
        units: [
            /*{
                title: 'Unit 1: Algebra',
                content: 'Introduction to algebraic expressions, equations, and inequalities.',
                pdf: 'mathematics_unit1.pdf'
            },
            {
                title: 'Unit 2: Calculus',
                content: 'Differential and integral calculus fundamentals.',
                pdf: 'mathematics_unit2.pdf'
            },
            {
                title: 'Unit 3: Geometry',
                content: 'Euclidean geometry and coordinate systems.',
                pdf: 'mathematics_unit3.pdf'
            },
            {
                title: 'Unit 4: Statistics',
                content: 'Probability, distributions, and statistical analysis.',
                pdf: 'mathematics_unit4.pdf'
            },
            {
                title: 'Unit 5: Discrete Mathematics',
                content: 'Logic, sets, and combinatorics.',
                pdf: 'mathematics_unit5.pdf'
            }*/
        ]
    },
    course2: {
        title: 'Introduction to Quantum Technology and Applications',
        icon: '⚛️',
        units: [
            {
                title: 'Unit 1: Introduction to Quantum Theory and Technologies ',
                content: ' The transition from classical to quantum physics',
                pdf: 'pdfs/unitone.pdf'
            }/*,
            {
                title: 'Unit 2: Thermodynamics',
                content: 'Heat, temperature, and thermal processes.',
                pdf: 'physics_unit2.pdf'
            },
            {
                title: 'Unit 3: Electromagnetism',
                content: 'Electric and magnetic fields and their interactions.',
                pdf: 'physics_unit3.pdf'
            },
            {
                title: 'Unit 4: Optics',
                content: 'Light, reflection, refraction, and wave optics.',
                pdf: 'physics_unit4.pdf'
            },
            {
                title: 'Unit 5: Modern Physics',
                content: 'Quantum mechanics and atomic structure.',
                pdf: 'physics_unit5.pdf'
            }*/
        ]
    },
    course3: {
        title: 'Artificial Intelligence',
        icon: '🧪',
        units: [
            /*{
                title: 'Unit 1: Atomic Structure',
                content: 'Atoms, electrons, and periodic properties.',
                pdf: 'chemistry_unit1.pdf'
            },
            {
                title: 'Unit 2: Chemical Bonding',
                content: 'Ionic, covalent, and metallic bonding.',
                pdf: 'chemistry_unit2.pdf'
            },
            {
                title: 'Unit 3: Thermochemistry',
                content: 'Energy changes in chemical reactions.',
                pdf: 'chemistry_unit3.pdf'
            },
            {
                title: 'Unit 4: Organic Chemistry',
                content: 'Carbon compounds and functional groups.',
                pdf: 'chemistry_unit4.pdf'
            },
            {
                title: 'Unit 5: Chemical Kinetics',
                content: 'Reaction rates and mechanisms.',
                pdf: 'chemistry_unit5.pdf'
            }*/
        ]
    },
    course4: {
        title: 'Computer Networks',
        icon: '💻',
        units: [
            /*{
                title: 'Unit 1: Programming Fundamentals',
                content: 'Variables, data types, and control structures.',
                pdf: 'pdfs/cn1.docx'
            },
            {
                title: 'Unit 2: Data Structures',
                content: 'Arrays, linked lists, stacks, and queues.',
                pdf: 'cs_unit2.pdf'
            },
            {
                title: 'Unit 3: Algorithms',
                content: 'Sorting, searching, and algorithm analysis.',
                pdf: 'cs_unit3.pdf'
            },
            {
                title: 'Unit 4: Object-Oriented Programming',
                content: 'Classes, objects, inheritance, and polymorphism.',
                pdf: 'cs_unit4.pdf'
            },
            {
                title: 'Unit 5: Database Systems',
                content: 'SQL, database design, and normalization.',
                pdf: 'cs_unit5.pdf'
            }*/
        ]
    },
    course5: {
        title: 'English for Competitive Examination',
        icon: '📚',
        units: [/*
            {
                title: 'Unit 1: Grammar and Syntax',
                content: 'Parts of speech, sentence structure, and punctuation.',
                pdf: 'english_unit1.pdf'
            },
            {
                title: 'Unit 2: Literature Analysis',
                content: 'Poetry, prose, and dramatic works analysis.',
                pdf: 'english_unit2.pdf'
            },
            {
                title: 'Unit 3: Writing Skills',
                content: 'Essay writing, reports, and technical writing.',
                pdf: 'english_unit3.pdf'
            },
            {
                title: 'Unit 4: Communication Skills',
                content: 'Verbal and non-verbal communication.',
                pdf: 'english_unit4.pdf'
            },
            {
                title: 'Unit 5: Linguistics',
                content: 'Language structure and evolution.',
                pdf: 'english_unit5.pdf'
            }*/
        ]
    },
    course6: {
        title: 'Automata Theory and Compiler Design',
        icon: '⚙️',
        units: [/*
            {
                title: 'Unit 1: Engineering Drawing',
                content: 'Technical drawing and CAD fundamentals.',
                pdf: 'engineering_unit1.pdf'
            },
            {
                title: 'Unit 2: Materials Science',
                content: 'Properties and applications of engineering materials.',
                pdf: 'engineering_unit2.pdf'
            },
            {
                title: 'Unit 3: Mechanics of Materials',
                content: 'Stress, strain, and material behavior.',
                pdf: 'engineering_unit3.pdf'
            },
            {
                title: 'Unit 4: Fluid Mechanics',
                content: 'Fluid statics and dynamics.',
                pdf: 'engineering_unit4.pdf'
            },
            {
                title: 'Unit 5: Control Systems',
                content: 'Feedback systems and control theory.',
                pdf: 'engineering_unit5.pdf'
            }*/
        ]
    }
};

// Lab data structure
const labData = {
    lab1: {
        title: 'Programming Lab',
        icon: '👨‍💻',
        exercises: [
            /*{ title: 'Exercise 1: Hello World Program', pdf: 'prog_ex1.pdf' },
            { title: 'Exercise 2: Variables and Data Types', pdf: 'prog_ex2.pdf' },
            { title: 'Exercise 3: Control Structures', pdf: 'prog_ex3.pdf' },
            { title: 'Exercise 4: Functions', pdf: 'prog_ex4.pdf' },
            { title: 'Exercise 5: Arrays and Strings', pdf: 'prog_ex5.pdf' },
            { title: 'Exercise 6: Object-Oriented Programming', pdf: 'prog_ex6.pdf' },
            { title: 'Exercise 7: File Handling', pdf: 'prog_ex7.pdf' },
            { title: 'Exercise 8: Error Handling', pdf: 'prog_ex8.pdf' },
            { title: 'Exercise 9: Data Structures', pdf: 'prog_ex9.pdf' },
            { title: 'Exercise 10: Final Project', pdf: 'prog_ex10.pdf' }
        */]
    },
    lab2: {
        title: 'Electronics Lab',
        icon: '🔌',
        exercises: [/*
            { title: 'Exercise 1: Basic Circuit Analysis', pdf: 'elec_ex1.pdf' },
            { title: 'Exercise 2: Ohm\'s Law Verification', pdf: 'elec_ex2.pdf' },
            { title: 'Exercise 3: Diode Characteristics', pdf: 'elec_ex3.pdf' },
            { title: 'Exercise 4: Transistor Amplifiers', pdf: 'elec_ex4.pdf' },
            { title: 'Exercise 5: Op-Amp Circuits', pdf: 'elec_ex5.pdf' },
            { title: 'Exercise 6: Digital Logic Gates', pdf: 'elec_ex6.pdf' },
            { title: 'Exercise 7: Flip-Flops and Counters', pdf: 'elec_ex7.pdf' },
            { title: 'Exercise 8: ADC and DAC', pdf: 'elec_ex8.pdf' },
            { title: 'Exercise 9: Microcontroller Programming', pdf: 'elec_ex9.pdf' },
            { title: 'Exercise 10: Final Circuit Project', pdf: 'elec_ex10.pdf' }
        */]
    },
    lab3: {
        title: 'Physics Lab',
        icon: '🔬',
        exercises: [
            /*{ title: 'Exercise 1: Pendulum Experiment', pdf: 'phys_ex1.pdf' },
            { title: 'Exercise 2: Velocity and Acceleration', pdf: 'phys_ex2.pdf' },
            { title: 'Exercise 3: Hooke\'s Law', pdf: 'phys_ex3.pdf' },
            { title: 'Exercise 4: Heat Transfer', pdf: 'phys_ex4.pdf' },
            { title: 'Exercise 5: Electric Circuits', pdf: 'phys_ex5.pdf' },
            { title: 'Exercise 6: Magnetic Fields', pdf: 'phys_ex6.pdf' },
            { title: 'Exercise 7: Optics and Lenses', pdf: 'phys_ex7.pdf' },
            { title: 'Exercise 8: Wave Properties', pdf: 'phys_ex8.pdf' },
            { title: 'Exercise 9: Radioactivity', pdf: 'phys_ex9.pdf' },
            { title: 'Exercise 10: Spectroscopy', pdf: 'phys_ex10.pdf' }
        */]
    },
    lab4: {
        title: 'Chemistry Lab',
        icon: '⚗️',
        exercises: [
           /* { title: 'Exercise 1: Acid-Base Titration', pdf: 'chem_ex1.pdf' },
            { title: 'Exercise 2: Crystallization', pdf: 'chem_ex2.pdf' },
            { title: 'Exercise 3: Distillation', pdf: 'chem_ex3.pdf' },
            { title: 'Exercise 4: Extraction Methods', pdf: 'chem_ex4.pdf' },
            { title: 'Exercise 5: Chromatography', pdf: 'chem_ex5.pdf' },
            { title: 'Exercise 6: Organic Synthesis', pdf: 'chem_ex6.pdf' },
            { title: 'Exercise 7: Spectral Analysis', pdf: 'chem_ex7.pdf' },
            { title: 'Exercise 8: Electrochemistry', pdf: 'chem_ex8.pdf' },
            { title: 'Exercise 9: Kinetics Study', pdf: 'chem_ex9.pdf' },
            { title: 'Exercise 10: Final Analysis', pdf: 'chem_ex10.pdf' }
       */ ]
    }
};

// Open course modal
function openCourse(courseId) {
    const course = courseData[courseId];
    if (!course) return;

    const modal = document.getElementById('courseModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.innerHTML = `${course.icon} ${course.title}`;
    
    // Add top-level View All PDFs button
    let content = `
        <div class="modal-top-actions">
            <button class="view-all-pdfs-btn" onclick="viewAllPDFs('${courseId}')">
                <span class="btn-icon">📚</span>
                <span class="btn-text">View All PDFs</span>
            </button>
        </div>
        <div class="units-box-container">`;
    
    course.units.forEach((unit, index) => {
        content += `
            <div class="unit-box" data-unit="${index}">
                <div class="unit-header">
                    <div class="unit-number-badge">Unit ${index + 1}</div>
                    <h3 class="unit-title">${unit.title}</h3>
                    <button class="unit-pdf-btn" onclick="viewPDF('${unit.pdf}')" title="View PDF">
                        <span class="btn-icon">📄</span>
                    </button>
                </div>
                <div class="unit-content">
                    <p class="unit-description">${unit.content}</p>
                </div>
                <div class="unit-footer">
                    <div class="unit-actions-box">
                        <button class="pdf-box-btn" onclick="viewPDF('${unit.pdf}')">
                            <span class="btn-icon">📄</span>
                            <span class="btn-text">View PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    content += '</div>';

    modalBody.innerHTML = content;
    modal.style.display = 'block';

    // Add 3D effects to unit boxes after they're created
    setTimeout(() => {
        const unitBoxes = modal.querySelectorAll('.unit-box');
        unitBoxes.forEach((box, index) => {
            // Initial entrance animation
            box.style.opacity = '0';
            box.style.transform = 'translateY(30px)';
            box.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            setTimeout(() => {
                box.style.opacity = '1';
                box.style.transform = 'translateY(0)';
            }, index * 100);

            // Add 3D mouse tracking
            box.addEventListener('mousemove', (e) => {
                const rect = box.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / centerY * -8;
                const rotateY = (x - centerX) / centerX * 8;
                
                box.style.transform = `
                    translateY(-5px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    scale(1.02)
                    perspective(800px)
                `;
            });

            box.addEventListener('mouseleave', () => {
                box.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
            });
        });
    }, 100);

    // Add box model styles for units
    const style = document.createElement('style');
    style.textContent = `
        .units-box-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 20px;
            max-height: 70vh;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        .unit-box {
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 0;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
        }
        
        .unit-box:hover {
            border-color: var(--primary-color);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
            transform: translateY(-2px);
        }
        
        .unit-header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .unit-number-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            backdrop-filter: blur(10px);
        }
        
        .unit-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            flex: 1;
        }
        
        .unit-content {
            padding: 20px;
            background: var(--bg-secondary);
        }
        
        .unit-description {
            margin: 0;
            color: var(--text-secondary);
            line-height: 1.6;
            font-size: 14px;
        }
        
        .unit-footer {
            padding: 15px 20px;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }
        
        .unit-actions-box {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .pdf-box-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            width: 100%;
            justify-content: center;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
        
        .pdf-box-btn:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        
        .btn-icon {
            font-size: 16px;
        }
        
        .btn-text {
            font-weight: 500;
        }
        

        
        /* Box model variations for different units */
        .unit-box:nth-child(1) .unit-header {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .unit-box:nth-child(2) .unit-header {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        
        .unit-box:nth-child(3) .unit-header {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .unit-box:nth-child(4) .unit-header {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        
        .unit-box:nth-child(5) .unit-header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        /* Responsive design for box model */
        @media (max-width: 768px) {
            .units-box-container {
                gap: 15px;
            }
            
            .unit-header {
                padding: 12px 15px;
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .unit-title {
                font-size: 16px;
            }
            
            .unit-content {
                padding: 15px;
            }
            
            .unit-footer {
                padding: 12px 15px;
            }
            
            .unit-actions-box {
                flex-direction: column;
                gap: 8px;
            }
            
            .pdf-box-btn {
                min-width: auto;
                padding: 12px 16px;
            }
        }
        
        /* Scrollbar styling for units container */
        .units-box-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .units-box-container::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 3px;
        }
        
        .units-box-container::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 3px;
        }
        
        .units-box-container::-webkit-scrollbar-thumb:hover {
            background: var(--secondary-color);
        }
    `;
    document.head.appendChild(style);
}

// Open lab modal
function openLab(labId) {
    const lab = labData[labId];
    if (!lab) return;

    const modal = document.getElementById('courseModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.innerHTML = `${lab.icon} ${lab.title}`;
    
    // Add top-level View All PDFs button
    let content = `
        <div class="modal-top-actions">
            <button class="view-all-pdfs-btn" onclick="viewAllLabPDFs('${labId}')">
                <span class="btn-icon">📚</span>
                <span class="btn-text">View All Exercise PDFs</span>
            </button>
        </div>
        <div class="exercises-box-container">`;
    
    lab.exercises.forEach((exercise, index) => {
        content += `
            <div class="exercise-box" data-exercise="${index}">
                <div class="exercise-header">
                    <div class="exercise-number-badge">Exercise ${index + 1}</div>
                    <h3 class="exercise-title">${exercise.title}</h3>
                    <button class="exercise-pdf-btn" onclick="viewPDF('${exercise.pdf}')" title="View PDF">
                        <span class="btn-icon">📄</span>
                    </button>
                </div>
                <div class="exercise-content">
                    <p class="exercise-description">Complete this practical exercise with detailed instructions and examples.</p>
                </div>
                <div class="exercise-footer">
                    <div class="exercise-actions-box">
                        <button class="pdf-box-btn" onclick="viewPDF('${exercise.pdf}')">
                            <span class="btn-icon">📄</span>
                            <span class="btn-text">View PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    content += '</div>';

    modalBody.innerHTML = content;
    modal.style.display = 'block';

    // Add 3D effects to exercise boxes after they're created
    setTimeout(() => {
        const exerciseBoxes = modal.querySelectorAll('.exercise-box');
        exerciseBoxes.forEach((box, index) => {
            // Initial entrance animation
            box.style.opacity = '0';
            box.style.transform = 'translateY(30px)';
            box.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            setTimeout(() => {
                box.style.opacity = '1';
                box.style.transform = 'translateY(0)';
            }, index * 80);

            // Add 3D mouse tracking
            box.addEventListener('mousemove', (e) => {
                const rect = box.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / centerY * -8;
                const rotateY = (x - centerX) / centerX * 8;
                
                box.style.transform = `
                    translateY(-5px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    scale(1.02)
                    perspective(800px)
                `;
            });

            box.addEventListener('mouseleave', () => {
                box.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
            });
        });
    }, 100);

    // Add box model styles for exercises
    const style = document.createElement('style');
    style.textContent = `
        .exercises-box-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
            max-height: 70vh;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        .exercise-box {
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 0;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
        }
        
        .exercise-box:hover {
            border-color: var(--accent-color);
            box-shadow: 0 4px 16px rgba(6, 182, 212, 0.2);
            transform: translateY(-2px);
        }
        
        .exercise-header {
            background: linear-gradient(135deg, var(--accent-color), #0891b2);
            color: white;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .exercise-number-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            backdrop-filter: blur(10px);
        }
        
        .exercise-title {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            flex: 1;
        }
        
        .difficulty-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .difficulty-badge.easy {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .difficulty-badge.medium {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .difficulty-badge.hard {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .exercise-content {
            padding: 20px;
            background: var(--bg-secondary);
        }
        
        .exercise-description {
            margin: 0;
            color: var(--text-secondary);
            line-height: 1.6;
            font-size: 14px;
        }
        
        .exercise-footer {
            padding: 15px 20px;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }
        
        .exercise-actions-box {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .pdf-box-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            width: 100%;
            justify-content: center;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
        
        .pdf-box-btn:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        

        
        /* Box model variations for different exercises */
        .exercise-box:nth-child(1) .exercise-header {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
        }
        
        .exercise-box:nth-child(2) .exercise-header {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        
        .exercise-box:nth-child(3) .exercise-header {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
        }
        
        .exercise-box:nth-child(4) .exercise-header {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .exercise-box:nth-child(5) .exercise-header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .exercise-box:nth-child(6) .exercise-header {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .exercise-box:nth-child(7) .exercise-header {
            background: linear-gradient(135deg, #ec4899, #db2777);
        }
        
        .exercise-box:nth-child(8) .exercise-header {
            background: linear-gradient(135deg, #84cc16, #65a30d);
        }
        
        .exercise-box:nth-child(9) .exercise-header {
            background: linear-gradient(135deg, #f97316, #ea580c);
        }
        
        .exercise-box:nth-child(10) .exercise-header {
            background: linear-gradient(135deg, #6b7280, #4b5563);
        }
        
        /* Responsive design for exercise boxes */
        @media (max-width: 768px) {
            .exercises-box-container {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .exercise-header {
                padding: 12px 15px;
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .exercise-title {
                font-size: 14px;
            }
            
            .exercise-content {
                padding: 15px;
            }
            
            .exercise-footer {
                padding: 12px 15px;
            }
            
            .exercise-actions-box {
                flex-direction: column;
                gap: 8px;
            }
            
            .pdf-box-btn {
                min-width: auto;
                padding: 12px 16px;
            }
        }
        
        /* Scrollbar styling for exercises container */
        .exercises-box-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .exercises-box-container::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 3px;
        }
        
        .exercises-box-container::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 3px;
        }
        
        .exercises-box-container::-webkit-scrollbar-thumb:hover {
            background: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
}

// Close modal
function closeModal() {
    document.getElementById('courseModal').style.display = 'none';
}

// View PDF function
function viewPDF(filename) {
    // Create a modal for PDF viewing
    const pdfModal = document.createElement('div');
    pdfModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const pdfContent = document.createElement('div');
    pdfContent.style.cssText = `
        background: var(--bg-card);
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: pdfModalIn 0.3s ease-out;
    `;
    
    pdfContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 15px;">📄</div>
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">PDF Document</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">Opening: ${filename}</p>
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button onclick="openPDFInNewTab('${filename}')" style="
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            ">🔗 Open in New Tab</button>
            <button onclick="closePDFModal()" style="
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
            ">✕ Close</button>
        </div>
    `;
    
    pdfModal.appendChild(pdfContent);
    document.body.appendChild(pdfModal);
    
    // Add animation styles
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes pdfModalIn {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
    `;
    document.head.appendChild(animationStyle);
    
    // Close modal when clicking outside
    pdfModal.addEventListener('click', function(e) {
        if (e.target === pdfModal) {
            closePDFModal();
        }
    });
    
    // Store reference for closing
    window.currentPDFModal = pdfModal;
}

// Open PDF in new tab
function openPDFInNewTab(filename) {
    // Construct the proper PDF URL
    let pdfUrl;
    
    // Check if filename already includes path
    if (filename.startsWith('pdfs/')) {
        pdfUrl = `./${filename}`;
    } else {
        pdfUrl = `./pdfs/${filename}`;
    }
    
    // Try to open the actual PDF file
    const newWindow = window.open(pdfUrl, '_blank');
    
    // If opening fails (popup blocked), show fallback
    if (!newWindow) {
        // Show notification that popup was blocked
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">⚠️</span>
                <div style="font-size: 14px;">
                    <strong>Popup Blocked</strong><br>
                    <small>Please allow popups to view PDF</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // Alternative: try to navigate to PDF in same tab
        setTimeout(() => {
            if (confirm(`Would you like to open ${filename} in this tab instead?`)) {
                window.location.href = pdfUrl;
            }
        }, 1000);
    }
    
    closePDFModal();
}

// Close PDF modal
function closePDFModal() {
    if (window.currentPDFModal) {
        window.currentPDFModal.style.animation = 'fadeOut 0.3s ease-in forwards';
        
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(fadeOutStyle);
        
        setTimeout(() => {
            if (window.currentPDFModal && window.currentPDFModal.parentNode) {
                document.body.removeChild(window.currentPDFModal);
                window.currentPDFModal = null;
            }
        }, 300);
    }
}

// View all PDFs for a course
function viewAllPDFs(courseId) {
    const course = courseData[courseId];
    if (!course) return;
    
    // Create a modal for viewing all PDFs
    const allPDFModal = document.createElement('div');
    allPDFModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const allPDFContent = document.createElement('div');
    allPDFContent.style.cssText = `
        background: var(--bg-card);
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: modalSlideIn 0.3s ease-out;
    `;
    
    let pdfList = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 15px;">${course.icon}</div>
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">${course.title} - All PDFs</h3>
            <p style="color: var(--text-secondary);">Click any PDF to view in a new tab</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 15px;">
    `;
    
    course.units.forEach((unit, index) => {
        pdfList += `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: var(--bg-secondary); border-radius: 12px; transition: all 0.3s ease; cursor: pointer;" onclick="viewPDF('${unit.pdf}')">
                <div style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; min-width: 60px; text-align: center;">Unit ${index + 1}</div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 16px;">${unit.title}</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">${unit.pdf}</p>
                </div>
                <div style="font-size: 24px;">📄</div>
            </div>
        `;
    });
    
    pdfList += `
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="closeAllPDFModal()" style="
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
            ">✕ Close</button>
        </div>
    `;
    
    allPDFContent.innerHTML = pdfList;
    allPDFModal.appendChild(allPDFContent);
    document.body.appendChild(allPDFModal);
    
    // Close modal when clicking outside
    allPDFModal.addEventListener('click', function(e) {
        if (e.target === allPDFModal) {
            closeAllPDFModal();
        }
    });
    
    // Store reference for closing
    window.currentAllPDFModal = allPDFModal;
}

// View all PDFs for a lab
function viewAllLabPDFs(labId) {
    const lab = labData[labId];
    if (!lab) return;
    
    // Create a modal for viewing all lab PDFs
    const allPDFModal = document.createElement('div');
    allPDFModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const allPDFContent = document.createElement('div');
    allPDFContent.style.cssText = `
        background: var(--bg-card);
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: modalSlideIn 0.3s ease-out;
    `;
    
    let pdfList = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 15px;">${lab.icon}</div>
            <h3 style="color: var(--accent-color); margin-bottom: 10px;">${lab.title} - All Exercise PDFs</h3>
            <p style="color: var(--text-secondary);">Click any exercise PDF to view in a new tab</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 15px;">
    `;
    
    lab.exercises.forEach((exercise, index) => {
        pdfList += `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: var(--bg-secondary); border-radius: 12px; transition: all 0.3s ease; cursor: pointer;" onclick="viewPDF('${exercise.pdf}')">
                <div style="background: linear-gradient(135deg, var(--accent-color), #0891b2); color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; min-width: 80px; text-align: center; font-size: 12px;">Exercise ${index + 1}</div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 16px;">${exercise.title}</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">${exercise.pdf}</p>
                </div>
                <div style="font-size: 24px;">📄</div>
            </div>
        `;
    });
    
    pdfList += `
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="closeAllPDFModal()" style="
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
            ">✕ Close</button>
        </div>
    `;
    
    allPDFContent.innerHTML = pdfList;
    allPDFModal.appendChild(allPDFContent);
    document.body.appendChild(allPDFModal);
    
    // Close modal when clicking outside
    allPDFModal.addEventListener('click', function(e) {
        if (e.target === allPDFModal) {
            closeAllPDFModal();
        }
    });
    
    // Store reference for closing
    window.currentAllPDFModal = allPDFModal;
}

// Close all PDF modal
function closeAllPDFModal() {
    if (window.currentAllPDFModal) {
        window.currentAllPDFModal.style.animation = 'fadeOut 0.3s ease-in forwards';
        
        setTimeout(() => {
            if (window.currentAllPDFModal && window.currentAllPDFModal.parentNode) {
                document.body.removeChild(window.currentAllPDFModal);
                window.currentAllPDFModal = null;
            }
        }, 300);
    }
}

// View slides function
function viewSlides(courseId, unitIndex) {
    alert(`Opening slides for ${courseData[courseId].title} - ${courseData[courseId].units[unitIndex].title}\n\nNote: In a real implementation, this would display interactive slides.`);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('courseModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        
        // Skip empty or invalid hrefs
        if (!href || href === '#' || href.length <= 1) {
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some interactive animations
function addInteractiveAnimations() {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-animation');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });

    // Card hover effects
    document.querySelectorAll('.course-card, .lab-card, .code-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
        });
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', addInteractiveAnimations);

// Contact form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Simulate form submission
            alert(`Thank you, ${name}! Your message has been sent successfully.\nWe'll get back to you at ${email} soon.`);
            
            // Reset form
            this.reset();
        });
    }
});

// Add typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when home section is shown
function initializeTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && !heroTitle.classList.contains('typed')) {
        heroTitle.classList.add('typed');
        typeWriter(heroTitle, '🎓 Welcome to Semprepzie', 80);
    }
}

// Call typing effect when page loads
setTimeout(initializeTypingEffect, 2000);

// Create floating particles background
function createFloatingParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    document.body.appendChild(particlesContainer);
    
    // Create 50 particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Add stagger animation to course cards
function addStaggerAnimation() {
    const courseCards = document.querySelectorAll('.course-card, .lab-card, .code-card, .feature');
    courseCards.forEach((card, index) => {
        card.classList.add('stagger-item');
        card.style.animationDelay = (index * 0.1) + 's';
        
        // Add enhanced 3D mouse tracking effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -15;
            const rotateY = (x - centerX) / centerX * 15;
            
            card.style.transform = `
                translateY(-20px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale(1.05)
                perspective(1000px)
            `;
            
            // Add dynamic glow effect
            const glowIntensity = Math.sqrt(rotateX * rotateX + rotateY * rotateY) / 20;
            card.style.filter = `drop-shadow(0 0 ${glowIntensity * 20}px rgba(99, 102, 241, ${glowIntensity}))`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
            card.style.filter = 'none';
        });
    });
}

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.classList.add('ripple');
        
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
    
    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add magnetic effect to cards
function addMagneticEffect() {
    const cards = document.querySelectorAll('.course-card, .lab-card, .code-card');
    cards.forEach(card => {
        // Mouse move for magnetic effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / rect.height) * 20;
            const rotateY = (x / rect.width) * 20;
            
            card.style.transform = `
                perspective(1000px) 
                rotateX(${-rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateZ(20px)
                scale(1.05)
            `;
        });
        
        // Mouse leave to reset
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
        });
        
        // Double click for flip effect
        card.addEventListener('dblclick', () => {
            card.classList.toggle('flipped');
            setTimeout(() => {
                card.classList.remove('flipped');
            }, 2000);
        });
        
        // Add holographic effect randomly
        if (Math.random() > 0.7) {
            setTimeout(() => {
                card.classList.add('holographic');
                setTimeout(() => {
                    card.classList.remove('holographic');
                }, 3000);
            }, Math.random() * 5000);
        }
        
        // Add 3D text effect
        const title = card.querySelector('h3');
        if (title) {
            title.setAttribute('data-text', title.textContent);
        }
    });
}

// Add parallax effect to course icons
function addIconParallax() {
    const icons = document.querySelectorAll('.course-icon, .lab-icon');
    
    icons.forEach(icon => {
        const card = icon.closest('.course-card, .lab-card, .code-card');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const moveX = (x / rect.width) * 10;
            const moveY = (y / rect.height) * 10;
            
            icon.style.transform = `
                translateX(${moveX}px) 
                translateY(${moveY}px) 
                rotateY(${moveX}deg)
                scale(1.1)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateX(0) translateY(0) rotateY(0deg) scale(1)';
        });
    });
}

// Add depth layers effect
function addDepthLayers() {
    const cards = document.querySelectorAll('.course-card, .lab-card, .code-card');
    
    cards.forEach(card => {
        // Create depth layers
        const layers = ['shallow', 'medium', 'deep'];
        const elements = card.querySelectorAll('h3, p, .course-icon, .lab-icon');
        
        elements.forEach((element, index) => {
            element.style.position = 'relative';
            element.style.zIndex = elements.length - index;
            element.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseenter', () => {
            elements.forEach((element, index) => {
                const depth = (elements.length - index) * 5;
                element.style.transform = `translateZ(${depth}px)`;
            });
        });
        
        card.addEventListener('mouseleave', () => {
            elements.forEach(element => {
                element.style.transform = 'translateZ(0px)';
            });
        });
    });
}

// Add course card tilt effect based on device orientation (mobile)
function addGyroscopeEffect() {
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
        window.addEventListener('deviceorientation', (e) => {
            const cards = document.querySelectorAll('.course-card, .lab-card, .code-card');
            const gamma = e.gamma; // left to right tilt (-90 to 90)
            const beta = e.beta;   // front to back tilt (-180 to 180)
            
            cards.forEach(card => {
                if (!card.matches(':hover')) {
                    const rotateX = (beta / 180) * 10;
                    const rotateY = (gamma / 90) * 10;
                    
                    card.style.transform = `
                        perspective(1000px) 
                        rotateX(${rotateX}deg) 
                        rotateY(${rotateY}deg)
                    `;
                }
            });
        });
    }
}

// Add particle explosion effect on click
function addParticleExplosion() {
    const cards = document.querySelectorAll('.course-card, .lab-card, .code-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Create particle explosion
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    left: ${centerX}px;
                    top: ${centerY}px;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (i / 20) * Math.PI * 2;
                const velocity = 100 + Math.random() * 100;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                let x = 0, y = 0, opacity = 1;
                
                const animate = () => {
                    x += vx * 0.02;
                    y += vy * 0.02 + 2; // gravity
                    opacity -= 0.02;
                    
                    particle.style.transform = `translate(${x}px, ${y}px)`;
                    particle.style.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        document.body.removeChild(particle);
                    }
                };
                
                animate();
            }
        });
    });
}

// Add random special effects
function addRandomEffects() {
    setInterval(() => {
        if (Math.random() > 0.8) {
            const cards = document.querySelectorAll('.course-card');
            if (cards.length > 0) {
                const randomCard = cards[Math.floor(Math.random() * cards.length)];
                
                // Random effect selection
                const effects = ['energy-pulse', 'holographic', 'glitch'];
                const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                
                if (randomCard && randomCard.classList) {
                    randomCard.classList.add(randomEffect);
                    
                    setTimeout(() => {
                        if (randomCard && randomCard.classList) {
                            randomCard.classList.remove(randomEffect);
                        }
                    }, 2000);
                }
            }
        }
    }, 3000);
}

// Initialize all interactive effects
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addRippleEffect();
        addMagneticEffect();
        addIconParallax();
        addDepthLayers();
        addGyroscopeEffect();
        addParticleExplosion();
        addRandomEffects();
        // Removed init3DCursor() to remove stars cursor
    }, 6000);
});

// Add smooth page transitions
function addPageTransitions() {
    const links = document.querySelectorAll('.nav-menu a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('onclick').match(/'(\w+)'/)[1];
            
            // Add loading overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            overlay.innerHTML = '<div style="color: white; font-size: 24px;">Loading...</div>';
            document.body.appendChild(overlay);
            
            // Fade in overlay
            setTimeout(() => overlay.style.opacity = '1', 10);
            
            // Switch section and remove overlay
            setTimeout(() => {
                showSection(targetSection);
                overlay.style.opacity = '0';
                setTimeout(() => document.body.removeChild(overlay), 300);
            }, 500);
        });
    });
}

// Smooth scroll to section function
function scrollToSection(sectionId) {
    // First make sure we're on the home page
    showSection('home');
    
    // Wait a moment for the section to show, then scroll
    setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 100);
}

// Advanced 3D Effects for About and Contact sections
function init3DEffects() {
    // Mouse tracking for 3D tilt effects
    const sections = document.querySelectorAll('.home-about-section, .home-contact-section');
    
    sections.forEach(section => {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / rect.height) * 5;
            const rotateY = (x / rect.width) * 5;
            
            section.style.transform = `
                perspective(1000px) 
                rotateX(${-rotateX}deg) 
                rotateY(${rotateY}deg)
                translateZ(10px)
            `;
        });
        
        section.addEventListener('mouseleave', () => {
            section.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
    
    // Feature cards individual mouse tracking
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
        feature.addEventListener('mousemove', (e) => {
            const rect = feature.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / rect.height) * 15;
            const rotateY = (x / rect.width) * 15;
            
            feature.style.transform = `
                perspective(1000px) 
                rotateX(${-rotateX}deg) 
                rotateY(${rotateY}deg)
                translateZ(20px)
                scale(1.05)
            `;
        });
        
        feature.addEventListener('mouseleave', () => {
            feature.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
        });
    });
    
    // Contact items 3D tracking
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / rect.height) * 10;
            const rotateY = (x / rect.width) * 10;
            
            item.style.transform = `
                perspective(1000px) 
                rotateX(${-rotateX}deg) 
                rotateY(${rotateY}deg)
                translateZ(15px)
                translateX(10px)
                scale(1.02)
            `;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateX(0px) scale(1)';
        });
    });
}

// Scroll-based 3D parallax effects
function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const sections = document.querySelectorAll('.home-section-divider');
        
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const speed = 0.1 + (index * 0.05);
            const yPos = -(scrolled * speed);
            const rotateX = (rect.top / window.innerHeight) * 5;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                section.style.transform = `
                    perspective(1000px) 
                    translateY(${yPos}px) 
                    rotateX(${rotateX}deg)
                `;
            }
        });
        
        // Feature cards scroll animation
        const features = document.querySelectorAll('.feature');
        features.forEach((feature, index) => {
            const rect = feature.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const progress = (window.innerHeight - rect.top) / window.innerHeight;
                const translateY = (1 - progress) * 50;
                const rotateX = progress * 5;
                const scale = 0.8 + (progress * 0.2);
                
                feature.style.transform = `
                    perspective(1000px) 
                    translateY(${translateY}px) 
                    rotateX(${rotateX}deg)
                    scale(${Math.min(scale, 1)})
                `;
            }
        });
    });
}

// Contact form 3D interaction
function initFormEffects() {
    const form = document.querySelector('.contact-form');
    const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    
    if (form) {
        // Form container tilt on focus
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                form.style.transform = 'perspective(1000px) rotateX(-2deg) translateY(-5px)';
            });
            
            input.addEventListener('blur', () => {
                form.style.transform = 'perspective(1000px) rotateX(0deg) translateY(0px)';
            });
        });
        
        // Button 3D press effect
        const button = form.querySelector('button');
        if (button) {
            button.addEventListener('mousedown', () => {
                button.style.transform = 'perspective(1000px) translateY(2px) rotateX(5deg) scale(0.98)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = 'perspective(1000px) translateY(-3px) rotateX(0deg) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'perspective(1000px) translateY(0px) rotateX(0deg) scale(1)';
            });
        }
    }
}

// Intersection Observer for entrance animations
function initIntersectionAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Staggered animation for child elements
                const children = entry.target.querySelectorAll('.feature, .contact-item');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.animation = `slideInUp 0.6s ease-out forwards`;
                        child.style.animationDelay = `${index * 0.1}s`;
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('.home-about-section, .home-contact-section').forEach(section => {
        observer.observe(section);
    });
}

// Initialize all 3D effects
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        init3DEffects();
        initScrollEffects();
        initFormEffects();
        initIntersectionAnimations();
    }, 1000);
});

// Contact Form Submission
async function submitContactForm(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const statusElement = document.getElementById(formType === 'home' ? 'homeFormStatus' : 'contactFormStatus');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const message = formData.get('message').trim();
    
    // Validation
    if (!name || !email || !message) {
        showFormStatus(statusElement, 'Please fill in all fields.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showFormStatus(statusElement, 'Please enter a valid email address.', 'error');
        return;
    }
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    showFormStatus(statusElement, 'Sending your message...', 'loading');
    
    try {
        // Try different methods in sequence for better reliability
        let success = false;
        let lastError = null;
        
        // Method 1: Try FormSubmit (works immediately, no setup required)
        try {
            success = await sendToFormSubmit(name, email, message);
            if (success) {
                showFormStatus(statusElement, 'Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                return;
            }
        } catch (error) {
            lastError = error;
            console.log('FormSubmit failed:', error);
        }
        
        // Method 2: Try Formspree (most reliable)
        try {
            success = await sendToFormspree(name, email, message);
            if (success) {
                showFormStatus(statusElement, 'Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                return;
            }
        } catch (error) {
            lastError = error;
            console.log('Formspree failed:', error);
        }
        
        // Method 2: Try Netlify Forms
        try {
            success = await sendToNetlify(name, email, message);
            if (success) {
                showFormStatus(statusElement, 'Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                return;
            }
        } catch (error) {
            lastError = error;
            console.log('Netlify failed:', error);
        }
        
        // Method 3: Try Web3Forms (new reliable service)
        try {
            success = await sendToWeb3Forms(name, email, message);
            if (success) {
                showFormStatus(statusElement, 'Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                return;
            }
        } catch (error) {
            lastError = error;
            console.log('Web3Forms failed:', error);
        }
        
        // Method 4: Try PHP backend if available
        try {
            success = await sendToPHPBackend(name, email, message);
            if (success) {
                showFormStatus(statusElement, 'Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                return;
            }
        } catch (error) {
            lastError = error;
            console.log('PHP backend failed:', error);
        }
        
        // Method 5: Client-side mailto as final fallback
        try {
            success = await sendViaMailto(name, email, message);
            if (success) {
                showFormStatus(statusElement, 'Opening your email client to send the message...', 'success');
                form.reset();
                return;
            }
        } catch (error) {
            lastError = error;
            console.log('Mailto failed:', error);
        }
        
        // If all methods fail, show error with helpful message
        throw new Error('All services failed');
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormStatus(statusElement, 'Unable to send message automatically. Please use the "Email Directly" button below to contact us directly.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
}

// Send to FormSubmit (works immediately, no setup required)
async function sendToFormSubmit(name, email, message) {
    try {
        const response = await fetch('https://formsubmit.co/semprepzie@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                _subject: `New Contact Form Message from ${name}`,
                _captcha: 'false',
                _template: 'table'
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('FormSubmit error:', error);
        return false;
    }
}

// Handle form submission with multiple fallbacks
function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Try multiple methods in sequence
    tryFormSubmit(form, name, email, message);
}

// Try different form submission methods
async function tryFormSubmit(form, name, email, message) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    // Method 1: Try FormSubmit directly
    try {
        const response = await fetch('https://formsubmit.co/semprepzie@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                _subject: `New message from ${name} - Semprepzie Website`,
                _captcha: 'false',
                _template: 'table'
            })
        });
        
        if (response.ok) {
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            form.reset();
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
    } catch (error) {
        console.log('FormSubmit failed:', error);
    }
    
    // Method 2: Try Getform
    try {
        const response = await fetch('https://getform.io/f/arolxgka', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        });
        
        if (response.ok) {
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            form.reset();
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
    } catch (error) {
        console.log('Getform failed:', error);
    }
    
    // Method 3: Open Gmail as fallback
    showNotification('Opening Gmail to send your message...', 'info');
    const subject = encodeURIComponent(`Message from ${name} - Semprepzie Website`);
    const body = encodeURIComponent(`Hello Semprepzie Team,

Name: ${name}
Email: ${email}

Message:
${message}

---
This message was composed using the Semprepzie contact form.`);
    
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=semprepzie@gmail.com&subject=${subject}&body=${body}`, '_blank');
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
}

// Show notification message
function showNotification(message, type) {
    // Create or get existing notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    notification.style.cssText = `
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 10px;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        pointer-events: auto;
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, type === 'error' ? 5000 : 3000);
}

// Copy email function
function copyEmail() {
    const email = 'semprepzie@gmail.com';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
            alert('✅ Email copied!\n\n' + email);
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ Email copied!\n\n' + email);
    }
}

// Simple copy to clipboard function
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Email copied to clipboard: ' + text);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Email copied to clipboard: ' + text);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Email copied to clipboard: ' + text);
    }
}

// Send via mailto (always works as fallback)
async function sendViaMailto(name, email, message) {
    return new Promise((resolve) => {
        const subject = encodeURIComponent(`Contact Form Message from ${name}`);
        const body = encodeURIComponent(`
Hello Semprepzie Team,

Name: ${name}
Email: ${email}

Message:
${message}

---
This message was composed using the Semprepzie contact form.
        `.trim());
        
        const mailtoLink = `mailto:semprepzie@gmail.com?subject=${subject}&body=${body}`;
        
        // Open mailto link
        window.location.href = mailtoLink;
        
        // Consider it successful since we opened the email client
        setTimeout(() => resolve(true), 100);
    });
}

// Send to Web3Forms service (most reliable)
async function sendToWeb3Forms(name, email, message) {
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                access_key: 'YOUR_ACCESS_KEY_HERE', // You'll need to get this from web3forms.com
                name: name,
                email: email,
                message: message,
                subject: `New Contact Form Message from ${name} - Semprepzie`,
                from_name: 'Semprepzie Contact Form',
                to_email: 'semprepzie@gmail.com'
            })
        });
        
        const result = await response.json();
        return response.ok && result.success;
    } catch (error) {
        console.error('Web3Forms error:', error);
        return false;
    }
}

// Send to PHP backend
async function sendToPHPBackend(name, email, message) {
    try {
        const response = await fetch('./contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        });
        
        const result = await response.json();
        return response.ok && result.success;
    } catch (error) {
        console.error('PHP backend error:', error);
        return false;
    }
}

// Send to Formspree service
async function sendToFormspree(name, email, message) {
    try {
        // Using Formspree's test endpoint - replace with your actual endpoint
        const response = await fetch('https://formspree.io/f/mldeoddj', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                _replyto: email,
                _subject: `New message from ${name} - Semprepzie Contact Form`
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Formspree error:', error);
        return false;
    }
}

// Send to Netlify Forms (works if deployed on Netlify)
async function sendToNetlify(name, email, message) {
    try {
        // Check if we're on Netlify by looking for netlify in the hostname
        if (!window.location.hostname.includes('netlify') && window.location.hostname !== 'localhost') {
            return false; // Skip if not on Netlify
        }
        
        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'form-name': 'contact',
                'name': name,
                'email': email,
                'message': message
            }).toString()
        });
        
        return response.ok;
    } catch (error) {
        console.error('Netlify error:', error);
        return false;
    }
}

// Send using EmailJS service
async function sendToEmailJS(name, email, message) {
    // You'll need to set up EmailJS account and get these IDs
    const serviceID = 'service_semprepzie';
    const templateID = 'template_contact';
    const userID = 'user_semprepzie';
    
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            service_id: serviceID,
            template_id: templateID,
            user_id: userID,
            template_params: {
                from_name: name,
                from_email: email,
                message: message,
                to_email: 'semprepzie@gmail.com'
            }
        })
    });
    
    return response.ok;
}

// Show form status message
function showFormStatus(statusElement, message, type) {
    statusElement.textContent = message;
    statusElement.className = `form-status ${type} show`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusElement.classList.remove('show');
        }, 5000);
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Alternative direct email link fallback
function openEmailClient() {
    const subject = encodeURIComponent('Message from Semprepzie Website');
    const body = encodeURIComponent('Hello Semprepzie Team,\n\nI would like to get in touch regarding:\n\n[Your message here]\n\nBest regards,\n[Your name]');
    window.open(`mailto:semprepzie@gmail.com?subject=${subject}&body=${body}`);
}

// Send via Gmail web interface
function sendViaGmail() {
    const subject = encodeURIComponent('Message from Semprepzie Website');
    const body = encodeURIComponent('Hello Semprepzie Team,\n\nI would like to get in touch regarding:\n\n[Please write your message here]\n\nBest regards,\n[Your name]\n[Your email]');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=semprepzie@gmail.com&subject=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

// Send via Outlook web interface
function sendViaOutlook() {
    const subject = encodeURIComponent('Message from Semprepzie Website');
    const body = encodeURIComponent('Hello Semprepzie Team,\n\nI would like to get in touch regarding:\n\n[Please write your message here]\n\nBest regards,\n[Your name]\n[Your email]');
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=semprepzie@gmail.com&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank');
}

// Copy email address to clipboard
function copyEmail() {
    const email = 'semprepzie@gmail.com';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
            showNotification('Email address copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyEmail(email);
        });
    } else {
        fallbackCopyEmail(email);
    }
}

// Fallback copy method for older browsers
function fallbackCopyEmail(email) {
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Email address copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Could not copy email. Please manually copy: semprepzie@gmail.com', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Show notification message
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Set up event listeners (CSP-compliant)
function setupEventListeners() {
    // Login form handlers
    const loginBtn = document.getElementById('loginBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (resetPasswordBtn) resetPasswordBtn.addEventListener('click', handlePasswordReset);
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForgotPassword();
    });
    if (backToLoginLink) backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Navigation menu
    document.querySelectorAll('[data-section]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            if (section) showSection(section);
        });
    });
    
    // Scroll to section links
    document.querySelectorAll('[data-scroll]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-scroll');
            if (section) scrollToSection(section);
        });
    });
    
    // Copy email buttons
    const copyEmailBtn1 = document.getElementById('copyEmailBtn1');
    const copyEmailBtn2 = document.getElementById('copyEmailBtn2');
    if (copyEmailBtn1) copyEmailBtn1.addEventListener('click', copyEmail);
    if (copyEmailBtn2) copyEmailBtn2.addEventListener('click', copyEmail);
    
    // Modal close
    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    // Enter key handlers for forms
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const resetEmail = document.getElementById('resetEmail');
    
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    if (resetEmail) {
        resetEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handlePasswordReset();
        });
    }
}

// Simplified form handler for better reliability
function handleFormSubmit(event, formType) {
    const statusElement = document.getElementById(formType === 'home' ? 'homeFormStatus' : 'contactFormStatus');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    showFormStatus(statusElement, 'Sending your message...', 'loading');
    
    // Let the form submit naturally to FormSubmit
    // The form will redirect to the _next URL after successful submission
    return true;
}
