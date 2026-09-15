/* ==========================================================================
   PRODUCTS.JS (data)
   ------------------------------------------------------------------------
   This used to be the whole "database." As of Part 2 of the backend
   build, it's now the FALLBACK dataset only — js/api-client.js fetches
   the live product list from server/'s Products API
   (GET /api/products) and that's what pages actually render.

   This array is still here for two reasons:
     1. It seeds the database (server/scripts/extract-products.js reads
        this exact file).
     2. If the API is unreachable (backend not running, or this is a
        static deploy with no backend yet — e.g. Vercel today), the
        site falls back to this bundled data instead of breaking.

   Loaded as a plain <script> (not a JS module), so it declares a
   global constant, PRODUCTS_FALLBACK, that js/api-client.js reads.

   ABOUT `photoUrl`:
   Most products don't have this field yet, so they fall back to the
   local placeholder file at assets/images/products/<id>.jpg (see
   js/products.js createProductCardHTML). A few products below DO have
   a `photoUrl` — a real, free-to-use stock photo (sourced from
   Unsplash, credited free-license, no logos/brand marks visible) used
   as a temporary stand-in until real product photography exists.
   TO REPLACE WITH YOUR OWN PHOTO: either paste a new `photoUrl`
   (must be a real URL you have the rights to use), or delete the
   `photoUrl` line entirely and drop a file at
   assets/images/products/<id>.jpg instead — either works.

   To change a product going forward, prefer editing it in the database
   (or this file + re-running `npm run extract && npm run db:seed` in
   server/) rather than editing both places separately.
   ========================================================================== */

