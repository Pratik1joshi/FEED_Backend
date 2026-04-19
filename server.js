const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { pool } = require('./config/database');
require('dotenv').config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const uploadPath = path.resolve(__dirname, process.env.UPLOAD_PATH || 'uploads');

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const devOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
const allowedOrigins = [...new Set([...configuredOrigins, ...(isProduction ? [] : devOrigins)])];

// Import routes
const timelineRoutes = require('./routes/timeline');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const servicesRoutes = require('./routes/services');
const projectsRoutes = require('./routes/projects');
const eventsRoutes = require('./routes/events');
const publicationsRoutes = require('./routes/publications');
const teamRoutes = require('./routes/team');
const newsRoutes = require('./routes/news');
const awardsRoutes = require('./routes/awards');
const galleryRoutes = require('./routes/gallery');
const videosRoutes = require('./routes/videos');
const pressRoutes = require('./routes/press');
const blogRoutes = require('./routes/blog');
const siteSettingsRoutes = require('./routes/siteSettings');
const pagesRoutes = require('./routes/pages');
const inboxRoutes = require('./routes/inbox');

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const readLimiter = rateLimit({
  windowMs: parseInt(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
  max: parseInt(process.env.PUBLIC_RATE_LIMIT_MAX_REQUESTS || (isProduction ? '5000' : '15000'), 10),
  // Keep homepage/public data smooth under normal browsing traffic.
  skip: (req) => !['GET', 'HEAD', 'OPTIONS'].includes(req.method),
  message: {
    success: false,
    message: 'Too many read requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isProduction ? '300' : '1000'), 10),
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
  message: {
    success: false,
    message: 'Too many write requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', readLimiter);
app.use('/api/', writeLimiter);

// Static file serving for uploads
app.use('/uploads', express.static(uploadPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FEED Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.round(process.uptime()),
    allowedOrigins: allowedOrigins.length,
  });
});

// API Routes
app.use('/api/timeline', timelineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/awards', awardsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/press', pressRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/inbox', inboxRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FEED Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check',
      'GET /api/timeline - Timeline management',
      'GET /api/services - Services management',
      'GET /api/projects - Projects management',
      'GET /api/events - Events management',
      'GET /api/publications - Publications management',
      'GET /api/team - Team members management',
      'GET /api/news - News/Blog management',
      'GET /api/awards - Awards management',
      'GET /api/gallery - Gallery management',
      'GET /api/videos - Videos management',
      'GET /api/press - Press releases management',
      'GET /api/site-settings - Public site settings',
      'POST /api/inbox/contact - Contact form mail',
      'POST /api/inbox/newsletter - Newsletter subscription mail',
      'POST /api/auth/login - Admin authentication',
      'POST /api/upload - File upload system'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Database connection test
const testDatabaseConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`✅ PostgreSQL Connected: ${result.rows[0].now}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testDatabaseConnection();

  if (allowedOrigins.length === 0) {
    console.warn('⚠️  No CORS origins configured. Set FRONTEND_URL or CORS_ORIGINS before production deployment.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 FEED Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📂 Upload Path: ${uploadPath}`);
  });
};

startServer();

module.exports = app;
