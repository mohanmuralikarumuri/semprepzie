import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, ArrowLeft } from 'lucide-react';
import { validateCollegeEmailShared, extractStudentNumberShared } from '../utils';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    
    if (!email.endsWith('@aitsrajampet.ac.in')) {
      setError('Must use @aitsrajampet.ac.in email');
      return false;
    }
    
    if (!validateCollegeEmailShared(email)) {
      const studentNumber = extractStudentNumberShared(email);
      setError(`Access denied: Student number "${studentNumber}" is not authorized`);
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <Mail className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Check Your Email</h1>
            <p className="text-secondary-600 mb-6">
              We've sent a password reset link to{' '}
              <span className="font-medium text-secondary-900">{email}</span>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Click the link in the email to reset your password. 
                The link will expire in 1 hour for security reasons.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient mb-2">Semprepzie</h1>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-2">Reset Password</h2>
          <p className="text-secondary-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Reset Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@aitsrajampet.ac.in"
              error={error}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Reset Email
          </Button>
        </form>

        {/* Back to login */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Contact link */}
        <div className="text-center">
          <Link
            to="/contact"
            className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
          >
            Need help? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;