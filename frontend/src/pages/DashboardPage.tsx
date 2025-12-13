import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { toast } from 'react-hot-toast';
import CacheManagement from '../components/CacheManagement';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import './dashboard.css';

const DashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showCacheManagement, setShowCacheManagement] = useState(false);
  const { scrollY } = useScroll();
  const navbarBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.95)']
  );
  const navbarShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 1px 3px 0 rgba(0, 0, 0, 0.1)', '0 10px 15px -3px rgba(0, 0, 0, 0.1)']
  );

  useEffect(() => {
    // Theme detection
    const theme = localStorage.getItem('theme') || 'light';
    setIsDarkTheme(theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.classList.toggle('menu-open', !mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  const handleLogout = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to logout?');
    
    if (!isConfirmed) {
      return; // User cancelled logout
    }

    try {
      await logout();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Navigation */}
      <motion.nav 
        className="navbar"
        style={{
          backgroundColor: navbarBackground,
          boxShadow: navbarShadow,
        }}
      >
        <div className="nav-container">
          <div className="nav-logo">
            <h1>✨ Semprepzie</h1>
          </div>
        
          <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <li>
              <NavLink 
                to="/dashboard" 
                end
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/dashboard/theory"
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Theory
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/dashboard/lab"
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Lab
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/dashboard/mincode"
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                MinCode
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/dashboard/contact"
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Contact
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/dashboard/about"
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                About
              </NavLink>
            </li>
          </ul>

          <div className="nav-controls">
            {isAdmin && (
              <div className="admin-toggle">
                <motion.button 
                  onClick={() => navigate('/admin')}
                  title="Admin Dashboard"
                  className="admin-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⚙️
                </motion.button>
              </div>
            )}

            <div className="theme-toggle">
              <motion.button 
                onClick={toggleTheme}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </motion.button>
            </div>

            <div className="cache-toggle">
              <motion.button 
                onClick={() => setShowCacheManagement(true)}
                title="Cache Management"
                className="cache-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                💾
              </motion.button>
            </div>

            <div className="logout-toggle">
              <motion.button 
                onClick={handleLogout}
                title="Logout"
                className="logout-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                🚪
              </motion.button>
            </div>
            
            <motion.button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              whileTap={{ scale: 0.95 }}
            >
              <span></span>
              <span></span>
              <span></span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Email Verification Banner */}
      <EmailVerificationBanner show={true} />

      {/* Main Content - Router Outlet */}
      <main className="main-site">
        <Outlet context={{ darkMode: isDarkTheme }} />
      </main>

      {/* Cache Management Modal */}
      <CacheManagement
        isOpen={showCacheManagement}
        onClose={() => setShowCacheManagement(false)}
      />
    </div>
  );
};

export default DashboardPage;
