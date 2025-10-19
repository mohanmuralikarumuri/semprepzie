import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Code, Minimize2, Menu, X, LogOut, ArrowLeft } from 'lucide-react';
import DocumentModifier from '../components/admin/DocumentModifier';
import AdminLabProgramManager from '../components/AdminLabProgramManager';
import AdminMinCodeProgramManager from '../components/AdminMinCodeProgramManager';

type AdminSection = 'documents' | 'lab-programs' | 'min-code';

const AdminDashboardNew: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('documents');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const sections = [
    {
      id: 'documents' as AdminSection,
      name: 'Document Modifier',
      icon: FileText,
      description: 'Manage subjects, units, and documents'
    },
    {
      id: 'lab-programs' as AdminSection,
      name: 'Lab Programs Modifier',
      icon: Code,
      description: 'Manage lab subjects and programs'
    },
    {
      id: 'min-code' as AdminSection,
      name: 'Min Code Modifier',
      icon: Minimize2,
      description: 'Manage minimum code examples'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header - Similar to main dashboard */}
      <header className={`sticky top-0 z-40 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="flex items-center justify-between px-4 py-4">
          {/* Left side - Back button, Logo and Title */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Back to Dashboard button */}
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} lg:hidden`}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkTheme ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                {/* Show "Admin" on mobile, full text on desktop */}
                <h1 className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  <span className="md:hidden">Admin</span>
                  <span className="hidden md:inline">Semprepzie Admin</span>
                </h1>
                <p className={`text-sm hidden md:block ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Content Management
                </p>
              </div>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDarkTheme ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
              title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkTheme ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              )}
            </button>

            {/* User Info */}
            <div className={`hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkTheme ? 'bg-blue-600' : 'bg-blue-500'} text-white font-semibold text-sm`}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Admin</p>
                <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} transition-colors`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static inset-y-0 left-0 z-30
          w-72 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          border-r transition-transform duration-300 ease-in-out
          mt-[73px] lg:mt-0
        `}>
          <div className="h-full overflow-y-auto p-4">
            <h2 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
              Admin Sections
            </h2>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? isDarkTheme
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : isDarkTheme
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <p className="font-medium">{section.name}</p>
                        <p className={`text-xs ${isActive ? 'text-blue-100' : isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Info Box */}
            <div className={`mt-6 p-4 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className={`text-sm font-semibold mb-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-900'}`}>
                💡 Admin Panel
              </h3>
              <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-blue-700'}`}>
                Manage all content from this centralized dashboard. Changes are saved directly to Supabase.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="p-6">
            {activeSection === 'documents' && <DocumentModifier isDarkTheme={isDarkTheme} />}
            {activeSection === 'lab-programs' && <AdminLabProgramManager />}
            {activeSection === 'min-code' && <AdminMinCodeProgramManager />}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboardNew;
