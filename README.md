# Semprepzie - Educational Portal

## Overview
Welcome to Semprepzie, a comprehensive educational portal designed for students with modern Firebase authentication and auto-deployment features.

## 🚀 Features

### Authentication System
- **Firebase Authentication**: Modern email/password login system
- **Legacy Support**: Backward compatibility with student ID login
- **Password Reset**: Email-based password recovery
- **Auto-login**: Persistent sessions with automatic token refresh
- **Secure**: Token-based API authentication

### Educational Content
- **Loading Animation**: Beautiful book loading animation
- **Secure Login**: Multiple authentication methods
- **Dark/Light Mode**: Toggle between themes
- **3D Effects**: Modern animations and transitions
- **Responsive Design**: Works on all devices

### Backend Features
- **Express.js API**: RESTful endpoints with rate limiting
- **Email Service**: Contact form with email notifications
- **Auto Keep-Alive**: Built-in cron job to prevent service sleep on Render
- **Health Monitoring**: Comprehensive health check endpoints
- **Security**: Helmet.js security headers and input validation

## 🌐 Live Demo

[View Live Portal](https://mohanmuralikarumuri.github.io/semprepzie/)

## 📁 Structure
```
semprepzie/
├── index.html              # Main HTML file
├── styles.css              # Main stylesheet
├── animations.css          # Additional animations
├── auth-styles.css         # Authentication styling
├── script.js               # Main JavaScript functionality
├── firebase-auth.js        # Firebase authentication module
├── demofirebase.js         # Firebase configuration
├── server.js               # Express.js backend server
├── package.json            # Node.js dependencies
├── keep-alive.sh           # Cron script for keep-alive
├── DEPLOYMENT.md           # Deployment instructions
├── CONTACT_SETUP.md        # Contact form setup
├── contact.php             # PHP backend alternative
├── pdfs/                   # PDF resources directory
└── README.md               # This file
```

## 🔐 Authentication Methods

### 1. Firebase Authentication
- **Email/Password**: Create account or login with email
- **Password Reset**: Secure email-based recovery
- **Token Management**: Automatic refresh and validation

### 2. Legacy Student ID Login
- Compatible with existing student IDs
- Seamless transition for existing users
- Session-based storage

## 🚀 Usage

### For Users
1. Visit the website
2. Choose authentication method:
   - **New Users**: Click "Sign Up" and create an account
   - **Existing Users**: Login with email/password
   - **Legacy Users**: Use the student ID login section
3. Access educational content after authentication

### Valid Legacy IDs
`23701A05C3`, `23701A05B8`, `24705A0501`, and [other valid student IDs]

## 📚 Sections
- **Home**: Welcome page with hero section and about information
- **Theory**: 6 courses with 5 units each (requires login)
- **Lab Materials**: 4 lab courses with 10 exercises each (requires login)
- **Minimized Code**: Code snippets and resources (requires login)
- **Contact Us**: Contact information and working contact form
- **About Us**: Information about the platform

## 🛠️ Technical Features

### Frontend
- Modern CSS Grid and Flexbox layouts
- CSS3 animations and 3D transforms
- JavaScript ES6+ with modules
- Firebase Web SDK v9+
- Responsive design principles
- Dark mode support with persistence
- Loading animations and modal dialogs

### Backend
- Express.js with middleware stack
- Firebase Admin SDK for auth verification
- Nodemailer for email functionality
- Rate limiting and input validation
- CORS and security headers
- Automated keep-alive system

### Auto Keep-Alive System
- **Built-in Cron Job**: Runs every 14 minutes
- **Self-Pinging**: Prevents Render service from sleeping
- **No External Dependencies**: All handled internally
- **Health Monitoring**: Detailed system information
- **Error Handling**: Graceful failure recovery

## 🔧 Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/mohanmuralikarumuri/semprepzie.git
cd semprepzie
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file** (`.env`):
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=3001
NODE_ENV=development
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Open the website**:
   - Serve `index.html` with a local server, or
   - Open directly in browser for frontend-only testing

## 🚀 Deployment to Render

### Quick Deploy
1. Fork this repository
2. Connect to Render
3. Set environment variables:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Gmail app password
   - `RENDER_EXTERNAL_URL`: Your Render app URL
4. Deploy!

### Detailed Instructions
See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

## 📧 Contact Form Setup

Multiple working methods included:
- **Node.js Backend**: Full-featured with email templates
- **PHP Backend**: Alternative for shared hosting
- **Getform.io**: External form service (no backend needed)
- **Direct Email**: Gmail and email client fallbacks

See [CONTACT_SETUP.md](CONTACT_SETUP.md) for setup instructions.

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/verify-token` - Verify Firebase token
- `GET /api/auth/profile` - Get user profile (protected)

### Contact
- `POST /api/contact` - Submit contact form

### Health & Monitoring
- `GET /api/health` - Comprehensive health check
- `GET /api/ping` - Simple keep-alive endpoint

## 🔒 Security Features

- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Prevents spam and abuse
- **CORS Protection**: Controlled cross-origin requests
- **Security Headers**: Helmet.js security middleware
- **Token Verification**: Firebase Admin SDK verification
- **Email Sanitization**: XSS prevention in contact forms

## 🐛 Troubleshooting

### Authentication Issues
- Check Firebase configuration
- Verify internet connection for Firebase
- Clear browser cache and localStorage

### Contact Form Issues
- Verify email environment variables
- Check server logs for email errors
- Test with different email providers

### Deployment Issues
- Ensure all environment variables are set
- Check Render build logs
- Verify keep-alive functionality in logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Authors

**Semprepzie Team**
- Email: semprepzie@gmail.com
- GitHub: [@mohanmuralikarumuri](https://github.com/mohanmuralikarumuri)

---

*Built with ❤️ for educational excellence*

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Note
This is a demonstration website. In a production environment, PDF files would be actual documents and login would be handled server-side with proper authentication.
