import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmailPage: React.FC = () => {
  const { user, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Auto-check verification status every 3 seconds
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkVerification = async () => {
      if (user.emailVerified) {
        toast.success('Email verified successfully! 🎉');
        navigate('/dashboard');
        return;
      }

      // Reload user to get fresh verification status
      try {
        await user.reload();
        if (user.emailVerified) {
          toast.success('Email verified successfully! 🎉');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    };

    const interval = setInterval(checkVerification, 3000);
    
    // Check immediately on mount
    checkVerification();

    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await resendVerification();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    if (!user) return;
    
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        toast.success('Email verified successfully! 🎉');
        navigate('/dashboard');
      } else {
        toast('Email not yet verified. Please check your inbox.', {
          icon: 'ℹ️',
        });
      }
    } catch (error: any) {
      toast.error('Failed to check verification status');
      console.error('Verification check error:', error);
    } finally {
      setChecking(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 mb-6">
            <Mail className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Verify Your Email</h1>
          <p className="text-secondary-600">
            We've sent a verification email to{' '}
            <span className="font-medium text-secondary-900">{user.email}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">What to do next:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the verification link in the email</li>
            <li>Return to this page - you'll be automatically redirected</li>
          </ol>
        </div>

        {/* Auto-checking status */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-secondary-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Automatically checking verification status...</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleCheckNow}
            className="w-full"
            variant="primary"
            loading={checking}
            disabled={checking}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Check Verification Status
          </Button>

          <Button
            onClick={handleResendEmail}
            className="w-full"
            variant="outline"
            loading={loading}
            disabled={loading}
          >
            <Mail className="w-4 h-4 mr-2" />
            Resend Verification Email
          </Button>
        </div>

        {/* Help text */}
        <div className="text-center space-y-4">
          <div className="text-sm text-secondary-500">
            <p>Didn't receive the email?</p>
            <ul className="mt-2 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes and try again</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-secondary-200">
            <button
              onClick={() => navigate('/contact')}
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
            >
              Still having trouble? Contact support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;