# SouqDZ - reference solution

This copy passes 17/17. Dependencies added: helmet, express-rate-limit, bcryptjs, zod.
`.env` here is a real example: JWT secret is random, no key in the chatbot prompt.

| # | Attack | Cause | Fix | Where |
|---|---|---|---|---|
| 1 | sqli-login | Query built with a template string | `WHERE email = ?`, then compare the password hash in code | routes/auth.js |
| 2 | sqli-search | Same, in the `LIKE` | `LIKE ?` with `%${search}%` passed as a parameter | routes/products.js |
| 3 | weak-jwt | `JWT_SECRET=secret`, no expiry | 48 random bytes in `.env`, `expiresIn: '15m'`, `algorithms: ['HS256']` | .env, middleware/auth.js |
| 4 | rbac | Admin routes only check "logged in" | `requireRole('admin')` on the whole router | routes/admin.js |
| 5 | idor | Order read by id only | `WHERE id = ? AND user_id = ?` (404, not 403) | routes/orders.js |
| 6 | mass-assignment | `Object.keys(req.body)` goes into the INSERT | zod `.strict()` schema, explicit columns, role never from the client | routes/auth.js |
| 7 | data-exposure | `SELECT *` returned to the client | Select only the fields the client needs | routes/auth.js, admin.js |
| 8 | price-tampering | Total computed from client prices | Read the price from the database, validate qty (1 to 20) | routes/orders.js |
| 9 | xss | Review inserted raw in HTML | `escapeHtml()` on every value, plus helmet's CSP | server.js |
| 10 | cors | `origin: true, credentials: true` | Allowlist from `ALLOWED_ORIGINS` | server.js |
| 11 | headers | Express defaults | `helmet()` | server.js |
| 12 | errors | `err.stack` sent in the response | Log on the server, send a generic message | server.js |
| 13 | cookie | `res.cookie('token', t)` | `httpOnly`, `sameSite: 'strict'`, `secure` in production | routes/auth.js |
| 14 | chat-leak | Secret inside the system prompt | Remove it. A model cannot leak what it never saw. Output filter as a second layer | services/llm.js, routes/chat.js |
| 15 | chat-scope | Tool takes an email typed by the user | Chat needs login, the tool uses `req.user.id` and ignores any email in the message | routes/chat.js |
| 16 | logs | Whole request body logged | Log method, path, status only | server.js |
| 17 | brute-force | No limit on login | `express-rate-limit`, 10 attempts / 15 min on login and register | routes/auth.js |

Also changed: passwords hashed with bcrypt (cost 12) in `seed.js`, global rate limit, body size limit (10 kb), `.env` in `.gitignore`.

## Not covered by the scoreboard

- National ID is still stored in clear text. Next step: encrypt the column (AES-256-GCM, key outside the database) or stop collecting it.
- No account deletion / export route (rights of access and deletion under Law 18-07).
- No audit log for admin actions.
- No HTTPS here. In production this is Nginx in front of the app, with the app listening on localhost only.
- The model is fake. With a real one, prompt injection cannot be fully blocked. That is why the real defence is limiting what the tools can do.

## If someone asks "why 404 and not 403 on someone else's order?"

403 confirms the order exists. 404 gives the attacker nothing.