const PRODUCTS_FALLBACK = [
  // ---------------- MEN ----------------
  {
    id: 201,
    photoUrl:
      "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?auto=format&fit=crop&w=900&q=80",
    name: "Classic Crew Tee",
    brand: "Thread & Co.",
    category: "men",
    price: 28,
    originalPrice: null,
    rating: 4.5,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["black", "white", "navy"],
    isNew: false,
    dateAdded: "2026-05-01",
    stock: 34,
    placeholder: { a: "#4a453e", b: "#1c1b1a" },
  },
  {
    id: 202,
    photoUrl:
      "https://images.unsplash.com/photo-1564595037946-dcb73763aa57?auto=format&fit=crop&w=900&q=80",
    name: "Cotton Oxford Shirt",
    brand: "Northfield",
    category: "men",
    price: 58,
    originalPrice: null,
    rating: 4.8,
    sizes: ["S", "M", "L", "XL"],
    colors: ["white", "navy", "olive"],
    isNew: false,
    dateAdded: "2026-04-12",
    stock: 18,
    placeholder: { a: "#8c8477", b: "#4a453e" },
  },
  {
    id: 203,
    photoUrl:
      "https://images.unsplash.com/photo-1656528049647-c82eb8174d04?auto=format&fit=crop&w=900&q=80",
    name: "Wool Blend Overcoat",
    brand: "Aster Studio",
    category: "men",
    price: 176,
    originalPrice: 220,
    rating: 4.9,
    sizes: ["M", "L", "XL"],
    colors: ["black", "grey"],
    isNew: false,
    dateAdded: "2026-03-02",
    stock: 6,
    placeholder: { a: "#a63d40", b: "#7e2d30" },
  },
  {
    id: 204,
    photoUrl:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=900&q=80",
    name: "Relaxed Denim Jeans",
    brand: "Lowline",
    category: "men",
    price: 72,
    originalPrice: null,
    rating: 4.6,
    sizes: ["S", "M", "L", "XL"],
    colors: ["navy", "black"],
    isNew: false,
    dateAdded: "2026-02-18",
    stock: 22,
    placeholder: { a: "#8c8477", b: "#4a453e" },
  },
  {
    id: 205,
    photoUrl:
      "https://images.unsplash.com/photo-1572290067581-51ce0fc67e2b?auto=format&fit=crop&w=900&q=80",
    name: "Technical Windbreaker",
    brand: "Fieldwork",
    category: "men",
    price: 98,
    originalPrice: null,
    rating: 4.4,
    sizes: ["S", "M", "L", "XL"],
    colors: ["olive", "black"],
    isNew: true,
    dateAdded: "2026-08-14",
    stock: 0,
    placeholder: { a: "#4a453e", b: "#8c8477" },
  },

  // ---------------- WOMEN ----------------
  {
    id: 301,
    photoUrl:
      "https://images.unsplash.com/photo-1552874869-5c39ec9288dc?auto=format&fit=crop&w=900&q=80",
    name: "Pleated Midi Skirt",
    brand: "Aster Studio",
    category: "women",
    price: 54,
    originalPrice: null,
    rating: 4.3,
    sizes: ["XS", "S", "M", "L"],
    colors: ["brick", "black"],
    isNew: true,
    dateAdded: "2026-08-12",
    stock: 15,
    placeholder: { a: "#7e2d30", b: "#1c1b1a" },
  },
  {
    id: 302,
    photoUrl:
      "https://images.unsplash.com/photo-1542595606-002fdcb90acf?auto=format&fit=crop&w=900&q=80",
    name: "Ribbed Knit Sweater",
    brand: "Thread & Co.",
    category: "women",
    price: 48,
    originalPrice: null,
    rating: 4.7,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["mustard", "grey", "black"],
    isNew: true,
    dateAdded: "2026-08-05",
    stock: 27,
    placeholder: { a: "#1c1b1a", b: "#4a453e" },
  },
  {
    id: 303,
    photoUrl:
      "https://images.unsplash.com/photo-1760328249113-31c07547aea8?auto=format&fit=crop&w=900&q=80",
    name: "Silk Slip Dress",
    brand: "Northfield",
    category: "women",
    price: 112,
    originalPrice: null,
    rating: 4.5,
    sizes: ["XS", "S", "M", "L"],
    colors: ["black", "brick"],
    isNew: false,
    dateAdded: "2026-01-22",
    stock: 4,
    placeholder: { a: "#a63d40", b: "#8c6a24" },
  },
  {
    id: 304,
    photoUrl:
      "https://images.unsplash.com/photo-1767631338127-8cd80ee2f9df?auto=format&fit=crop&w=900&q=80",
    name: "Linen Blend Trousers",
    brand: "Lowline",
    category: "women",
    price: 66,
    originalPrice: null,
    rating: 4.2,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["white", "olive"],
    isNew: false,
    dateAdded: "2026-02-02",
    stock: 19,
    placeholder: { a: "#a63d40", b: "#8c6a24" },
  },
  {
    id: 305,
    photoUrl:
      "https://images.unsplash.com/photo-1747817230321-4ad317ac0809?auto=format&fit=crop&w=900&q=80",
    name: "Tailored Blazer",
    brand: "Aster Studio",
    category: "women",
    price: 148,
    originalPrice: 185,
    rating: 4.8,
    sizes: ["S", "M", "L"],
    colors: ["black", "navy"],
    isNew: false,
    dateAdded: "2025-12-11",
    stock: 9,
    placeholder: { a: "#4a453e", b: "#1c1b1a" },
  },

  // ---------------- SHOES ----------------
  {
    id: 401,
    photoUrl:
      "https://images.unsplash.com/photo-1496202703211-aa28e9500c30?auto=format&fit=crop&w=900&q=80",
    name: "Canvas Low-Top Sneaker",
    brand: "Fieldwork",
    category: "shoes",
    price: 64,
    originalPrice: null,
    rating: 4.7,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["white", "black"],
    isNew: true,
    dateAdded: "2026-08-01",
    stock: 41,
    placeholder: { a: "#d9a441", b: "#8c6a24" },
  },
  {
    id: 402,
    photoUrl:
      "https://images.unsplash.com/photo-1616244916660-d135a013d1f8?auto=format&fit=crop&w=900&q=80",
    name: "Suede Ankle Boot",
    brand: "Northfield",
    category: "shoes",
    price: 96,
    originalPrice: null,
    rating: 4.6,
    sizes: ["7", "8", "9", "10"],
    colors: ["brick", "black"],
    isNew: false,
    dateAdded: "2026-03-19",
    stock: 13,
    placeholder: { a: "#8c6a24", b: "#4a453e" },
  },
  {
    id: 403,
    photoUrl:
      "https://images.unsplash.com/photo-1516538638415-6617293b0737?auto=format&fit=crop&w=900&q=80",
    name: "Trail Running Shoe",
    brand: "Fieldwork",
    category: "shoes",
    price: 118,
    originalPrice: null,
    rating: 4.4,
    sizes: ["8", "9", "10", "11"],
    colors: ["olive", "black"],
    isNew: false,
    dateAdded: "2026-01-30",
    stock: 0,
    placeholder: { a: "#4a453e", b: "#8c8477" },
  },
  {
    id: 404,
    photoUrl:
      "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&w=900&q=80",
    name: "Leather Chelsea Boot",
    brand: "Aster Studio",
    category: "shoes",
    price: 210,
    originalPrice: null,
    rating: 4.9,
    sizes: ["8", "9", "10", "11"],
    colors: ["black", "navy"],
    isNew: false,
    dateAdded: "2025-11-14",
    stock: 7,
    placeholder: { a: "#1c1b1a", b: "#4a453e" },
  },
  {
    id: 405,
    photoUrl:
      "https://images.unsplash.com/photo-1594520770886-6910adf052c6?auto=format&fit=crop&w=900&q=80",
    name: "Classic Espadrille",
    brand: "Thread & Co.",
    category: "shoes",
    price: 44,
    originalPrice: null,
    rating: 4.1,
    sizes: ["7", "8", "9", "10"],
    colors: ["white", "mustard"],
    isNew: false,
    dateAdded: "2026-02-25",
    stock: 25,
    placeholder: { a: "#d9a441", b: "#8c6a24" },
  },

  // ---------------- ACCESSORIES ----------------
  {
    id: 501,
    photoUrl:
      "https://images.unsplash.com/photo-1567744875520-cf9c27fbb53b?auto=format&fit=crop&w=900&q=80",
    name: "Structured Tote Bag",
    brand: "Lowline",
    category: "accessories",
    price: 88,
    originalPrice: null,
    rating: 4.5,
    sizes: ["One Size"],
    colors: ["black", "brick"],
    isNew: true,
    dateAdded: "2026-08-09",
    stock: 16,
    placeholder: { a: "#4a453e", b: "#8c8477" },
  },
  {
    id: 502,
    photoUrl:
      "https://images.unsplash.com/photo-1617427502466-5a138bbc2774?auto=format&fit=crop&w=900&q=80",
    name: "Leather Belt",
    brand: "Northfield",
    category: "accessories",
    price: 38,
    originalPrice: null,
    rating: 4.3,
    sizes: ["One Size"],
    colors: ["black", "olive"],
    isNew: false,
    dateAdded: "2026-03-04",
    stock: 30,
    placeholder: { a: "#8c8477", b: "#4a453e" },
  },
  {
    id: 503,
    photoUrl:
      "https://images.unsplash.com/photo-1457545195570-67f207084966?auto=format&fit=crop&w=900&q=80",
    name: "Wool Scarf",
    brand: "Aster Studio",
    category: "accessories",
    price: 42,
    originalPrice: 56,
    rating: 4.6,
    sizes: ["One Size"],
    colors: ["mustard", "grey"],
    isNew: false,
    dateAdded: "2026-01-08",
    stock: 3,
    placeholder: { a: "#d9a441", b: "#8c6a24" },
  },
  {
    id: 504,
    photoUrl:
      "https://images.unsplash.com/photo-1576082711017-7cf911411b3e?auto=format&fit=crop&w=900&q=80",
    name: "Aviator Sunglasses",
    brand: "Fieldwork",
    category: "accessories",
    price: 54,
    originalPrice: null,
    rating: 4.2,
    sizes: ["One Size"],
    colors: ["black"],
    isNew: false,
    dateAdded: "2025-12-29",
    stock: 20,
    placeholder: { a: "#1c1b1a", b: "#4a453e" },
  },
  {
    id: 505,
    photoUrl:
      "https://images.unsplash.com/photo-1691256676359-20e5c6d4bc92?auto=format&fit=crop&w=900&q=80",
    name: "Canvas Baseball Cap",
    brand: "Thread & Co.",
    category: "accessories",
    price: 26,
    originalPrice: null,
    rating: 4.0,
    sizes: ["One Size"],
    colors: ["navy", "olive"],
    isNew: true,
    dateAdded: "2026-08-16",
    stock: 45,
    placeholder: { a: "#4a453e", b: "#1c1b1a" },
  },
];

/* Hex values for each color name used above - the filter sidebar's color
   swatches, and the Product Details page's color selector, both read
   from this map, so adding a new color to a product just means adding
   one line here too. */
const COLOR_SWATCHES = {
  black: "#1c1b1a",
  white: "#fbf8f2",
  navy: "#2d3345",
  brick: "#a63d40",
  mustard: "#d9a441",
  olive: "#5f6b4a",
  grey: "#8c8477",
};

// Available synchronously, same as before — js/api-client.js overwrites
// this in place once (and if) the live API data arrives.
window.PRODUCTS = PRODUCTS_FALLBACK;
