# Semprepzie - Educational Portal

## 🔐 Secure Setup Instructions

This project uses environment variables to protect sensitive Firebase credentials.

### 📋 Prerequisites
- Node.js (v14 or higher)
- Firebase project with Authentication enabled
- Firebase Admin SDK service account

### 🚀 Local Development Setup

1. **Clone the repository**
```bash
git clone [your-repo-url]
cd semprepzie
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase credentials**
   - Copy `env.example` to `.env`
   - Fill in your actual Firebase credentials in `.env`
   - Download your Firebase Admin SDK service account JSON file
   - Place it in the project root (it's already in .gitignore)

4. **Update firebase-config.js**
   - Copy `firebase-config.template.js` to `firebase-config.js`
   - Replace placeholder values with your actual Firebase config

5. **Start the server**
```bash
npm start
```

### 🌐 Deployment Setup

#### For Render/Heroku/Vercel:
1. Set environment variables in your deployment platform:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`
   - `FIREBASE_PRIVATE_KEY` (from service account JSON)
   - `FIREBASE_CLIENT_EMAIL` (from service account JSON)
   - `NODE_ENV=production`

2. The app will automatically use environment variables in production

### ⚠️ Security Notes

- **Never commit** real Firebase credentials to Git
- **Always use** environment variables in production
- **Keep** your service account JSON file secure and private
- **Update** .gitignore to exclude sensitive files

### 📁 File Structure
```
├── .env.example          # Template for environment variables
├── .gitignore           # Excludes sensitive files
├── firebase-config.template.js  # Template for Firebase config
├── server.js            # Main server with secure credentials
└── [other files...]
```

### 🔧 Environment Variables Required

#### Frontend (Firebase Web SDK):
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`

#### Backend (Firebase Admin SDK):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### 🛡️ Security Features
- Email-only authentication with college domain validation
- Device tracking and single-session enforcement
- Email verification required for new devices
- Protected content access control
- Rate limiting and security headers
