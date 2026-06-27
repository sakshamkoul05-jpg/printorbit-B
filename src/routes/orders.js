const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, quote:quotes(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, quote:quotes(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

module.exports = router;
