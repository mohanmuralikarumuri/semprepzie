import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { createError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

// Store OTPs in memory (in production, use Redis or database)
interface OTPRecord {
  otp: string;
  email: string;
  expiresAt: Date;
  attempts: number;
}

const otpStore = new Map<string, OTPRecord>();

// Clean expired OTPs every 10 minutes
setInterval(() => {
  const now = new Date();
  for (const [key, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

class OTPController {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      logger.warn('Email credentials not configured. OTP functionality will be limited.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public async sendOTP(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError('Invalid email format', 400);
    }

    if (!this.transporter) {
      throw createError('Email service is not configured. Please contact administrator.', 503);
    }

    try {
      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP
      otpStore.set(email.toLowerCase(), {
        otp,
        email: email.toLowerCase(),
        expiresAt,
        attempts: 0,
      });

      // Send email
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP - Semprepzie',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                padding: 30px;
                color: white;
              }
              .otp-box {
                background: white;
                color: #333;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .otp {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #667eea;
              }
              .footer {
                margin-top: 20px;
                font-size: 14px;
                opacity: 0.9;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password. Use the OTP below to complete the process:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                <p class="otp">${otp}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
              </div>
              
              <p>If you didn't request a password reset, please ignore this email.</p>
              
              <div class="footer">
                <p><strong>Semprepzie Team</strong></p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`OTP sent successfully to ${email}`);

      res.json({
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: 600, // 10 minutes in seconds
      });
    } catch (error: any) {
      logger.error('Failed to send OTP:', error);
      throw createError('Failed to send OTP. Please try again later.', 500);
    }
  }

  public async verifyOTP(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createError('Email and OTP are required', 400);
    }

    const record = otpStore.get(email.toLowerCase());

    if (!record) {
      throw createError('OTP not found or expired. Please request a new one.', 404);
    }

    // Check expiration
    if (record.expiresAt < new Date()) {
      otpStore.delete(email.toLowerCase());
      throw createError('OTP has expired. Please request a new one.', 410);
    }

    // Check attempts
    if (record.attempts >= 5) {
      otpStore.delete(email.toLowerCase());
      throw createError('Too many failed attempts. Please request a new OTP.', 429);
    }

    // Verify OTP
    if (record.otp !== otp) {
      record.attempts++;
      throw createError(`Invalid OTP. ${5 - record.attempts} attempts remaining.`, 401);
    }

    // OTP verified successfully
    otpStore.delete(email.toLowerCase());

    logger.info(`OTP verified successfully for ${email}`);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      email: email.toLowerCase(),
    });
  }

  public async resendOTP(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    // Check if there's an existing OTP
    const existingRecord = otpStore.get(email.toLowerCase());
    if (existingRecord && existingRecord.expiresAt > new Date()) {
      const timeLeft = Math.ceil((existingRecord.expiresAt.getTime() - Date.now()) / 1000);
      throw createError(
        `Please wait ${timeLeft} seconds before requesting a new OTP`,
        429
      );
    }

    // Send new OTP
    await this.sendOTP(req, res);
  }
}

export default new OTPController();
