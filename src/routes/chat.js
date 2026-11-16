const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const db = require('../db');
const auth = require('../middleware/auth');
const { askModel } = require('../services/llm');

const chatLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20 });

router.post('/', auth, chatLimiter, (req, res) => {
  const message = String(req.body?.message ?? '').slice(0, 500);
  const out = askModel(message);

  if (out && out.tool === 'lookup_orders') {
    // the tool only sees the logged-in user: the model cannot choose whose data to read
    const rows = db.prepare('SELECT id, total, status FROM orders WHERE user_id = ?').all(req.user.id);
    return res.json({ reply: rows.length ? 'Your orders: ' + JSON.stringify(rows) : 'No orders found.' });
  }
  // last line of defence: filter the output
  const reply = typeof out === 'string' ? out.replace(/sk-[\w-]+/g, '[hidden]') : '';
  res.json({ reply });
});

module.exports = router;
