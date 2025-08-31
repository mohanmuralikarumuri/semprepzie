import { User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface LoginData {
  email: string;
  lastLoginAt: Date;
  loginCount: number;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    timezone: string;
  };
  ipAddress?: string; // This would need backend support
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginSession {
  sessionId: string;
  loginAt: Date;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    timezone: string;
  };
  ipAddress?: string;
}

// Get device information
const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

// Generate session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Track user login - stores comprehensive login data in Firestore
 */
export const trackUserLogin = async (user: User): Promise<void> => {
  try {
    // Check if Firestore is available
    if (!db) {
      console.warn('[LoginTracking] Firestore not available - skipping login tracking');
      return;
    }

    const userEmail = user.email;
    if (!userEmail) return;

    const deviceInfo = getDeviceInfo();
    const sessionId = generateSessionId();

    // Reference to user's login data document
    const userLoginRef = doc(db, 'user_logins', user.uid);
    
    // Check if document exists
    const userLoginDoc = await getDoc(userLoginRef);
    
    if (userLoginDoc.exists()) {
      // Update existing login data
      const currentData = userLoginDoc.data() as LoginData;
      
      await updateDoc(userLoginRef, {
        lastLoginAt: serverTimestamp(),
        loginCount: (currentData.loginCount || 0) + 1,
        deviceInfo,
        updatedAt: serverTimestamp(),
      });

      // Add to login sessions collection
      const sessionRef = doc(db, 'user_logins', user.uid, 'sessions', sessionId);
      await setDoc(sessionRef, {
        sessionId,
        loginAt: serverTimestamp(),
        deviceInfo,
      });

      console.log(`[LoginTracking] Updated login data for ${userEmail}, session: ${sessionId}`);
    } else {
      // Create new login data document
      await setDoc(userLoginRef, {
        email: userEmail,
        lastLoginAt: serverTimestamp(),
        loginCount: 1,
        deviceInfo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Add first login session
      const sessionRef = doc(db, 'user_logins', user.uid, 'sessions', sessionId);
      await setDoc(sessionRef, {
        sessionId,
        loginAt: serverTimestamp(),
        deviceInfo,
      });

      console.log(`[LoginTracking] Created login data for ${userEmail}, session: ${sessionId}`);
    }
  } catch (error) {
    console.error('[LoginTracking] Error tracking user login:', error);
    // Don't throw error to avoid disrupting login flow
  }
};

/**
 * Get user's login history
 */
export const getUserLoginData = async (userId: string): Promise<LoginData | null> => {
  try {
    // Check if Firestore is available
    if (!db) {
      console.warn('[LoginTracking] Firestore not available - cannot get login data');
      return null;
    }

    const userLoginRef = doc(db, 'user_logins', userId);
    const userLoginDoc = await getDoc(userLoginRef);
    
    if (userLoginDoc.exists()) {
      const data = userLoginDoc.data();
      return {
        ...data,
        lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as LoginData;
    }
    
    return null;
  } catch (error) {
    console.error('[LoginTracking] Error getting user login data:', error);
    return null;
  }
};

/**
 * Get Firebase Auth metadata (built-in last sign-in time)
 */
export const getFirebaseAuthMetadata = (user: User) => {
  return {
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime,
    lastSignInDate: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null,
    creationDate: user.metadata.creationTime ? new Date(user.metadata.creationTime) : null,
  };
};

/**
 * Format login data for display
 */
export const formatLoginData = (loginData: LoginData) => {
  const lastLogin = loginData.lastLoginAt;
  const now = new Date();
  const diffMs = now.getTime() - lastLogin.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let timeAgo: string;
  if (diffMinutes < 1) {
    timeAgo = 'Just now';
  } else if (diffMinutes < 60) {
    timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = lastLogin.toLocaleDateString();
  }

  return {
    timeAgo,
    fullDate: lastLogin.toLocaleString(),
    loginCount: loginData.loginCount,
    deviceInfo: loginData.deviceInfo,
  };
};

/**
 * Enhanced login data that combines Firebase Auth metadata and Firestore data
 */
export const getCompleteLoginData = async (user: User) => {
  const [firestoreData, authMetadata] = await Promise.all([
    getUserLoginData(user.uid),
    Promise.resolve(getFirebaseAuthMetadata(user))
  ]);

  return {
    firestore: firestoreData,
    firebase: authMetadata,
    combined: {
      email: user.email,
      lastLoginFirestore: firestoreData?.lastLoginAt,
      lastLoginFirebase: authMetadata.lastSignInDate,
      loginCount: firestoreData?.loginCount || 0,
      accountCreated: authMetadata.creationDate,
      deviceInfo: firestoreData?.deviceInfo,
    }
  };
};
