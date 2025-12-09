import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { findContacts, findContactById, findContactByPhone, createContact, updateContact, deleteContact } from '../db/init.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { search } = req.query;
    const contacts = findContacts(search);
    
    res.json({
      success: true,
      data: contacts,
      pagination: { page: 1, limit: 50, total: contacts.length, totalPages: 1 }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

router.post('/add', (req, res) => {
  try {
    const { name, phone, tags } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    if (findContactByPhone(cleanPhone)) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    
    const contact = createContact({
      id: uuidv4(),
      name: name.trim(),
      phone: cleanPhone,
      tags: tags || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Contact added successfully', data: contact });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Failed to add contact' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, tags } = req.body;
    
    const existing = findContactById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.replace(/\D/g, '');
    if (tags !== undefined) updates.tags = tags || null;
    
    const contact = updateContact(id, updates);
    
    res.json({ success: true, message: 'Contact updated successfully', data: contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

router.post('/delete', (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }
    
    if (!findContactById(id)) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    deleteContact(id);
    
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router;
