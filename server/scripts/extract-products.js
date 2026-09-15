/**
 * One-time (re-runnable) converter: reads the frontend's
 * js/data/products.js — which declares `const PRODUCTS = [...]` as a
 * plain script global — and writes the same data out as JSON that the
 * seed script can insert into Postgres.
 *
 * This exists so the database starts out with exactly the same 20
 * products the front end already shows, instead of us retyping them.
 * Once the frontend switches to fetching from the API (Part 2),
 * js/data/products.js goes away and this script becomes unnecessary.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const FRONTEND_DATA_FILE = path.join(__dirname, "..", "..", "js", "data", "products.js");
const OUT_FILE = path.join(__dirname, "..", "src", "db", "products.seed.json");

const source = fs.readFileSync(FRONTEND_DATA_FILE, "utf8");

// The file only declares `const PRODUCTS = [...]` (no exports, since it's
// loaded as a plain <script> tag). A top-level `const` in a vm context
// doesn't attach to the sandbox object, so we evaluate the file's source
// followed by a bare `PRODUCTS` reference in the SAME script — vm.Script
// returns the value of its last statement, which is the array itself.
const sandbox = {};
vm.createContext(sandbox);
const script = new vm.Script(`${source}\n;PRODUCTS`, { filename: FRONTEND_DATA_FILE });
const products = script.runInContext(sandbox);

if (!Array.isArray(products)) {
  console.error("Could not find a PRODUCTS array in", FRONTEND_DATA_FILE);
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(products, null, 2));
console.log(`Wrote ${products.length} products to ${path.relative(process.cwd(), OUT_FILE)}`);
