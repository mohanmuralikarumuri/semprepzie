import React, { useState } from 'react';
import { migrateStaticDataToSupabase, verifyMigration, MigrationResult } from '../utils/migration';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const MigrationPage: React.FC = () => {
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<MigrationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMigration = async () => {
    setIsLoading(true);
    setMigrationResult(null);
    
    try {
      const result = await migrateStaticDataToSupabase();
      setMigrationResult(result);
      
      if (result.success) {
        toast.success('Migration completed successfully!');
      } else {
        toast.error('Migration failed!');
      }
    } catch (error) {
      toast.error('Migration failed!');
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    setIsLoading(true);
    setVerificationResult(null);
    
    try {
      const result = await verifyMigration();
      setVerificationResult(result);
      
      if (result.success) {
        toast.success('Verification completed!');
      } else {
        toast.error('Verification failed!');
      }
    } catch (error) {
      toast.error('Verification failed!');
      setVerificationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-6">
            Supabase Migration Tool
          </h1>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ Important Instructions
              </h2>
              <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                <li>Make sure you have set up your Supabase database tables first</li>
                <li>Add your VITE_SUPABASE_ANON_KEY to your .env file</li>
                <li>Run migration only once to avoid duplicates</li>
                <li>This page should be removed after migration is complete</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  1. Run Migration
                </h3>
                <p className="text-blue-700 mb-4">
                  Migrate all static data from your code to Supabase tables.
                </p>
                <Button
                  onClick={handleMigration}
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full"
                >
                  Start Migration
                </Button>
                
                {migrationResult && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    migrationResult.success 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    <p className="font-semibold">
                      {migrationResult.success ? '✅ Success' : '❌ Failed'}
                    </p>
                    <p className="text-sm mt-1">{migrationResult.message}</p>
                    {migrationResult.details && (
                      <pre className="text-xs mt-2 bg-white p-2 rounded border">
                        {JSON.stringify(migrationResult.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  2. Verify Migration
                </h3>
                <p className="text-green-700 mb-4">
                  Check that all data was migrated correctly to Supabase.
                </p>
                <Button
                  onClick={handleVerification}
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full"
                  variant="secondary"
                >
                  Verify Data
                </Button>
                
                {verificationResult && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    verificationResult.success 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    <p className="font-semibold">
                      {verificationResult.success ? '✅ Success' : '❌ Failed'}
                    </p>
                    <p className="text-sm mt-1">{verificationResult.message}</p>
                    {verificationResult.details && (
                      <pre className="text-xs mt-2 bg-white p-2 rounded border">
                        {JSON.stringify(verificationResult.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Next Steps After Migration
              </h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>Update your components to use the `useSubjectsData` hook</li>
                <li>Test that everything works correctly</li>
                <li>Remove this migration page from your app</li>
                <li>Deploy your app - it will now use dynamic data from Supabase!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationPage;
