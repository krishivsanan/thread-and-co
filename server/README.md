# Thread & Co. — Backend

A small Express + Postgres API for Thread & Co. Currently covers:
read-only product listing/search, and real authentication (signup,
login, bcrypt-hashed passwords, JWT sessions). Cart and orders are
next.

## Setup

1. **Get a Postgres database.** Easiest options:
   - Local: `brew install postgresql` (Mac) or your OS's package manager, then `createdb threadco`.
   - Hosted, free tier, zero install: [Neon](https://neon.tech) or [Supabase](https://supabase.com) — create a project, copy the connection string.

2. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # edit .env — paste your DATABASE_URL (and set DATABASE_SSL=true if using Neon/Supabase)
   # generate a JWT_SECRET:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # paste that into .env as JWT_SECRET
   ```

4. **Create the schema:**
   ```bash
   npm run db:setup
   ```

5. **Seed the database with the existing 20 products** (pulled straight from `js/data/products.js`, so nothing is retyped):
   ```bash
   npm run extract   # writes src/db/products.seed.json from the frontend data file
   npm run db:seed   # inserts/updates those rows in Postgres
   ```

6. **Run it:**
   ```bash
   npm run dev     # auto-restarts on file changes (nodemon)
   # or: npm start
   ```

   The API is now at `http://localhost:4000`.

## Endpoints

| Method | Path | Auth? | Description |
|---|---|---|---|
| GET | `/api/health` | – | Confirms the server is up and the DB is reachable |
| GET | `/api/products` | – | List products. Supports `?category=`, `?minPrice=`, `?maxPrice=`, `?size=`, `?q=`, `?sort=`, `?page=`, `?limit=` |
| GET | `/api/products/:id` | – | A single product by id |
| POST | `/api/auth/signup` | – | `{ name, email, password, phone? }` → `{ token, user }` |
| POST | `/api/auth/login` | – | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Bearer token | Returns the logged-in user, for "am I still logged in?" checks on page load |

Auth notes:
- Passwords are hashed with bcrypt (`bcryptjs`, 10 salt rounds) — never stored or compared in plaintext.
- Login and signup are rate-limited together: 10 attempts per IP per 15 minutes, to slow down password guessing.
- Email matching is case-insensitive (`Foo@x.com` and `foo@x.com` are the same account), enforced with a unique index rather than a Postgres extension, so it works on any host.
- Tokens are JWTs, valid 7 days, signed with `JWT_SECRET` from `.env`. Send them as `Authorization: Bearer <token>` on any protected route.
- Login and signup return an identical error message for "no such user" and "wrong password," so a bad actor can't use the error to find out which emails are registered.

`GET /api/products` response shape:
```json
{
  "products": [ { "id": 201, "name": "Classic Crew Tee", "price": 28, "...": "..." } ],
  "pagination": { "page": 1, "limit": 12, "total": 20, "totalPages": 2 }
}
```

Product objects use the same field names (`originalPrice`, `photoUrl`, `isNew`, etc.) the frontend's `js/data/products.js` already used, so wiring the frontend up to this in Part 2 is a small change, not a rewrite.

## What's deliberately not here yet

No cart or orders APIs, no write endpoints for products, and the frontend's `login.html`/`account.html` don't call this yet — they still use the old `localStorage`-based fake auth until the next part wires them up to these real endpoints.
