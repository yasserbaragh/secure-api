# SouqDZ API - secure it

SouqDZ is a small online shop in Algeria. Customers register, browse products, place orders and talk to a support chatbot.
The API works, but it was written in a hurry and it is **not secure**.

Your job: find the holes and close them, without breaking the shop.

## Setup

Node 22 or newer.

```bash
npm install
npm run seed      # creates the demo database (run it again any time to reset)
npm start         # http://localhost:3000
```

Demo accounts

| Email | Password | Role |
|---|---|---|
| admin@souqdz.dz | Admin#Souq2024 | admin |
| amine@example.dz | Amine#2024 | customer |
| lina@example.dz | Lina#2024 | customer |

## The scoreboard

With the server running, in a second terminal:

```bash
npm run attack
```

It runs 17 attacks against your server. Each one is `EXPLOITED` or `BLOCKED`.
At the start you have 0/17. Restart the server after each change.

The script is a scoreboard, not a full audit. A line turning green means that attack no longer works, not that the code is clean.

## Map of the project

```
src/server.js           app setup, logging, error handler, product page
src/routes/auth.js      register, login, profile
src/routes/products.js  search, reviews
src/routes/orders.js    orders
src/routes/admin.js     admin routes
src/routes/chat.js      support chatbot (tool calls)
src/services/llm.js     fake LLM (stand-in so everything runs offline)
src/middleware/auth.js  JWT check
src/seed.js             demo data
.env                    configuration
```

## Rules

1. Do not break the shop. Customers must still be able to register, log in, search, order and chat.
2. The attack script only checks results. Fix the cause, not the script.
3. If you change how passwords are stored, update `src/seed.js` and run `npm run seed`.
4. You can install packages (helmet, express-rate-limit, bcryptjs, zod...).

## Levels

**Level 1 - quick wins (10 min).** Anything you can fix in one or two lines.

**Level 2 - the real work.** Authentication, authorization, input validation, anything where you have to rethink a route.

**Level 3 - the chatbot.** The model is fake, but it fails the way real ones do. A fix that only filters words will not hold. Think about what the bot is allowed to see and do.

## Bonus (the law part, not in the scoreboard)

Algerian Law 18-07 treats personal data seriously. Look at what this API stores and logs.

- Do we need to keep the national ID at all? If yes, how would you protect it at rest?
- What would you tell a user who asks to delete their account?
- Which of the 17 findings would count as a personal data breach if it was exploited?
- Where is the database hosted, and does it matter?

## Hints

Stuck? Ask yourself:

- What does this query do if the input contains a quote?
- Who is allowed to call this route, and where does the code check it?
- Which values come from the client and are used without checking?
- What would an attacker learn from this response, this header, this log line?
