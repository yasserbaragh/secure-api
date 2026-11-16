const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  const search = req.query.search || '';
  const rows = db.prepare(`SELECT * FROM products WHERE name LIKE '%${search}%'`).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

router.post('/:id/reviews', auth, (req, res) => {
  db.prepare('INSERT INTO reviews (product_id,user_id,comment) VALUES (?,?,?)')
    .run(req.params.id, req.user.id, req.body.comment);
  res.status(201).json({ ok: true });
});

module.exports = router;
