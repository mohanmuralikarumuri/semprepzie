# Fix Contact Form on Render

## Problem
The contact form is not working on Render because email environment variables are not configured.

## Root Cause
The contact controller requires these environment variables:
- `EMAIL_USER` - Gmail account to send emails from
- `EMAIL_PASS` - Gmail app-specific password
- `EMAIL_HOST` - SMTP host (default: smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (default: 587)
- `EMAIL_TO` - Recipient email (default: semprepzie@gmail.com)

## Solution

### Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **Generate** and select:
   - App: Mail
   - Device: Other (enter "Semprepzie Render")
5. Copy the 16-character password (example: `abcd efgh ijkl mnop`)

### Step 2: Add Environment Variables in Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your **semprepzie** web service
3. Go to **Environment** tab
4. Click **Add Environment Variable** and add:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_TO=semprepzie@gmail.com
```

### Step 3: Redeploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for deployment to complete
3. Test the contact form

## Verification

Test the contact form by:
1. Going to https://semprepzie.onrender.com/contact
2. Fill out the form with test data
3. Click "Send Message"
4. Check for success message
5. Verify email arrives at EMAIL_TO address

## Alternative: Use SendGrid (Recommended for Production)

If you want better email deliverability, use SendGrid instead:

1. Sign up at https://sendgrid.com/ (free tier: 100 emails/day)
2. Create an API key
3. Update environment variables in Render:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@semprepzie.com
EMAIL_TO=semprepzie@gmail.com
```

4. Update `backend/src/controllers/contact.controller.ts` to use SendGrid:

```typescript
// Add SendGrid support
import sgMail from '@sendgrid/mail';

private initializeTransporter(): void {
  if (process.env.EMAIL_PROVIDER === 'sendgrid') {
    if (!process.env.SENDGRID_API_KEY) {
      logger.warn('SendGrid API key not configured');
      return;
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    logger.info('SendGrid email service initialized');
  } else {
    // Existing nodemailer code...
  }
}
```

## Troubleshooting

### Issue: Email not sending

**Check 1**: Verify environment variables are set
```bash
# SSH into Render and check
echo $EMAIL_USER
echo $EMAIL_PASS
```

**Check 2**: Check logs in Render dashboard for errors

**Check 3**: Test email configuration
```bash
# Use Render shell
curl -X POST https://semprepzie.onrender.com/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

### Issue: "Email service is not configured"

This means EMAIL_USER or EMAIL_PASS is missing. Add them in Render dashboard.

### Issue: Gmail blocking sign-in

1. Enable 2-Step Verification in Gmail
2. Use App Password (not regular password)
3. Allow "Less secure app access" (not recommended, use App Password instead)

## Security Notes

- Never commit EMAIL_PASS to git
- Use App Passwords, not main Gmail password
- Consider using SendGrid for production
- Add rate limiting to prevent spam (already implemented)

## Current Rate Limits

The contact form has rate limiting:
- 5 requests per 15 minutes per IP
- Prevents spam and abuse

## Testing Locally

To test email functionality locally:

1. Create `backend/.env` file:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_TO=your-email@example.com
```

2. Run backend:
```bash
cd backend
npm run dev
```

3. Test from frontend:
```bash
cd frontend
npm run dev
```

4. Submit contact form at http://localhost:5173/contact

---

## Summary

The contact form on Render is failing because:
1. ❌ EMAIL_USER environment variable not set
2. ❌ EMAIL_PASS environment variable not set

**To fix**: Add EMAIL_USER and EMAIL_PASS in Render dashboard → Environment tab → Manual Deploy

