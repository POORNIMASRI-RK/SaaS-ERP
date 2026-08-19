import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { autoSeedManufacturing } from './utils/autoSeedManufacturing.js';

import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import hrmsConfigRoutes from './routes/hrmsConfigRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import compOffRoutes from './routes/compOffRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import manufacturingRoutes from './routes/manufacturingRoutes.js';
import gstBillingRoutes from './routes/gstBillingRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import aiPredictionRoutes from './routes/aiPredictionRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import qrTrackingRoutes from './routes/qrTrackingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();

// Security & Anti-Clickjacking Headers Middleware
app.use((req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'";

  const connectSrc = isDev
    ? "'self' http://localhost:5000 ws://localhost:5000 wss://localhost:5000 http://localhost:5173 ws://localhost:5173"
    : "'self'";

  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; ` +
    `script-src ${scriptSrc}; ` +
    `style-src 'self' 'unsafe-inline'; ` +
    `font-src 'self' data:; ` +
    `img-src 'self' data: blob: https:; ` +
    `connect-src ${connectSrc}; ` +
    `frame-src 'self'; ` +
    `object-src 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self'; ` +
    `frame-ancestors 'none';`
  );
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Policy (Dynamically reflect origin for credentials: true support)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-tenant-id', 'X-Tenant-ID'],
  })
);

// Connect MongoDB Database and Auto-Seed Phase 4 Data safely
connectDB()
  .then(() => {
    if (process.env.MONGODB_URI) {
      autoSeedManufacturing().catch((err) => console.error('⚠️ [AutoSeed Warning]:', err.message));
    }
  })
  .catch((err) => console.error('⚠️ [ConnectDB Error]:', err.message));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hrms', hrmsConfigRoutes);
app.use('/api/hrms/config', hrmsConfigRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/compoff', compOffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/billing', gstBillingRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/ai-prediction', aiPredictionRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/qr-tracking', qrTrackingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Welcome Root Endpoint for Cloud Health & Status
app.get('/', (req, res) => {
  res.send("Welcome to Backend!!!");
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Manufacturing SaaS ERP, HRMS, Payroll, GST Billing & CRM Engine',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler for unmatched routes
app.use((req, res) => {
  res.status(404).type('application/json').json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// 500 Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Express Error]:', err.stack || err);
  res.status(err.status || 500).type('application/json').json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`[SaaS ERP, HRMS, Payroll, GST Billing, CRM Engine Running on Port ${port}]`);
    console.log(`[API Base URL]: http://localhost:${port}/api`);
    console.log(`==================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < 5010) {
      console.log(`[PORT ${port} IN USE]: Retrying server start on Port ${port + 1}...`);
      setTimeout(() => startServer(port + 1), 500);
    } else {
      console.error('[Server Error]:', err);
    }
  });
};

startServer(Number(PORT));
