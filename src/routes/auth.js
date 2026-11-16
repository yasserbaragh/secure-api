const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const auth = require('../middleware/auth');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  password: z.string().min(10).max(100),
  phone: z.string().regex(/^0[567]\d{8}$/).optional(),
}).strict(); // unknown keys (like "role") are rejected

router.post('/register', loginLimiter, (req, res) => {
  const data = registerSchema.safeParse(req.body);
  if (!data.success) return res.status(400).json({ error: 'Invalid data' });
  const { name, email, password, phone } = data.data;
  try {
    const info = db.prepare('INSERT INTO users (name,email,password,phone) VALUES (?,?,?,?)')
      .run(name, email, bcrypt.hashSync(password, 12), phone ?? null);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  } catch {
    res.status(400).json({ error: 'Could not create account' });
  }
});

router.post('/login', loginLimiter, (req, res) => {
  const email = String(req.body?.email ?? '');
  const password = String(req.body?.password ?? '');
  const user = db.prepare('SELECT id, role, password FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
  });
  res.json({ token });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

module.exports = router;
