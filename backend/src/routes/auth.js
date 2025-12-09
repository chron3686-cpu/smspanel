import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDatabase } from '../db/init.js';

const router = Router();

// Default admin credentials (change these!)
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'NovaText2024!'
};

// Initialize users if not exists
const initUsers = () => {
  const db = getDb();
  if (!db.users) {
    db.users = [{
      id: uuidv4(),
      username: DEFAULT_ADMIN.username,
      password: DEFAULT_ADMIN.password,
      role: 'admin',
      created_at: new Date().toISOString()
    }];
    saveDatabase();
  }
  if (!db.sessions) {
    db.sessions = [];
    saveDatabase();
  }
};

// Login
router.post('/login', (req, res) => {
  try {
    initUsers();
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const db = getDb();
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session token
    const token = uuidv4() + '-' + uuidv4();
    const session = {
      token,
      userId: user.id,
      username: user.username,
      role: user.role,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    db.sessions.push(session);
    saveDatabase();
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const db = getDb();
    const session = db.sessions?.find(s => s.token === token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (new Date(session.expires_at) < new Date()) {
      // Remove expired session
      db.sessions = db.sessions.filter(s => s.token !== token);
      saveDatabase();
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.json({
      success: true,
      user: {
        id: session.userId,
        username: session.username,
        role: session.role
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const db = getDb();
      db.sessions = db.sessions?.filter(s => s.token !== token) || [];
      saveDatabase();
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Change password
router.post('/change-password', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { currentPassword, newPassword } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const db = getDb();
    const session = db.sessions?.find(s => s.token === token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const user = db.users.find(u => u.id === session.userId);
    
    if (!user || user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    user.password = newPassword;
    saveDatabase();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;

// Auth middleware
export const authMiddleware = (req, res, next) => {
  // Skip auth for login and verify endpoints
  if (req.path === '/api/auth/login' || req.path === '/api/auth/verify') {
    return next();
  }
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const db = getDb();
  const session = db.sessions?.find(s => s.token === token);
  
  if (!session || new Date(session.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = {
    id: session.userId,
    username: session.username,
    role: session.role
  };
  
  next();
};
