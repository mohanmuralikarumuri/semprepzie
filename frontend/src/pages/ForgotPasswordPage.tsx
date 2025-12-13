import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import axios from 'axios';
import './ForgotPasswordPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateEmail = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!otp) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/otp/send`, { email });
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOTP()) {
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/otp/verify`, { email, otp });
      toast.success('OTP verified successfully!');
      setStep('reset');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      // Use Firebase password reset
      await sendPasswordResetEmail(auth, email);
      
      toast.success('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/otp/resend`, { email });
      toast.success('OTP resent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Left Side - Hero Section */}
        <div className="forgot-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V17M12 11H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="hero-title">Reset Password</h1>
            <p className="hero-subtitle">Don't worry, we'll help you get back in</p>
            
            <div className="progress-indicator">
              <div className={`progress-step ${step === 'email' ? 'active' : 'completed'}`}>
                <div className="step-circle">1</div>
                <span>Email</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step === 'otp' ? 'active' : step === 'reset' ? 'completed' : ''}`}>
                <div className="step-circle">2</div>
                <span>Verify</span>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step === 'reset' ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span>Reset</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="forgot-form-wrapper">
          <div className="forgot-form-container">
            {step === 'email' && (
              <>
                <div className="form-header">
                  <h2 className="form-title">📧 Enter Your Email</h2>
                  <p className="form-subtitle">
                    We'll send you a verification code to reset your password
                  </p>
                </div>

                <form className="forgot-form" onSubmit={handleSendOTP}>
                  <Input
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    error={errors.email}
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full submit-button"
                    loading={loading}
                    disabled={loading}
                  >
                    Send OTP
                  </Button>
                </form>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="form-header">
                  <h2 className="form-title">🔐 Verify OTP</h2>
                  <p className="form-subtitle">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                  </p>
                </div>

                <form className="forgot-form" onSubmit={handleVerifyOTP}>
                  <Input
                    label="OTP Code"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    error={errors.otp}
                    maxLength={6}
                    required
                  />

                  <div className="otp-actions">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="resend-button"
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full submit-button"
                    loading={loading}
                    disabled={loading}
                  >
                    Verify OTP
                  </Button>
                </form>
              </>
            )}

            {step === 'reset' && (
              <>
                <div className="form-header">
                  <h2 className="form-title">🔑 Create New Password</h2>
                  <p className="form-subtitle">
                    Choose a strong password for your account
                  </p>
                </div>

                <form className="forgot-form" onSubmit={handleResetPassword}>
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    error={errors.newPassword}
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    error={errors.confirmPassword}
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full submit-button"
                    loading={loading}
                    disabled={loading}
                  >
                    Reset Password
                  </Button>
                </form>
              </>
            )}

            <div className="back-to-login">
              <Link to="/login" className="back-link">
                <svg className="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
