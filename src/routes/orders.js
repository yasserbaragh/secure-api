const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM orders WHERE user_id = ?').all(req.user.id));
});

router.get('/:id', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

router.post('/', auth, (req, res) => {
  const { items, address } = req.body;
  let total = 0;
  for (const item of items) total += item.price * item.qty;

  const info = db.prepare('INSERT INTO orders (user_id,total,address) VALUES (?,?,?)')
    .run(req.user.id, total, address);
  const orderId = Number(info.lastInsertRowid);
  for (const item of items) {
    db.prepare('INSERT INTO order_items (order_id,product_id,qty,price) VALUES (?,?,?,?)')
      .run(orderId, item.productId, item.qty, item.price);
  }
  res.status(201).json({ id: orderId, total });
});

module.exports = router;
