const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Upload file to Supabase Storage
router.post('/', async (req, res) => {
  try {
    const { file, bucket = 'uploads' } = req.body;

    if (!file) {
      return res.status(400).json({ error: { message: 'No file provided' } });
    }

    // Decode base64 file
    const buffer = Buffer.from(file.content, 'base64');
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    res.json({ url: urlData.publicUrl, path: data.path });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

module.exports = router;
