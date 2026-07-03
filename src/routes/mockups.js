const { Router } = require('express');
const https = require('https');
const http = require('http');

const router = Router();

router.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url is required' });

    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;

    const data = await new Promise((resolve, reject) => {
      lib.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*,*/*',
        },
        timeout: 10000,
      }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          const redirectUrl = new URL(response.headers.location, url).toString();
          const redirLib = redirectUrl.startsWith('https') ? https : http;
          redirLib.get(redirectUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*,*/*' },
            timeout: 10000,
          }, (redirRes) => {
            const chunks = [];
            redirRes.on('data', (chunk) => chunks.push(chunk));
            redirRes.on('end', () => resolve(Buffer.concat(chunks)));
            redirRes.on('error', reject);
          }).on('error', reject);
          return;
        }
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });

    const base64 = data.toString('base64');
    const ext = url.includes('.png') ? 'png' : url.includes('.webp') ? 'webp' : 'jpeg';
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.json({ dataUrl: `data:image/${ext};base64,${base64}` });
  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

module.exports = router;
