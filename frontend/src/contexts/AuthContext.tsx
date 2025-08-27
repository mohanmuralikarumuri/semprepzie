import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiService } from '../services/api';
import { validateCollegeEmailShared, generateDeviceId } from '../utils';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string }) => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Register device when user signs in
        try {
          const deviceId = generateDeviceId();
          await apiService.registerDevice(user.email!, deviceId);
        } catch (error) {
          console.error('Failed to register device:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Validate email domain
      if (!validateCollegeEmailShared(email)) {
        throw new Error('Only @aitsrajampet.ac.in emails are allowed');
      }

      // Validate with backend first
      await apiService.login({ email, password });

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in');
        await sendEmailVerification(user);
        await signOut(auth);
        throw new Error('Email not verified');
      }

      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else {
        throw new Error(error.message || 'Login failed');
      }
    }
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      // Validate email domain
      if (!validateCollegeEmailShared(email)) {
        throw new Error('Only @aitsrajampet.ac.in emails are allowed');
      }

      // Validate password
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Create account with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Send email verification
      await sendEmailVerification(user);

      // Register with backend
      await apiService.signup({ email, password, displayName });

      toast.success('Account created! Please check your email for verification');
    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else {
        throw new Error(error.message || 'Signup failed');
      }
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      // Validate email domain
      if (!validateCollegeEmailShared(email)) {
        throw new Error('Only @aitsrajampet.ac.in emails are allowed');
      }

      // Validate with backend first
      await apiService.resetPassword(email);

      // Send reset email
      await sendPasswordResetEmail(auth, email);
      
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Reset password error:', error);

      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      } else {
        throw new Error(error.message || 'Failed to send reset email');
      }
    }
  };

  const updateUserProfile = async (data: { displayName?: string }): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');

      // Update Firebase profile
      await updateProfile(user, data);

      // Update backend profile
      await apiService.updateProfile(data);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const resendVerification = async (): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');

      await sendEmailVerification(user);
      toast.success('Verification email sent!');
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
