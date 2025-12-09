import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createOutgoingMessage } from '../db/init.js';
import { SMS_API, getApiUrl } from '../config/api.js';
import { getSettings } from '../db/init.js';

const router = Router();

const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

const sanitizeMessage = (message) => {
  return message.trim().substring(0, 1600);
};

const calculateSegments = (message) => {
  const length = message.length;
  if (length <= 160) return 1;
  return Math.ceil(length / 153);
};

router.post('/send', async (req, res) => {
  try {
    const { destination, message, source } = req.body;
    
    if (!destination || !message) {
      return res.status(400).json({ error: 'Destination and message are required' });
    }
    
    if (!validatePhone(destination)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    const settings = getSettings();
    const senderSource = source || settings.default_source || SMS_API.defaultSource;
    const cleanMessage = sanitizeMessage(message);
    const segments = calculateSegments(cleanMessage);
    const id = uuidv4();
    
    let status = 'sent';
    let remoteId = null;
    
    try {
      const apiResponse = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sm: {
            source: senderSource,
            destination: destination.replace(/\D/g, ''),
            message: cleanMessage
          }
        })
      });
      
      const apiData = await apiResponse.json();
      status = apiResponse.ok ? (apiData.sms?.status || 'sent') : 'failed';
      remoteId = apiData.sms?.id || null;
    } catch (apiError) {
      console.error('API Error:', apiError);
      status = 'failed';
    }
    
    createOutgoingMessage({
      id,
      remote_id: remoteId,
      source: senderSource,
      destination: destination.replace(/\D/g, ''),
      message: cleanMessage,
      status,
      segments,
      cost: null,
      created_at: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'SMS sent successfully',
      data: { id, remoteId, status, segments }
    });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const { recipients, message, source } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const settings = getSettings();
    const senderSource = source || settings.default_source || SMS_API.defaultSource;
    const cleanMessage = sanitizeMessage(message);
    const segments = calculateSegments(cleanMessage);
    
    const results = [];
    
    for (const recipient of recipients) {
      const phone = typeof recipient === 'string' ? recipient : recipient.phone;
      
      if (!validatePhone(phone)) {
        results.push({ phone, success: false, error: 'Invalid phone number' });
        continue;
      }
      
      const id = uuidv4();
      let status = 'sent';
      
      try {
        const apiResponse = await fetch(getApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sm: {
              source: senderSource,
              destination: phone.replace(/\D/g, ''),
              message: cleanMessage
            }
          })
        });
        
        const apiData = await apiResponse.json();
        status = apiResponse.ok ? (apiData.sms?.status || 'sent') : 'failed';
        
        createOutgoingMessage({
          id,
          remote_id: apiData.sms?.id || null,
          source: senderSource,
          destination: phone.replace(/\D/g, ''),
          message: cleanMessage,
          status,
          segments,
          cost: apiData.sms?.charge || null,
          created_at: new Date().toISOString()
        });
        
        results.push({ phone, success: status !== 'failed', id, status });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ phone, success: false, error: 'Request failed' });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: true,
      message: `Bulk SMS completed: ${successCount} sent, ${results.length - successCount} failed`,
      summary: { total: results.length, success: successCount, failed: results.length - successCount },
      results
    });
  } catch (error) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({ error: 'Failed to send bulk SMS' });
  }
});

export default router;
