# Admin Setup Guide

## Simple Admin System

The admin system now works with a simplified approach - no custom claims or complex setup needed!

### How It Works:

1. **Admin accounts are created directly in Firebase Console**
2. **No special setup required** - just valid Firebase Auth credentials
3. **Any Firebase user can be admin** if they use the admin login option
4. **Only requirement**: Email must be verified

### Setting Up Admin Users:

#### Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `semprepzie-315b1`
3. Navigate to **Authentication > Users**
4. Click **Add User**
5. Enter email and password for the admin
6. The user will automatically receive a verification email
7. Admin can now login using the admin login option

#### Method 2: Admin Signup (Alternative)

1. Create a simple admin signup form (optional)
2. Use Firebase Auth `createUserWithEmailAndPassword`
3. Send email verification
4. Admin can login once verified

### Admin Login Process:

1. User goes to the app and clicks "Admin" toggle
2. Enters their Firebase Auth email/password
3. System validates credentials with Firebase Auth
4. If valid and email is verified → Admin access granted
5. If invalid or unverified → Login fails

### Admin Features:

- Upload PDFs to Supabase storage ('pdfs' bucket)
- Add metadata for documents (subject, unit, title)
- View admin dashboard
- Manage documents through admin interface

## Security Notes

- Admin access is based on using the admin login option
- Regular students use college email domain validation
- Admin accounts bypass college email domain restrictions
- Email verification is required for all admin accounts
- No custom claims or server-side validation needed

## Example Admin Users

You can create admin accounts with any email:
- `admin@semprepzie.com`
- `manager@company.com` 
- `yourname@gmail.com`
- etc.

The system is now much simpler and lighter! 🎉
