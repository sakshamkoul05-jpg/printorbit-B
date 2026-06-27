const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

// Create quote
router.post('/', async (req, res) => {
  try {
    const { items, design_files, notes, contact } = req.body;

    const { data, error } = await supabase
      .from('quotes')
      .insert({
        items,
        design_files: design_files || [],
        notes,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Get user quotes
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Get single quote
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: { message: 'Quote not found' } });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

module.exports = router;
