const supabase = require('../lib/supabase');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: { message: 'No token provided' } });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: { message: 'Authentication failed' } });
  }
};

const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      req.user = user;
    } catch {
      // Ignore auth errors for optional auth
    }
  }

  next();
};

module.exports = { authenticate, optionalAuth };
