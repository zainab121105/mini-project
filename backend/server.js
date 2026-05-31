const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
let helmet;
let rateLimit;
let morgan;
let compression;
const path = require('path');

// Try to load optional production helpers; if missing, provide no-op fallbacks
try {
  helmet = require('helmet');
} catch (err) {
  console.warn('⚠️  Optional package "helmet" not installed. Run `npm install` in backend.');
  helmet = () => (req, res, next) => next();
}

try {
  rateLimit = require('express-rate-limit');
} catch (err) {
  console.warn('⚠️  Optional package "express-rate-limit" not installed. Run `npm install` in backend.');
  rateLimit = () => (req, res, next) => next();
}

try {
  morgan = require('morgan');
} catch (err) {
  console.warn('⚠️  Optional package "morgan" not installed. Run `npm install` in backend.');
  morgan = () => (req, res, next) => next();
}

try {
  compression = require('compression');
} catch (err) {
  console.warn('⚠️  Optional package "compression" not installed. Run `npm install` in backend.');
  compression = () => (req, res, next) => next();
}

// Load env variables
dotenv.config();

// Provide safe defaults for development
if (process.env.NODE_ENV !== 'production') {
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/support_ticket_db';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
  process.env.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
} else {
  // In production ensure required env vars are present
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      process.exit(1);
    }
  });
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGIN || '*'
    : '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Serve frontend in production when built
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📍 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
