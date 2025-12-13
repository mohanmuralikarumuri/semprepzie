import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, adminLogin } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isAdminMode) {
        await adminLogin(email, password);
        toast.success('Admin logged in successfully!');
      } else {
        await login(email, password);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      if (error.message.includes('not verified')) {
        toast.error(error.message, { duration: 6000 });
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    setErrors({});
    setEmail('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Hero Section */}
        <div className="login-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9V15L12 20L21 15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="hero-title">Semprepzie</h1>
            <p className="hero-subtitle">Your Gateway to Academic Excellence</p>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span>Comprehensive Study Materials</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔬</span>
                <span>Interactive Lab Programs</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💡</span>
                <span>Smart Learning Platform</span>
              </div>
            </div>
          </div>
          <div className="hero-decoration">
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-form-container">
            <div className="form-header">
              <h2 className="form-title">
                {isAdminMode ? '🔐 Admin Access' : '👋 Welcome Back'}
              </h2>
              <p className="form-subtitle">
                {isAdminMode 
                  ? 'Sign in with administrator credentials' 
                  : 'Sign in to continue your learning journey'
                }
              </p>
            </div>

            {/* Admin Mode Toggle */}
            <div className="admin-toggle-container">
              <button
                type="button"
                onClick={toggleAdminMode}
                className={`admin-toggle-btn ${isAdminMode ? 'admin-mode' : 'student-mode'}`}
              >
                <span className="toggle-icon">
                  {isAdminMode ? '👤' : '⚙️'}
                </span>
                <span className="toggle-text">
                  {isAdminMode ? 'Switch to Student Login' : 'Login as Admin'}
                </span>
              </button>
            </div>

            {/* Login Form */}
            <form className="login-form" onSubmit={handleSubmit}>
              {isAdminMode && (
                <div className="admin-notice">
                  <svg className="notice-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V11M12 7H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Admin Mode Active</span>
                </div>
              )}
              
              <div className="form-fields">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdminMode ? "admin@example.com" : "your.email@aitsrajampet.ac.in"}
                  error={errors.email}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  error={errors.password}
                  required
                />
              </div>

              <div className="form-actions">
                <Link
                  to="/forgot-password"
                  className="forgot-password-link"
                >
                  <svg className="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11M5 11H19C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full submit-button"
                loading={loading}
                disabled={loading}
              >
                {isAdminMode ? '🔐 Sign in as Admin' : '🚀 Sign in'}
              </Button>
            </form>

            {/* Sign up link - Hide in admin mode */}
            {!isAdminMode && (
              <div className="signup-link-container">
                <p className="signup-text">
                  Don't have an account?{' '}
                  <Link to="/signup" className="signup-link">
                    Create one now
                  </Link>
                </p>
              </div>
            )}

            {/* Contact link */}
            <div className="contact-link-container">
              <Link to="/contact" className="contact-link">
                <svg className="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C10.4607 21 9.01172 20.6116 7.75 19.9297L3 21L4.07031 16.25C3.38836 14.9883 3 13.5393 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Need help? Contact support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
