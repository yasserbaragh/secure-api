const router = require('express').Router();
const db = require('../db');
const { askModel } = require('../services/llm');

router.post('/', (req, res) => {
  const out = askModel(String(req.body.message || ''));

  if (out && out.tool === 'lookup_orders') {
    const rows = db.prepare(
      `SELECT o.id, o.total, o.status, o.address
       FROM orders o JOIN users u ON u.id = o.user_id
       WHERE u.email = ?`
    ).all(out.args.email);
    return res.json({ reply: rows.length ? 'Orders: ' + JSON.stringify(rows) : 'No orders found.' });
  }
  res.json({ reply: out });
});

module.exports = router;
