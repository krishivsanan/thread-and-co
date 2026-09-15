/**
 * Applies server/src/db/schema.sql to whatever database DATABASE_URL
 * points at. Safe to re-run — every statement in schema.sql uses
 * IF NOT EXISTS / CREATE OR REPLACE.
 */
const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");

async function main() {
  const schemaPath = path.join(__dirname, "..", "src", "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
  console.log("Schema applied.");
  await pool.end();
}

main().catch((err) => {
  console.error("Failed to apply schema:", err.message);
  process.exit(1);
});
