import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCompleteLoginData, formatLoginData } from '../services/loginTracking';
import { Clock, Monitor, Globe, Calendar, User, Activity } from 'lucide-react';

interface LoginInfoProps {
  className?: string;
  showDetailed?: boolean;
}

const LoginInfo: React.FC<LoginInfoProps> = ({ className = '', showDetailed = false }) => {
  const { user } = useAuth();
  const [loginData, setLoginData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoginData = async () => {
      if (!user) return;

      try {
        const data = await getCompleteLoginData(user);
        setLoginData(data);
      } catch (error) {
        console.error('Error fetching login data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginData();
  }, [user]);

  if (!user || loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (!loginData) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <p className="text-sm">Login data not available</p>
      </div>
    );
  }

  const { firestore, firebase } = loginData;
  const formattedData = firestore ? formatLoginData(firestore) : null;

  if (!showDetailed) {
    // Simple view for dashboard
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Last Login</h3>
            <p className="text-sm text-gray-600">Your recent activity</p>
          </div>
        </div>

        <div className="space-y-2">
          {firebase.lastSignInDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Firebase Auth:</span>
              <span className="text-sm font-medium text-gray-900">
                {formattedData?.timeAgo || firebase.lastSignInDate.toLocaleDateString()}
              </span>
            </div>
          )}

          {firestore && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Login Count:</span>
              <span className="text-sm font-medium text-gray-900">
                {firestore.loginCount} times
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed view for profile page
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Login Activity</h2>
            <p className="text-gray-600">Your account access history</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Account Overview */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Account Created</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {firebase.creationDate?.toLocaleDateString() || 'Unknown'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Total Logins</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {firestore?.loginCount || 0} times
              </p>
            </div>
          </div>
        </div>

        {/* Last Login Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Last Login Details
          </h3>
          
          <div className="space-y-4">
            {/* Firebase Auth Last Login */}
            {firebase.lastSignInDate && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Firebase Authentication</h4>
                    <p className="text-blue-700">
                      {firebase.lastSignInDate.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                    Official Record
                  </span>
                </div>
              </div>
            )}

            {/* Firestore Detailed Login */}
            {firestore && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Detailed Tracking</h4>
                    <p className="text-green-700">
                      {firestore.lastLoginAt.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {formattedData?.timeAgo}
                    </p>
                  </div>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                    Enhanced Data
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Information */}
        {firestore?.deviceInfo && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Last Used Device
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Platform</span>
                </div>
                <p className="text-gray-900 text-sm">{firestore.deviceInfo.platform}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Language</span>
                </div>
                <p className="text-gray-900 text-sm">{firestore.deviceInfo.language}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Screen Resolution</span>
                </div>
                <p className="text-gray-900 text-sm">{firestore.deviceInfo.screenResolution}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Timezone</span>
                </div>
                <p className="text-gray-900 text-sm">{firestore.deviceInfo.timezone}</p>
              </div>
            </div>

            {/* Browser Info (collapsed by default) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                View Browser Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 break-all">
                  {firestore.deviceInfo.userAgent}
                </p>
              </div>
            </details>
          </div>
        )}

        {/* Security Note */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Security Note:</strong> We track your login activity to help secure your account. 
            If you notice any suspicious activity, please contact support immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginInfo;
