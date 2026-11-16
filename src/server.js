const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// request log
app.use((req, res, next) => {
  const line = `${new Date().toISOString()} ${req.method} ${req.url} ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync(path.join(__dirname, '..', 'logs', 'app.log'), line);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

// server-rendered product page
app.get('/products/:id/page', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).send('Not found');
  const reviews = db.prepare('SELECT comment FROM reviews WHERE product_id = ?').all(p.id);
  res.send(`<h1>${p.name}</h1><p>${p.description}</p><h3>Reviews</h3>
    <ul>${reviews.map((r) => `<li>${r.comment}</li>`).join('')}</ul>`);
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SouqDZ API on http://localhost:${port}`));
