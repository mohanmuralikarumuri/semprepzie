import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { createError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

class ContactController {
  private transporter!: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error);
      } else {
        logger.info('Email transporter is ready to send messages');
      }
    });
  }

  public async submitForm(req: Request, res: Response): Promise<void> {
    const { name, email, subject, message } = req.body;

    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.error('Email not configured: Missing EMAIL_USER or EMAIL_PASS environment variables');
      throw createError('Email service is not configured. Please contact the administrator.', 500);
    }

    // Validation
    if (!name || !email || !message) {
      throw createError('Name, email, and message are required', 400);
    }

    if (name.length < 2 || name.length > 50) {
      throw createError('Name must be between 2 and 50 characters', 400);
    }

    if (message.length < 10 || message.length > 1000) {
      throw createError('Message must be between 10 and 1000 characters', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError('Please provide a valid email address', 400);
    }

    try {
      // Email content
      const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || 'semprepzie@gmail.com',
        replyTo: email,
        subject: subject || `New Contact Form Message from ${name}`,
        html: this.generateEmailTemplate(name, email, message, subject)
      };

      // Send email
      await this.transporter.sendMail(mailOptions);

      logger.info(`Contact form submitted by ${name} (${email})`);

      res.json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!'
      });
    } catch (error) {
      logger.error('Failed to send contact form email:', error);
      throw createError('Failed to send message. Please try again later.', 500);
    }
  }

  private generateEmailTemplate(name: string, email: string, message: string, subject?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Contact Form Message</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .message-section {
            background: #ffffff;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 100px;
          }
          h1 {
            margin: 0;
            font-size: 24px;
          }
          h2 {
            color: #667eea;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📧 New Contact Form Message</h1>
          <p>Semprepzie Educational Platform</p>
        </div>
        
        <div class="content">
          <div class="info-section">
            <h2>📋 Contact Information</h2>
            <p><span class="label">Name:</span> ${name}</p>
            <p><span class="label">Email:</span> ${email}</p>
            <p><span class="label">Subject:</span> ${subject || 'No subject provided'}</p>
            <p><span class="label">Date:</span> ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="message-section">
            <h2>💬 Message</h2>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This message was sent through the Semprepzie contact form.</p>
          <p>Please reply directly to <strong>${email}</strong> to respond to ${name}.</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const contactController = new ContactController();
