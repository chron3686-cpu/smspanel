import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getOutgoingMessages, getIncomingMessages, getUnreadCount, createIncomingMessage, markMessageAsRead, markAllAsRead, getStats } from '../db/init.js';

const router = Router();

router.get('/outgoing', (req, res) => {
  try {
    const { status, destination } = req.query;
    const messages = getOutgoingMessages({ status, destination });
    
    res.json({
      success: true,
      data: messages,
      pagination: { page: 1, limit: 50, total: messages.length, totalPages: 1 }
    });
  } catch (error) {
    console.error('Get outgoing messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/incoming', (req, res) => {
  try {
    const messages = getIncomingMessages();
    const unreadCount = getUnreadCount();
    
    res.json({
      success: true,
      data: messages,
      unreadCount,
      pagination: { page: 1, limit: 50, total: messages.length, totalPages: 1 }
    });
  } catch (error) {
    console.error('Get incoming messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/incoming/:id/read', (req, res) => {
  try {
    markMessageAsRead(req.params.id);
    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

router.post('/incoming/read-all', (req, res) => {
  try {
    markAllAsRead();
    res.json({ success: true, message: 'All messages marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

router.get('/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/webhook/incoming', (req, res) => {
  try {
    const { src, dst, message, received_at } = req.body;
    
    createIncomingMessage({
      id: uuidv4(),
      source: src || 'unknown',
      destination: dst || 'unknown',
      message: message || '',
      is_read: false,
      received_at: received_at || new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.json({ success: true });
  }
});

export default router;
