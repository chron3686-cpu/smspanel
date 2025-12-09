import { Router } from 'express';
import { getSettings, updateSettings } from '../db/init.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const settings = getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/', (req, res) => {
  try {
    const settings = updateSettings(req.body);
    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
