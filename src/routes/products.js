const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  const search = String(req.query.search || '').slice(0, 50);
  res.json(db.prepare('SELECT * FROM products WHERE name LIKE ?').all(`%${search}%`));
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

router.post('/:id/reviews', auth, (req, res) => {
  const comment = String(req.body?.comment ?? '').trim();
  if (comment.length < 1 || comment.length > 500) return res.status(400).json({ error: 'Invalid comment' });
  db.prepare('INSERT INTO reviews (product_id,user_id,comment) VALUES (?,?,?)')
    .run(req.params.id, req.user.id, comment);
  res.status(201).json({ ok: true });
});

module.exports = router;
