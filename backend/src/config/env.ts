import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend directory
// This must be loaded BEFORE any other imports that use process.env
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Failed to load .env file:', result.error);
} else {
  console.log('✅ .env loaded successfully');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
}

// Export a dummy value to ensure this module is imported for side effects
export const envLoaded = true;
