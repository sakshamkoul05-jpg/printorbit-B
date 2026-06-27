const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone },
      },
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: name,
        phone,
      });
    }

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: { message: 'Not authenticated' } });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({ user: { ...user, profile } });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

module.exports = router;
