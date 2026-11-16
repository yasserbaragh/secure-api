const router = require('express').Router();
const { z } = require('zod');
const db = require('../db');
const auth = require('../middleware/auth');

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    qty: z.number().int().min(1).max(20),
  }).strict()).min(1).max(50),
  address: z.string().min(4).max(200),
}).strict();

router.get('/', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM orders WHERE user_id = ?').all(req.user.id));
});

router.get('/:id', auth, (req, res) => {
  // the owner is part of the query: someone else's order simply does not exist for you
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

router.post('/', auth, (req, res) => {
  // the client sends product ids and quantities. Prices are looked up here, never trusted from the body.
  const body = { ...req.body, items: (req.body?.items || []).map(({ productId, qty }) => ({ productId, qty })) };
  const data = orderSchema.safeParse(body);
  if (!data.success) return res.status(400).json({ error: 'Invalid order' });

  let total = 0;
  const lines = [];
  for (const item of data.data.items) {
    const product = db.prepare('SELECT id, price FROM products WHERE id = ?').get(item.productId);
    if (!product) return res.status(400).json({ error: 'Unknown product' });
    total += product.price * item.qty;
    lines.push({ ...item, price: product.price });
  }
  const info = db.prepare('INSERT INTO orders (user_id,total,address) VALUES (?,?,?)')
    .run(req.user.id, total, data.data.address);
  const orderId = Number(info.lastInsertRowid);
  for (const l of lines) {
    db.prepare('INSERT INTO order_items (order_id,product_id,qty,price) VALUES (?,?,?,?)')
      .run(orderId, l.productId, l.qty, l.price);
  }
  res.status(201).json({ id: orderId, total });
});

module.exports = router;
