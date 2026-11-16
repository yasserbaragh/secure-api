const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const app = express();
const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

app.use(helmet());
app.use(cors({ origin: allowed, credentials: true }));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 200 }));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// request log: method, path, status. Never bodies, never tokens.
app.use((req, res, next) => {
  res.on('finish', () => {
    const line = `${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode}\n`;
    fs.appendFile(path.join(__dirname, '..', 'logs', 'app.log'), line, () => {});
  });
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

app.get('/products/:id/page', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).send('Not found');
  const reviews = db.prepare('SELECT comment FROM reviews WHERE product_id = ?').all(p.id);
  res.send(`<h1>${escapeHtml(p.name)}</h1><p>${escapeHtml(p.description)}</p><h3>Reviews</h3>
    <ul>${reviews.map((r) => `<li>${escapeHtml(r.comment)}</li>`).join('')}</ul>`);
});

app.use((err, req, res, next) => {
  console.error(err); // details stay on the server
  res.status(err.status && err.status < 500 ? err.status : 500).json({ error: 'Something went wrong' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SouqDZ API on http://localhost:${port}`));
