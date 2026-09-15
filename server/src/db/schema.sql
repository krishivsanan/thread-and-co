-- Thread & Co. — Part 1 schema
-- Only the products table so far. Users/carts/orders arrive in later parts,
-- once the products API this schema supports is proven out.

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
