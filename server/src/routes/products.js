const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

const SORTABLE_COLUMNS = {
  featured: "id",
  "price-asc": "price",
  "price-desc": "price",
  newest: "date_added",
  rating: "rating",
};

/**
 * GET /api/products
 * Query params (all optional):
 *   category   men | women | shoes | accessories
 *   minPrice   number
 *   maxPrice   number
 *   size       one size string, e.g. "M"
 *   q          text search against name/brand
 *   sort       featured | price-asc | price-desc | newest | rating
 *   page       1-based, default 1
 *   limit      default 12, max 60
 */
router.get("/", async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, size, q } = req.query;
    const sortKey = SORTABLE_COLUMNS[req.query.sort] ? req.query.sort : "featured";
    const sortColumn = SORTABLE_COLUMNS[sortKey];
    const sortDir = sortKey === "price-desc" ? "DESC" : sortKey === "newest" || sortKey === "rating" ? "DESC" : "ASC";

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 60);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }
    if (minPrice) {
      params.push(Number(minPrice));
      where.push(`price >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      where.push(`price <= $${params.length}`);
    }
    if (size) {
      params.push(JSON.stringify(size));
      where.push(`sizes @> $${params.length}::jsonb`);
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(brand) LIKE $${params.length})`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM products ${whereClause}`,
      params
    );
    const total = countResult.rows[0].count;

    params.push(limit);
    params.push(offset);
    const listResult = await pool.query(
      `SELECT * FROM products ${whereClause}
       ORDER BY ${sortColumn} ${sortDir}, id ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      products: listResult.rows.map(toApiShape),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Product id must be an integer." });
    }
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `No product with id ${id}.` });
    }
    res.json(toApiShape(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// Match the field-naming style (camelCase) the existing frontend already
// expects from js/data/products.js, so Part 2's swap-over is a small diff.
function toApiShape(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price !== null ? Number(row.original_price) : undefined,
    rating: Number(row.rating),
    stock: row.stock,
    isNew: row.is_new,
    dateAdded: row.date_added,
    colors: row.colors,
    sizes: row.sizes,
    photoUrl: row.photo_url ?? undefined,
    placeholder: row.placeholder ?? undefined,
  };
}

module.exports = router;
