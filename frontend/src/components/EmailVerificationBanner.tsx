import React, { useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface EmailVerificationBannerProps {
  show: boolean;
  onClose?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ show, onClose }) => {
  const [sending, setSending] = useState(false);
  const { user, resendVerification } = useAuth();

  if (!show || !user || user.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    setSending(true);
    try {
      await resendVerification();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Mail className="w-5 h-5 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Email Verification Required
            </h3>
            <p className="text-sm text-yellow-700">
              Please verify your email address ({user.email}) to access all features.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResendVerification}
            disabled={sending}
            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50 flex items-center"
          >
            {sending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-1" />
                Resend Email
              </>
            )}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-yellow-600 hover:text-yellow-800 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
