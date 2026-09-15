/**
 * Loads server/src/db/products.seed.json into the products table.
 * Upserts by id, so re-running this after editing the seed file just
 * updates existing rows instead of duplicating them.
 *
 * Run `node scripts/extract-products.js` first if products.seed.json
 * doesn't exist yet or the frontend data file has changed.
 */
const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");

const SEED_FILE = path.join(__dirname, "..", "src", "db", "products.seed.json");

async function main() {
  if (!fs.existsSync(SEED_FILE)) {
    console.error(
      `${path.relative(process.cwd(), SEED_FILE)} not found. Run "npm run extract" first ` +
      `(node scripts/extract-products.js).`
    );
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const p of products) {
      await client.query(
        `INSERT INTO products
           (id, name, brand, category, price, original_price, rating, stock,
            is_new, date_added, colors, sizes, photo_url, placeholder)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           brand = EXCLUDED.brand,
           category = EXCLUDED.category,
           price = EXCLUDED.price,
           original_price = EXCLUDED.original_price,
           rating = EXCLUDED.rating,
           stock = EXCLUDED.stock,
           is_new = EXCLUDED.is_new,
           date_added = EXCLUDED.date_added,
           colors = EXCLUDED.colors,
           sizes = EXCLUDED.sizes,
           photo_url = EXCLUDED.photo_url,
           placeholder = EXCLUDED.placeholder`,
        [
          p.id,
          p.name,
          p.brand,
          p.category,
          p.price,
          p.originalPrice ?? null,
          p.rating ?? 0,
          p.stock ?? 0,
          p.isNew ?? false,
          p.dateAdded ?? null,
          JSON.stringify(p.colors ?? []),
          JSON.stringify(p.sizes ?? []),
          p.photoUrl ?? null,
          p.placeholder ? JSON.stringify(p.placeholder) : null,
        ]
      );
    }
    await client.query("COMMIT");
    console.log(`Seeded ${products.length} products.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
