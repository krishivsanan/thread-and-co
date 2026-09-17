-- Thread & Co. — schema
-- products (Part 1) + users (Part 3). Carts/orders arrive later.

CREATE TABLE IF NOT EXISTS products (
  id             INTEGER PRIMARY KEY,
  name           TEXT NOT NULL,
  brand          TEXT NOT NULL,
  category       TEXT NOT NULL,           -- 'men' | 'women' | 'shoes' | 'accessories'
  price          NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),          -- null when not on sale
  rating         NUMERIC(2, 1) DEFAULT 0,
  stock          INTEGER NOT NULL DEFAULT 0,
  is_new         BOOLEAN NOT NULL DEFAULT false,
  date_added     DATE,
  colors         JSONB NOT NULL DEFAULT '[]',  -- e.g. ["black", "navy"]
  sizes          JSONB NOT NULL DEFAULT '[]',  -- e.g. ["S", "M", "L"]
  photo_url      TEXT,                    -- external stand-in photo, if any
  placeholder    JSONB,                   -- e.g. {"a": "#4a453e", "b": "#1c1b1a"} gradient fallback
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);

-- Keep updated_at honest on every row change.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Part 3 — users
-- Case-insensitive email handled with a unique index on LOWER(email)
-- rather than the citext extension, so this works on any Postgres
-- host without needing extensions enabled.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- Orders + order items
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  order_number      TEXT NOT NULL UNIQUE,
  user_id           INTEGER REFERENCES users(id),
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT,
  address           TEXT,
  apartment         TEXT,
  city              TEXT,
  state             TEXT,
  postal_code       TEXT,
  country           TEXT,
  shipping_method   TEXT NOT NULL DEFAULT 'standard',
  shipping_cost     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal          NUMERIC(10, 2) NOT NULL,
  discount          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax               NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total             NUMERIC(10, 2) NOT NULL,
  coupon_code       TEXT,
  payment_method    TEXT NOT NULL,
  payment_status    TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  status            TEXT NOT NULL DEFAULT 'pending_payment',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);

DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER REFERENCES products(id),
  product_name TEXT NOT NULL,
  size         TEXT,
  color        TEXT,
  quantity     INTEGER NOT NULL,
  unit_price   NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);