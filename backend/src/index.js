import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './db/init.js';
import authRoutes, { authMiddleware } from './routes/auth.js';
import smsRoutes from './routes/sms.js';
import contactsRoutes from './routes/contacts.js';
import messagesRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initDatabase();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());

// Rate limiting for SMS endpoints
const smsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' }
});

// Auth routes (no middleware)
app.use('/api/auth', authRoutes);

// Health check (no middleware)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'NovaText Cloud API', version: '1.0.0' });
});

// Protected routes (with auth middleware)
app.use('/api/sms', authMiddleware, smsLimiter, smsRoutes);
app.use('/api/contacts', authMiddleware, contactsRoutes);
app.use('/api/messages', authMiddleware, messagesRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║     🚀 NovaText Cloud Backend Server         ║
║     Running on http://localhost:${PORT}          ║
║     🔐 Authentication enabled                ║
╚══════════════════════════════════════════════╝
  `);
});
