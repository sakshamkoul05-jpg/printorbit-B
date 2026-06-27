const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

module.exports = router;
