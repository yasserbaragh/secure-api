const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

router.use(auth, requireRole('admin'));

router.get('/users', (req, res) => {
  res.json(db.prepare('SELECT id, name, email, role FROM users').all());
});

router.delete('/users/:id', (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
