# Report Issue Feature

## Overview
Added a "Report Issue" feature on both Login and Signup pages to help users who are facing problems accessing their accounts.

## Features

### User Interface
- **Location**: Displayed at the bottom of both Login and Signup pages
- **Trigger**: Red button with alert icon and text "Can't sign up? Report an issue" (Signup) or "Having trouble logging in? Report an issue" (Login)
- **Modal**: Clean, centered modal with backdrop overlay

### Form Fields
1. **Name** (required)
   - Text input
   - Placeholder: "Enter your name"
   - Minimum 2 characters

2. **Email** (required)
   - Email input
   - Placeholder: "your.email@aitsrajampet.ac.in"
   - Email format validation

3. **Issue Description** (required)
   - Textarea (4 rows)
   - Placeholder: "Describe the problem you're facing..."
   - Minimum 10 characters

### Functionality
- **Validation**: Client-side validation with toast notifications
- **Submission**: Sends report to `semprepzie@gmail.com` via contact form API
- **Feedback**: Success/error messages via toast notifications
- **Reset**: Form clears and modal closes on successful submission
- **Loading State**: Submit button shows loading indicator during submission

## Technical Implementation

### Frontend Files
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/SignupPage.tsx`

### State Management
```typescript
const [showReportModal, setShowReportModal] = useState(false);
const [reportForm, setReportForm] = useState({
  name: '',
  email: '',
  issue: ''
});
const [reportLoading, setReportLoading] = useState(false);
```

### API Endpoint
- **URL**: `/api/contact`
- **Method**: POST
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "subject": "Login/Signup Issue Report",
    "message": "Issue description..."
  }
  ```

### Backend Configuration
- **Email Recipient**: `semprepzie@gmail.com` (hardcoded in `backend/src/controllers/contact.controller.ts`)
- **Email Service**: Gmail SMTP via Nodemailer
- **Required Environment Variables**:
  - `EMAIL_USER`: Your Gmail address (e.g., semprepzie@gmail.com)
  - `EMAIL_PASS`: Gmail App Password (not your regular password)

## Usage Flow

1. User visits Login or Signup page
2. User encounters a problem (can't login, can't verify email, etc.)
3. User clicks "Report an issue" button at bottom of page
4. Modal opens with form
5. User fills in name, email, and describes the issue
6. User clicks "Send Report"
7. System validates form fields
8. If valid, sends email to semprepzie@gmail.com
9. Success toast appears and modal closes
10. Admin receives email with issue details

## Benefits

- **Accessibility**: Users can report issues without being able to login
- **User Experience**: Clear feedback and easy-to-use interface
- **Support**: Admin receives structured issue reports via email
- **Common Issues**: Helps identify patterns in login/signup problems

## Testing Checklist

- [ ] Modal opens when clicking report button
- [ ] Modal closes when clicking X or Cancel
- [ ] Modal closes when clicking backdrop
- [ ] Form validation works (empty fields, invalid email)
- [ ] Form submits successfully
- [ ] Success toast appears after submission
- [ ] Error toast appears if submission fails
- [ ] Form resets after successful submission
- [ ] Email arrives at semprepzie@gmail.com
- [ ] Email contains all form data
- [ ] Loading state works during submission

## Configuration Required

Before using this feature, ensure:

1. **Backend Environment Variables** (in `backend/.env`):
   ```env
   EMAIL_USER=semprepzie@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

2. **Gmail App Password Setup**:
   - Go to Google Account → Security
   - Enable 2-Factor Authentication
   - Go to App Passwords
   - Generate new app password for "Mail"
   - Use this password in EMAIL_PASS (not your regular password)

3. **Test Email Delivery**:
   - Send a test report
   - Check semprepzie@gmail.com inbox
   - Verify subject line and message content

## Support

If you encounter issues with the report feature:
1. Check backend logs for errors
2. Verify EMAIL_USER and EMAIL_PASS are set correctly
3. Ensure Gmail allows less secure apps or app passwords are configured
4. Check spam/junk folder for test emails
5. Review browser console for frontend errors
