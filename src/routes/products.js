const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, min_price, max_price, customizable, page = 1, limit = 12 } = req.query;

    let query = supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('is_active', true);

    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (min_price) {
      query = query.gte('base_price', parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte('base_price', parseFloat(max_price));
    }

    if (customizable === 'true') {
      query = query.eq('customizable', true);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      products: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Get single product
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', req.params.slug)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Get product templates
router.get('/:slug/templates', async (req, res) => {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('slug', req.params.slug)
      .single();

    if (!product) {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('product_id', product.id);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

module.exports = router;
