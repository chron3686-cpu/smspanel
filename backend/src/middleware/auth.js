// Simple authentication middleware
// In production, use proper JWT tokens and hashed passwords

const USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'NovaText2024!', // Change this!
    name: 'Administrator'
  }
];

// Session storage (in production use Redis or database)
const sessions = new Map();

export const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const login = (username, password) => {
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) return null;
  
  const token = generateToken();
  sessions.set(token, {
    userId: user.id,
    username: user.username,
    name: user.name,
    createdAt: Date.now()
  });
  
  return { token, user: { id: user.id, username: user.username, name: user.name } };
};

export const logout = (token) => {
  sessions.delete(token);
};

export const getSession = (token) => {
  return sessions.get(token);
};

export const authMiddleware = (req, res, next) => {
  // Skip auth for login endpoint
  if (req.path === '/api/auth/login' || req.path === '/api/auth/check') {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  const session = getSession(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  // Check session expiry (24 hours)
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  req.user = session;
  next();
};

