import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification, reload } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';

const VerifyEmailPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      if (user) {
        await reload(user);
        if (user.emailVerified) {
          // User is verified, redirect to dashboard
          window.location.href = '/dashboard';
        }
      }
    };

    checkVerification();
    
    // Set up interval to check verification status
    const interval = setInterval(checkVerification, 3000);
    
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If already verified, redirect to dashboard
  if (user.emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleResendEmail = async () => {
    if (!user || isResending || countdown > 0) return;

    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Check your inbox.');
      setCountdown(60); // 60 seconds cooldown
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to sign out?');
    
    if (!isConfirmed) {
      return; // User cancelled logout
    }

    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          
          {/* Email display */}
          <p className="text-gray-600 mb-6">
            We've sent a verification link to:
            <br />
            <span className="font-semibold text-primary-600">{user.email}</span>
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Check your email inbox</li>
              <li>2. Click the verification link</li>
              <li>3. Return to this page - you'll be redirected automatically</li>
            </ol>
          </div>

          {/* Resend button */}
          <button
            onClick={handleResendEmail}
            disabled={isResending || countdown > 0}
            className={`w-full py-2 px-4 rounded-lg font-medium mb-4 transition-all ${
              isResending || countdown > 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 active:transform active:scale-95'
            }`}
          >
            {isResending ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Verification Email'
            )}
          </button>

          {/* Help text */}
          <p className="text-sm text-gray-500 mb-6">
            Didn't receive the email? Check your spam folder or try resending.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              I've Verified - Refresh Page
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Having trouble? <a href="/contact" className="text-primary-600 hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
