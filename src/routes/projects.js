const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

// Get user projects (saved designs)
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, product:products(*)')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Save project
router.post('/', authenticate, async (req, res) => {
  try {
    const { product_id, name, design_data, thumbnail_url } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: req.user.id,
        product_id,
        name,
        design_data,
        thumbnail_url,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Update project
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, design_data, thumbnail_url } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .update({ name, design_data, thumbnail_url, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

module.exports = router;
