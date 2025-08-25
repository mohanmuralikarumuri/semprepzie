# Semprepzie v2.0 - Modern Full-Stack Educational Platform

A clean, modern, structured full-stack application built with React + Node.js + Firebase for educational document management and authentication.

## 🚀 Features

### 🔐 Authentication
- **Firebase Authentication** with email/password
- **Password reset** functionality
- **Role-based access control** (student, admin, instructor)
- **Restricted login** (only @aitsrajampet.ac.in emails)
- **Device management** and session control
- **Email verification** for new devices

### 📄 Document Management
- **PDF.js** integration for PDF viewing
- **Microsoft Office Online Viewer** for Word/Excel/PowerPoint files
- **Google Drive** document integration
- **File compression/decompression** for faster loading
- **Document categories** and tagging
- **Search and filtering** capabilities

### 📧 Contact System
- **Nodemailer** integration with Gmail SMTP
- **Input validation** and sanitization
- **Rate limiting** for spam protection
- **HTML email templates**

### 🛡️ Security & Performance
- **Helmet** for security headers
- **CORS** configuration
- **Rate limiting** on all endpoints
- **Request validation** with express-validator
- **Compression** for static files
- **Error handling** and logging

## 🏗️ Architecture

### Project Structure
```
semprepzie-v2/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Tailwind CSS styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express.js + TypeScript
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main server file
│   └── package.json
├── shared/                  # Shared types and constants
│   ├── src/
│   │   ├── types/          # TypeScript interfaces
│   │   └── constants/      # Shared constants
│   └── package.json
└── package.json            # Root package.json (workspaces)
```

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for routing
- **React Hook Form** for form handling
- **React Query** for state management
- **Firebase SDK** for authentication
- **PDF.js** for PDF viewing
- **Axios** for HTTP requests

#### Backend
- **Express.js** with TypeScript
- **Firebase Admin SDK** for secure authentication
- **Nodemailer** for email sending
- **Helmet** for security
- **Express Rate Limit** for rate limiting
- **Winston** for logging
- **Joi** for validation
- **Node-cron** for scheduled tasks

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm 9+
- Firebase project with Authentication enabled
- Gmail account with App Password for SMTP

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd semprepzie-v2

# Install all dependencies
npm run install:all
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase Admin SDK private key
- `FIREBASE_CLIENT_EMAIL` - Firebase Admin SDK client email
- `EMAIL_USER` - Gmail address
- `EMAIL_PASS` - Gmail App Password

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication → Sign-in method → Email/Password
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Download the JSON file
4. Copy the values to your `.env` file

### 4. Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Generate App Password for "Mail"
   - Use this password in `EMAIL_PASS`

## 🚀 Development

### Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3001
```

### Build for Production
```bash
# Build everything
npm run build

# Build individual packages
npm run build:frontend
npm run build:shared
```

### Available Scripts
```bash
npm run dev              # Start both dev servers
npm run build            # Build all packages
npm run start            # Start production backend
npm run lint             # Lint all packages
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run clean            # Clean all node_modules
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login validation
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/verify-token` - Verify Firebase token
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/profile` - Get user profile (protected)

### Document Endpoints
- `GET /api/documents` - List documents with pagination
- `GET /api/documents/:id` - Get specific document
- `GET /api/documents/:id/metadata` - Get document metadata
- `POST /api/documents/upload` - Upload document (protected)
- `DELETE /api/documents/:id` - Delete document (protected)

### Contact Endpoints
- `POST /api/contact/submit` - Submit contact form

### Device Management
- `POST /api/devices/register` - Register device
- `GET /api/devices` - List user devices (protected)
- `POST /api/devices/count` - Get device count
- `POST /api/devices/logout-others` - Logout other devices

## 🔒 Security Features

### Authentication Security
- Firebase token verification on backend
- Email domain restriction (@aitsrajampet.ac.in)
- Device tracking and management
- Session management

### API Security
- Rate limiting on all endpoints
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- Error handling without information leakage

### Document Security
- User-based access control
- Email verification required for uploads
- File type validation
- Size limits

## 📱 Document Viewer Features

### PDF Documents
- **PDF.js** integration
- Zoom controls
- Page navigation
- Download functionality
- Search within document

### Office Documents
- **Microsoft Office Online Viewer**
- Support for Word, Excel, PowerPoint
- View-only mode
- Responsive design

### Google Drive Integration
- Direct Google Drive file viewing
- Automatic file type detection
- Compressed loading for performance

## 🎨 UI/UX Features

### Design System
- **Tailwind CSS** for consistent styling
- **Responsive design** for all devices
- **Dark/Light mode** support
- **Loading states** and skeletons
- **Error boundaries** and fallbacks

### User Experience
- **Fast loading** with Vite
- **Optimistic updates**
- **Toast notifications**
- **Form validation** with real-time feedback
- **Keyboard navigation** support

## 🚀 Deployment

### Backend Deployment (Render/Railway/Vercel)
1. Set environment variables
2. Build the backend: `cd backend && npm run build`
3. Start command: `node dist/server.js`

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Serve the `dist` folder
3. Configure redirects for SPA routing

### Environment Variables for Production
Ensure all required environment variables are set:
- Firebase configuration
- Email SMTP settings
- CORS origins
- Rate limiting settings

## 🔧 Development Guidelines

### Code Style
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional Commits** for commit messages

### Testing
- **Vitest** for frontend testing
- **Jest** for backend testing
- **React Testing Library** for component tests

### Performance
- **Code splitting** with dynamic imports
- **Image optimization**
- **Bundle analysis**
- **Caching strategies**

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

For questions or support:
- Email: semprepzie@gmail.com
- Check the issues section
- Read the documentation

## 📄 License

This project is licensed under the MIT License.

---

**Semprepzie v2.0** - Modern Education Platform
Built with ❤️ for students and educators
