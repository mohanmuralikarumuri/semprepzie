import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, Users, BarChart3, Settings } from 'lucide-react';
import AdminUpload from '../components/AdminUpload';
import EmailVerificationBanner from '../components/EmailVerificationBanner';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Admin Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Banner */}
      <EmailVerificationBanner show={true} />

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <AdminUpload />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Upload className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Upload Document</p>
                      <p className="text-sm text-gray-500">Add new PDF to library</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Manage Documents</p>
                      <p className="text-sm text-gray-500">View and edit existing files</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">View Analytics</p>
                      <p className="text-sm text-gray-500">Check usage statistics</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Available
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Admin User</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
