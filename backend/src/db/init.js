import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'database.json');

// Simple JSON-based database
let db = {
  contacts: [],
  outgoing_messages: [],
  incoming_messages: [],
  settings: {
    default_source: '+1234567890',
    theme: 'light'
  }
};

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Load database from file
export const loadDatabase = () => {
  try {
    if (existsSync(dbPath)) {
      const data = readFileSync(dbPath, 'utf8');
      db = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
  return db;
};

// Save database to file
export const saveDatabase = () => {
  try {
    writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

// Initialize database
export const initDatabase = () => {
  loadDatabase();
  saveDatabase();
  console.log('✅ Database initialized successfully');
};

// Get database reference
export const getDb = () => {
  return db;
};

// Contacts operations
export const findContacts = (search = '') => {
  if (!search) return db.contacts;
  const searchLower = search.toLowerCase();
  return db.contacts.filter(c => 
    c.name.toLowerCase().includes(searchLower) || 
    c.phone.includes(search)
  );
};

export const findContactById = (id) => {
  return db.contacts.find(c => c.id === id);
};

export const findContactByPhone = (phone) => {
  return db.contacts.find(c => c.phone === phone);
};

export const createContact = (contact) => {
  db.contacts.push(contact);
  saveDatabase();
  return contact;
};

export const updateContact = (id, updates) => {
  const index = db.contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    db.contacts[index] = { ...db.contacts[index], ...updates };
    saveDatabase();
    return db.contacts[index];
  }
  return null;
};

export const deleteContact = (id) => {
  const index = db.contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    db.contacts.splice(index, 1);
    saveDatabase();
    return true;
  }
  return false;
};

// Outgoing messages operations
export const getOutgoingMessages = (filters = {}) => {
  let messages = [...db.outgoing_messages];
  
  if (filters.status) {
    messages = messages.filter(m => m.status === filters.status);
  }
  if (filters.destination) {
    messages = messages.filter(m => m.destination.includes(filters.destination));
  }
  
  return messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const createOutgoingMessage = (message) => {
  db.outgoing_messages.push(message);
  saveDatabase();
  return message;
};

// Incoming messages operations
export const getIncomingMessages = () => {
  return [...db.incoming_messages].sort((a, b) => new Date(b.received_at) - new Date(a.received_at));
};

export const getUnreadCount = () => {
  return db.incoming_messages.filter(m => !m.is_read).length;
};

export const createIncomingMessage = (message) => {
  db.incoming_messages.push(message);
  saveDatabase();
  return message;
};

export const markMessageAsRead = (id) => {
  const msg = db.incoming_messages.find(m => m.id === id);
  if (msg) {
    msg.is_read = true;
    saveDatabase();
  }
};

export const markAllAsRead = () => {
  db.incoming_messages.forEach(m => m.is_read = true);
  saveDatabase();
};

// Settings operations
export const getSettings = () => {
  return db.settings;
};

export const updateSettings = (updates) => {
  db.settings = { ...db.settings, ...updates };
  saveDatabase();
  return db.settings;
};

// Stats
export const getStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayMessages = db.outgoing_messages.filter(m => 
    m.created_at.startsWith(today)
  );
  
  const delivered = db.outgoing_messages.filter(m => 
    m.status === 'sent' || m.status === 'delivered'
  ).length;
  
  const failed = db.outgoing_messages.filter(m => m.status === 'failed').length;
  
  // Last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayMessages = db.outgoing_messages.filter(m => m.created_at.startsWith(dateStr));
    
    last7Days.push({
      date: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      total: dayMessages.length,
      delivered: dayMessages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
      failed: dayMessages.filter(m => m.status === 'failed').length
    });
  }
  
  return {
    totalSent: db.outgoing_messages.length,
    todaySent: todayMessages.length,
    delivered,
    failed,
    totalIncoming: db.incoming_messages.length,
    unreadIncoming: getUnreadCount(),
    contactsCount: db.contacts.length,
    deliveryRate: db.outgoing_messages.length > 0 ? Math.round((delivered / db.outgoing_messages.length) * 100) : 0,
    last7Days,
    recentActivity: db.outgoing_messages.slice(0, 10)
  };
};
