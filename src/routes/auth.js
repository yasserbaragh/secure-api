const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

router.post('/register', (req, res) => {
  const fields = Object.keys(req.body);
  const sql = `INSERT INTO users (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`;
  try {
    const info = db.prepare(sql).run(...Object.values(req.body));
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db
    .prepare(`SELECT * FROM users WHERE email='${email}' AND password='${password}'`)
    .get();
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  res.cookie('token', token);
  res.json({ token });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

module.exports = router;
