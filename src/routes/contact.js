const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({ name, email, phone, subject, message })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Message sent successfully', id: data.id });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

module.exports = router;
