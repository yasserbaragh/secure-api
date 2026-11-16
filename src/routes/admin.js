const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/users', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM users').all());
});

router.delete('/users/:id', auth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
