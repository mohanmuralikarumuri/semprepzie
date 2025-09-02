import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { validateCollegeEmailShared, extractStudentNumberShared } from '../utils';
import toast from 'react-hot-toast';

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
      </div>
    </div>
  );
};

export default LoginPage;
