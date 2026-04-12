const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('[APP] Starting backend initialization...');

let db = null;
let firebaseReady = false;
let authRoutes, userRoutes, adminRoutes, eventRoutes, articleRoutes;

try {
  // ✅ INITIALIZE DATABASE DULU
  db = require('./config/db');
  firebaseReady = require('./config/db').firebaseReady;
  
  if (!firebaseReady) {
    console.error('⚠️ FIREBASE NOT READY - DATABASE QUERIES WILL FAIL');
  }

  authRoutes = require('./routes/authRoutes');
  userRoutes = require('./routes/userRoutes');
  adminRoutes = require('./routes/adminRoutes');
  eventRoutes = require('./routes/eventRoutes');
  articleRoutes = require('./routes/articleRoutes');
  
  console.log('[APP] All modules loaded successfully');
} catch (initErr) {
  console.error('[APP] ERROR during initialization:', initErr.message);
  console.error('[APP] Stack:', initErr.stack);
  // Continue anyway - might still be able to serve health checks
}

const app = express();

// ✅ CORS CONFIGURATION - Comprehensive
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      'https://gli-frontend.vercel.app',
      'https://gli-project-web.web.app',
      'https://gli-project-web.firebaseapp.com'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list or is a vercel domain
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.web.app')) {
      callback(null, true);
    } else {
      console.log('❌ CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// ✅ Explicit preflight handler
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ✅ ROUTES
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/user', userRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (eventRoutes) app.use('/api/events', eventRoutes);
if (articleRoutes) app.use('/api', articleRoutes);

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  const response = {
    status: firebaseReady ? 'OK' : 'DEGRADED',
    message: firebaseReady ? 'Backend running and ready' : 'Backend running but Firebase not initialized',
    timestamp: new Date().toISOString(),
    database: firebaseReady ? 'CONNECTED' : 'FAILED',
    env: {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET'
    }
  };
  res.status(firebaseReady ? 200 : 503).json(response);
});

// ✅ ALIVE CHECK - returns 200 even if Firebase isn't ready
app.get('/alive', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('❌ Error stack:', err.stack);
  
  // Ensure CORS headers are included even in error responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`✅ CORS enabled`);
  console.log(`📝 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Firebase Project ID: ${process.env.FIREBASE_PROJECT_ID || 'NOT SET'}`);
});