import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { validateCollegeEmailShared, extractStudentNumberShared } from '../utils';
import toast from 'react-hot-toast';
import { AlertCircle, X } from 'lucide-react';
import { getApiUrl } from '../config/api';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Report Issue Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: '',
    email: '',
    issue: ''
  });
  const [reportLoading, setReportLoading] = useState(false);

  const { signup } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@aitsrajampet.ac.in')) {
      newErrors.email = 'Must use @aitsrajampet.ac.in email';
    } else if (!validateCollegeEmailShared(formData.email)) {
      const studentNumber = extractStudentNumberShared(formData.email);
      newErrors.email = `Access denied: Student number "${studentNumber}" is not in the authorized list. Please contact admin if this is an error.`;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.displayName);
      toast.success('Account created! Please check your email for verification.');
    } catch (error: any) {
      // Show specific error for unauthorized students
      if (error.message.includes('Only @aitsrajampet.ac.in emails are allowed')) {
        const studentNumber = extractStudentNumberShared(formData.email);
        toast.error(`Access denied: Student number "${studentNumber}" is not authorized. Contact admin if this is an error.`);
      } else {
        toast.error(error.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
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
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: reportForm.name,
          email: reportForm.email,
          subject: 'Signup Issue Report',
          message: reportForm.issue
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Issue reported successfully! We will get back to you soon.');
        setShowReportModal(false);
        setReportForm({ name: '', email: '', issue: '' });
      } else {
        toast.error(data.message || 'Failed to send report');
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
          <h2 className="text-2xl font-semibold text-secondary-900 mb-2">Create your account</h2>
          <p className="text-secondary-600">Join our educational platform</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only authorized student numbers can register. 
              Your email format should be: rollnumber@aitsrajampet.ac.in
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Display Name"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Your full name"
              error={errors.displayName}
              required
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@aitsrajampet.ac.in"
              error={errors.email}
              helperText="Use your college roll number format"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              helperText="Must be at least 6 characters"
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>
        </form>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-secondary-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
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

        {/* Report Issue Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            Can't sign up? Report an issue
          </button>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Report Signup Issue</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Having trouble signing up? Let us know and we'll help you out!
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

export default SignupPage;
