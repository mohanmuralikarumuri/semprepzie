# Deployment Instructions for Render

## Environment Variables

When deploying to Render, make sure to set the following environment variables:

### Required Variables
```
NODE_ENV=production
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
```

### Optional Variables
```
PORT=3001
```

## Build Commands

### Build Command
```bash
npm install
```

### Start Command
```bash
npm start
```

## Auto-Deploy Setup

1. Connect your GitHub repository to Render
2. Set the build and start commands above
3. Add the environment variables
4. Deploy!

## Keep-Alive Mechanism

The application includes a built-in keep-alive system that:

1. **Internal Cron Job**: Runs every 14 minutes to ping the `/api/ping` endpoint
2. **Health Check**: Available at `/api/health` for monitoring
3. **Automatic**: No external cron service needed

### How it works:
- The server includes a `node-cron` job that runs every 14 minutes
- It makes an HTTP request to its own `/api/ping` endpoint
- This prevents Render from putting the service to sleep
- Logs are generated for monitoring

### Endpoints:
- `GET /api/health` - Full health check with system info
- `GET /api/ping` - Simple keep-alive endpoint
- `POST /api/contact` - Contact form submission
- `POST /api/auth/verify-token` - Firebase token verification
- `GET /api/auth/profile` - User profile (requires auth)

## Firebase Setup

### Admin SDK
The server uses Firebase Admin SDK for backend authentication verification.
Make sure the `semprepzie-315b1-firebase-adminsdk-fbsvc-3adaf8c8b8.json` file is included in your deployment.

### Client SDK
The frontend uses Firebase Web SDK v9+ with the following features:
- Email/password authentication
- Password reset
- User profile management
- Token-based API authentication

## Features

### Authentication
- **Firebase Auth**: Modern email/password authentication
- **Legacy Support**: Backward compatibility with student ID login
- **Auto-login**: Persistent sessions with token refresh
- **Password Reset**: Email-based password recovery

### Backend Features
- **Express.js API**: RESTful endpoints
- **Rate Limiting**: Protection against spam
- **Input Validation**: Server-side validation with express-validator
- **Email Service**: Nodemailer integration for contact forms
- **CORS**: Cross-origin resource sharing enabled
- **Security**: Helmet.js for security headers

### Keep-Alive Features
- **Internal Cron**: No external services needed
- **Self-Pinging**: Prevents service sleep
- **Health Monitoring**: Detailed system information
- **Error Handling**: Graceful failure handling

## Monitoring

Check the logs in Render dashboard to see:
- Keep-alive ping messages every 14 minutes
- Authentication events
- Contact form submissions
- Error messages and system health

## Troubleshooting

### Service Still Sleeping?
- Check if `RENDER_EXTERNAL_URL` is set correctly
- Verify the cron job is running (check logs)
- Ensure the `/api/ping` endpoint is accessible

### Authentication Issues?
- Verify Firebase configuration
- Check if the admin SDK JSON file is properly deployed
- Test token verification endpoint

### Email Not Working?
- Verify `EMAIL_USER` and `EMAIL_PASS` environment variables
- Check if Gmail App Password is correctly generated
- Test the `/api/contact` endpoint

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=3001
NODE_ENV=development
```

3. Start the server:
```bash
npm run dev
```

4. Open `index.html` in a browser or serve it with a local server.

## Production Checklist

- [ ] Environment variables set in Render
- [ ] Firebase Admin SDK file uploaded
- [ ] Email credentials configured
- [ ] External URL set for keep-alive
- [ ] Build and start commands configured
- [ ] Auto-deploy enabled
- [ ] Health check accessible
- [ ] Authentication working
- [ ] Contact form working
- [ ] Keep-alive logs appearing
