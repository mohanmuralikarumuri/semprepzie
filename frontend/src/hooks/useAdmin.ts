import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ADMIN_EMAIL } from '../utils';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is the admin based on email
    if (user && user.email && user.emailVerified) {
      const isAdminUser = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      setIsAdmin(isAdminUser);
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
