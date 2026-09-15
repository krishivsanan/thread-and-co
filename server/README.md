# Thread & Co. — Backend (Part 1: Products API)

A small Express + Postgres API. This part only covers products —
read-only, nothing else — so it's a solid, testable foundation for the
auth, cart, and orders APIs that come in later parts.

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

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Confirms the server is up and the DB is reachable |
| GET | `/api/products` | List products. Supports `?category=`, `?minPrice=`, `?maxPrice=`, `?size=`, `?q=`, `?sort=`, `?page=`, `?limit=` |
| GET | `/api/products/:id` | A single product by id |

`GET /api/products` response shape:
```json
{
  "products": [ { "id": 201, "name": "Classic Crew Tee", "price": 28, "...": "..." } ],
  "pagination": { "page": 1, "limit": 12, "total": 20, "totalPages": 2 }
}
```

Product objects use the same field names (`originalPrice`, `photoUrl`, `isNew`, etc.) the frontend's `js/data/products.js` already used, so wiring the frontend up to this in Part 2 is a small change, not a rewrite.

## What's deliberately not here yet

No auth, no cart, no orders, no write endpoints — those are separate parts, built and tested the same way once this one is confirmed solid. The frontend also isn't touched yet; it still reads its own static `js/data/products.js` until Part 2 switches it over to `fetch("/api/products")`.
