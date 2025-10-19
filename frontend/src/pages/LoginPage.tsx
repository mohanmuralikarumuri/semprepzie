import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { validateCollegeEmailShared, extractStudentNumberShared } from '../utils';
import toast from 'react-hot-toast';
import { AlertCircle, X } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // Report Issue Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: '',
    email: '',
    issue: ''
  });
  const [reportLoading, setReportLoading] = useState(false);

  const { login, adminLogin } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (isAdminMode) {
      // Admin mode: only check if it's a valid email format
      if (!email.includes('@')) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      // Student mode: check college email domain and authorization
      if (!email.endsWith('@aitsrajampet.ac.in')) {
        newErrors.email = 'Must use @aitsrajampet.ac.in email';
      } else if (!validateCollegeEmailShared(email)) {
        const studentNumber = extractStudentNumberShared(email);
        newErrors.email = `Access denied: Student number "${studentNumber}" is not authorized`;
      }
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
    // Don't auto-fill admin email - let user type it themselves
    if (!isAdminMode) {
      // Switching to admin mode - clear the field
      setEmail('');
    } else {
      // Switching back to student mode - clear the field
      setEmail('');
    }
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.name || !reportForm.email || !reportForm.issue) {
      toast.error('Please fill in all fields');
      return;
    }

    setReportLoading(true);
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : window.location.origin;

      const response = await fetch(`${apiUrl}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: reportForm.name,
          email: reportForm.email,
          subject: 'Login/Signup Issue Report',
          message: `Login Issue Report:\n\n${reportForm.issue}`
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Issue reported successfully! We will get back to you soon.');
        setShowReportModal(false);
        setReportForm({ name: '', email: '', issue: '' });
      } else {
        toast.error(data.error || data.message || 'Failed to send report');
      }
    } catch (error) {
      console.error('Failed to report issue:', error);
      toast.error('Failed to send report. Please try again later.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient mb-2">Semprepzie</h1>
          <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
            {isAdminMode ? 'Admin Access' : 'Welcome back'}
          </h2>
          <p className="text-secondary-600">
            {isAdminMode 
              ? 'Sign in with admin credentials' 
              : 'Sign in to your account to continue'
            }
          </p>
        </div>

        {/* Admin Mode Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={toggleAdminMode}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isAdminMode
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isAdminMode ? (
              <>
                👤 Switch to Student Login
              </>
            ) : (
              <>
                ⚙️ Login as Admin
              </>
            )}
          </button>
        </div>

        {/* Login Form */}
        <form className={`mt-8 space-y-6 ${isAdminMode ? 'border-2 border-blue-200 rounded-lg p-6 bg-blue-50' : ''}`} onSubmit={handleSubmit}>
          {isAdminMode && (
            <div className="text-center text-sm text-blue-700 bg-blue-100 rounded-md p-2">
              🔐 Admin Mode Active - Email domain validation disabled
            </div>
          )}
          
          <div className="space-y-4">
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

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {isAdminMode ? 'Sign in as Admin' : 'Sign in'}
          </Button>
        </form>

        {/* Sign up link - Hide in admin mode */}
        {!isAdminMode && (
          <div className="text-center">
            <p className="text-sm text-secondary-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}

        {/* Contact link */}
        <div className="text-center">
          <Link
            to="/contact"
            className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
          >
            Need help? Contact us
          </Link>
        </div>

        {/* Report Issue Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              // Auto-fill email from login form if user has typed it
              if (email) {
                setReportForm({ ...reportForm, email: email });
              }
              setShowReportModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            Having trouble logging in? Report an issue
          </button>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Report Login/Signup Issue</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Having trouble logging in or signing up? Let us know and we'll help you out!
            </p>

            <form onSubmit={handleReportIssue} className="space-y-4">
              <Input
                label="Your Name"
                type="text"
                value={reportForm.name}
                onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                placeholder="Enter your name"
                required
              />

              <Input
                label="Your Email"
                type="email"
                value={reportForm.email}
                onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                placeholder="your.email@aitsrajampet.ac.in"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe the Issue
                </label>
                <textarea
                  value={reportForm.issue}
                  onChange={(e) => setReportForm({ ...reportForm, issue: e.target.value })}
                  placeholder="Describe the problem you're facing..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={reportLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={reportLoading}
                  disabled={reportLoading}
                >
                  Send Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
