# Phone OTP Testing Guide

## Important: Setup Test Phone Numbers in Firebase Console

To test phone OTP functionality, you need to:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/semprepzie-315b1/authentication/providers
2. **Enable Phone Authentication**: Make sure Phone provider is enabled
3. **Add Test Phone Numbers**: 
   - Click "Phone numbers for testing"
   - Add test number: `+91 9392651935` 
   - Set verification code: `123456`
   - Save the configuration

## Current Issue Resolution

The "An unexpected error occurred" message suggests:

1. **reCAPTCHA Domain Issues**: The domain `127.0.0.1:5500` might not be authorized
2. **Firebase Console Setup**: Test phone numbers need to be configured
3. **Rate Limiting**: Too many OTP requests to the same number

## Quick Fix Options:

### Option 1: Add Authorized Domains
1. Go to Firebase Console → Authentication → Settings
2. Add `127.0.0.1` and `localhost` to authorized domains

### Option 2: Use Test Phone Numbers
1. In Firebase Console, add test phone number `+91 9392651935` with code `123456`
2. This bypasses SMS sending and uses the predefined code

### Option 3: Enable App Verification Disabled for Testing
Uncomment this line in `firebase-config.js`:
```javascript
auth.settings.appVerificationDisabledForTesting = true;
```

## Current Implementation Features:
- ✅ Invisible reCAPTCHA on Send OTP button
- ✅ Proper error handling and logging
- ✅ Phone number validation (10 digits, starts with 6-9)
- ✅ Automatic +91 prefix addition
- ✅ Email verification required after phone OTP
- ✅ reCAPTCHA cleanup on errors

## Debug Steps:
1. Check browser console for detailed error messages
2. Verify Firebase project configuration
3. Test with configured test phone number
4. Check Firebase Authentication logs in console

## Production Deployment:
- Remove test mode settings
- Configure proper authorized domains
- Set up real phone number verification
