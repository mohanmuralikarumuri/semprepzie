import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user logged in via admin route
    // We'll store this in sessionStorage when admin login is successful
    const adminSession = sessionStorage.getItem('adminSession');
    const currentUserId = user?.uid;
    
    if (user && user.emailVerified && adminSession === currentUserId) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);
  
  return {
    isAdmin,
    currentUser: user
  };
};

export default useAdmin;
