const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const cron = require('node-cron');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Firebase Admin SDK
try {
    const serviceAccount = require('./semprepzie-315b1-firebase-adminsdk-fbsvc-3adaf8c8b8.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'semprepzie-315b1'
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}

// Cron job to keep server alive (prevents Render from sleeping)
cron.schedule('*/14 * * * *', async () => {
    try {
        const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
        await axios.get(`${url}/api/health`);
        console.log(`Keep-alive ping sent at ${new Date().toISOString()}`);
    } catch (error) {
        console.error('Keep-alive ping failed:', error.message);
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many contact form submissions, please try again later.'
    }
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Validation middleware
const validateContactForm = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
];

// Firebase Auth middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Auth endpoints
app.post('/api/auth/verify-token', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        res.json({ 
            valid: true, 
            uid: decodedToken.uid,
            email: decodedToken.email 
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Get user profile (protected route)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const userRecord = await admin.auth().getUser(req.user.uid);
        res.json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            emailVerified: userRecord.emailVerified,
            creationTime: userRecord.metadata.creationTime
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Device Management Endpoints
// Device session storage (in-memory for now, use database in production)
const deviceSessions = new Map();

// Register device
app.post('/api/register-device', async (req, res) => {
    try {
        const { email, deviceId } = req.body;
        
        if (!email || !deviceId) {
            return res.status(400).json({ error: 'Email and deviceId are required' });
        }

        // Store device session
        if (!deviceSessions.has(email)) {
            deviceSessions.set(email, new Set());
        }
        deviceSessions.get(email).add(deviceId);

        console.log(`Device registered: ${deviceId} for ${email}`);
        res.json({ success: true, deviceId, email });
    } catch (error) {
        console.error('Device registration error:', error);
        res.status(500).json({ error: 'Failed to register device' });
    }
});

// Check device count
app.post('/api/check-devices', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const devices = deviceSessions.get(email) || new Set();
        const deviceCount = devices.size;
        const hasMultipleDevices = deviceCount > 1;

        res.json({
            hasMultipleDevices,
            deviceCount,
            devices: Array.from(devices)
        });
    } catch (error) {
        console.error('Device check error:', error);
        res.status(500).json({ error: 'Failed to check devices' });
    }
});

// Logout other devices
app.post('/api/logout-other-devices', async (req, res) => {
    try {
        const { email, currentDeviceId } = req.body;
        
        if (!email || !currentDeviceId) {
            return res.status(400).json({ error: 'Email and currentDeviceId are required' });
        }

        // Clear all devices except current one
        const devices = deviceSessions.get(email) || new Set();
        const otherDevices = Array.from(devices).filter(id => id !== currentDeviceId);
        
        // Keep only current device
        deviceSessions.set(email, new Set([currentDeviceId]));

        console.log(`Logged out ${otherDevices.length} other devices for ${email}`);
        res.json({ 
            success: true, 
            loggedOutDevices: otherDevices.length,
            currentDevice: currentDeviceId 
        });
    } catch (error) {
        console.error('Logout other devices error:', error);
        res.status(500).json({ error: 'Failed to logout other devices' });
    }
});

// Contact form endpoint
app.post('/api/contact', limiter, validateContactForm, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { name, email, message } = req.body;

        // Email options
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: 'semprepzie@gmail.com',
            replyTo: email,
            subject: `New Contact Form Message from ${name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>New Contact Form Message</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 0;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background: #ffffff;
                        }
                        .header { 
                            background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                            color: white; 
                            padding: 30px 20px; 
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 600;
                        }
                        .content { 
                            padding: 30px 20px; 
                            background: #f8fafc;
                        }
                        .field { 
                            margin-bottom: 20px; 
                            background: white;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .field-label { 
                            background: #e2e8f0;
                            padding: 12px 16px;
                            font-weight: 600; 
                            color: #374151;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .field-value { 
                            padding: 16px;
                            color: #1f2937;
                            line-height: 1.5;
                        }
                        .footer { 
                            background: #374151;
                            color: #9ca3af;
                            padding: 20px;
                            text-align: center; 
                            font-size: 12px;
                        }
                        .timestamp {
                            color: #6366f1;
                            font-weight: 500;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 New Message from Semprepzie</h1>
                        </div>
                        <div class="content">
                            <div class="field">
                                <div class="field-label">From</div>
                                <div class="field-value">${name}</div>
                            </div>
                            <div class="field">
                                <div class="field-label">Email</div>
                                <div class="field-value">${email}</div>
                            </div>
                            <div class="field">
                                <div class="field-label">Message</div>
                                <div class="field-value">${message.replace(/\n/g, '<br>')}</div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This message was sent from the Semprepzie website contact form.</p>
                            <p class="timestamp">Received on: ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Log successful submission
        console.log(`Contact form submission from: ${name} (${email}) at ${new Date().toISOString()}`);

        res.json({
            success: true,
            message: 'Message sent successfully!'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: 'Failed to send message. Please try again later.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Semprepzie Contact API',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        firebase: admin.apps.length > 0 ? 'connected' : 'disconnected'
    });
});

// Keep-alive endpoint specifically for cron
app.get('/api/ping', (req, res) => {
    res.json({ 
        status: 'alive', 
        timestamp: new Date().toISOString() 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Semprepzie Contact API running on port ${port}`);
    console.log(`📋 Health check: http://localhost:${port}/api/health`);
    console.log(`🔐 Firebase Auth: ${admin.apps.length > 0 ? 'Connected' : 'Disconnected'}`);
    console.log(`⏰ Cron job: Keep-alive pings every 14 minutes`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (process.env.RENDER_EXTERNAL_URL) {
        console.log(`🔗 External URL: ${process.env.RENDER_EXTERNAL_URL}`);
    }
});

module.exports = app;
