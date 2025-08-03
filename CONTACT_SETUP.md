# Semprepzie Contact Form Setup

This document explains how to set up the contact form functionality for the Semprepzie website.

## Contact Form Features

- ✅ Multiple fallback methods for reliability
- ✅ Client-side form validation
- ✅ Beautiful success/error notifications
- ✅ Rate limiting to prevent spam
- ✅ Email templates with professional styling
- ✅ Direct email client fallback option

## Setup Options

### Option 1: PHP Backend (Recommended for shared hosting)

1. **Upload files**: Upload `contact.php` to your web server
2. **Configure email**: Update the `$to` variable in `contact.php` with your email
3. **Test**: The form will automatically use the PHP backend

**Requirements:**
- PHP 7.0 or higher
- `mail()` function enabled on server
- Write permissions for log file (optional)

### Option 2: Node.js Backend (Recommended for VPS/dedicated servers)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   # Create .env file
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   PORT=3001
   ```

3. **Start the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Update JavaScript**: Change the API endpoint in `script.js`:
   ```javascript
   const response = await fetch('/api/contact', {
   ```

**Requirements:**
- Node.js 14.0 or higher
- Gmail account with App Password

### Option 3: Third-party Services (Fallback)

The contact form also supports:

#### Formspree
1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form and get your endpoint
3. Update the endpoint in `sendToFormspree()` function

#### EmailJS
1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Create a service and template
3. Update the service ID, template ID, and user ID in `sendToEmailJS()`

## Email Configuration

### Gmail Setup (for Node.js backend)
1. Enable 2-Factor Authentication
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in your environment variables

### Custom SMTP
Update the `transporter` configuration in `server.js`:
```javascript
const transporter = nodemailer.createTransporter({
    host: 'your-smtp-server.com',
    port: 587,
    secure: false,
    auth: {
        user: 'your-email@domain.com',
        pass: 'your-password'
    }
});
```

## File Structure

```
semprepzie/
├── index.html          # Main website file
├── script.js           # Contact form JavaScript
├── styles.css          # Form styling
├── contact.php         # PHP backend
├── server.js           # Node.js backend
├── package.json        # Node.js dependencies
└── CONTACT_SETUP.md    # This file
```

## Testing

1. **Local testing**: Use a local server (XAMPP, WAMP, or `php -S localhost:8000`)
2. **Form validation**: Try submitting empty fields, invalid emails
3. **Success flow**: Submit a valid form and check your email
4. **Error handling**: Test with server offline to see fallback options

## Troubleshooting

### Common Issues

**Form not submitting:**
- Check browser console for JavaScript errors
- Verify server configuration
- Test with "Email Directly" button

**Emails not received:**
- Check spam/junk folder
- Verify email configuration
- Check server logs

**CORS errors:**
- Ensure proper CORS headers in backend
- Use same domain for frontend and backend

### Support

If you need help setting up the contact form:
1. Check the browser console for errors
2. Review server logs
3. Test each fallback method individually
4. Contact support with specific error messages

## Security Features

- Input validation and sanitization
- Rate limiting (5 submissions per 15 minutes)
- CORS configuration
- XSS protection
- Email header injection prevention

## Customization

### Styling
Update the form styles in `styles.css` under the `.form-status` and `.contact-form` sections.

### Email Templates
Modify the HTML email templates in `contact.php` or `server.js` to match your branding.

### Validation Rules
Adjust validation rules in the JavaScript `isValidEmail()` function or server-side validators.
