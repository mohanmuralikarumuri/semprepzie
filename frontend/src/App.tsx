import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { cacheManager } from './utils/cacheManager';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages (we'll create these)
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MigrationPage from './pages/MigrationPage'; // Temporary - remove after migration
import AdminDashboardNew from './pages/AdminDashboardNew';
import CodeExecutionPage from './pages/CodeExecutionPage';

// Import components
import AdminRoute from './components/AdminRoute';
import InstallPWA from './components/InstallPWA';
import OfflineIndicator from './components/OfflineIndicator';
import LabSection from './components/LabSection';
import SemprepzieLoader from './components/SemprepzieLoader';

// Loading component
const LoadingScreen: React.FC = () => (
  <SemprepzieLoader />
);

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

// Public route component (redirect to dashboard if already logged in)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && user.emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { loading } = useAuth();

  // Initialize cache manager and setup offline handlers
  useEffect(() => {
    cacheManager.setupOfflineHandlers();
    
    // Preload important documents when user is authenticated
    const initializeCache = async () => {
      if (cacheManager.isReady()) {
        console.log('[App] Cache manager ready');
      }
    };

    initializeCache();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-secondary-50">
        {/* PWA Components */}
        <OfflineIndicator />
        <InstallPWA />
        
        <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Temporary migration route - REMOVE AFTER MIGRATION */}
        <Route path="/migration" element={<MigrationPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <DocumentViewerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab"
          element={
            <ProtectedRoute>
              <LabSection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/:subjectId/program/:programId/execute"
          element={
            <ProtectedRoute>
              <CodeExecutionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mincode/:subjectId/program/:programId/execute"
          element={
            <ProtectedRoute>
              <CodeExecutionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardNew />
            </AdminRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;
