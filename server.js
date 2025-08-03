const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many contact form submissions, please try again later.'
    }
});

// Email configuration
const transporter = nodemailer.createTransporter({
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
        service: 'Semprepzie Contact API'
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
    console.log(`Semprepzie Contact API running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
});

module.exports = app;
