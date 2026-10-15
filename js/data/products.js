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
        static deploy with no backend yet), the site falls back to this
        bundled data instead of breaking.

   Loaded as a plain <script> (not a JS module), so it declares a
   global constant, PRODUCTS_FALLBACK, that js/api-client.js reads.
   ========================================================================== */

const PRODUCTS_FALLBACK = [
  // ---------------- MEN ----------------
  {
    id: 201,
    photoUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
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
    description:
      "Cut from 100% combed organic ring-spun cotton, our signature crewneck t-shirt offers a tailored everyday drape. Pre-shrunk and finished with a durable ribbed collar that keeps its shape wash after wash.",
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
    description:
      "A timeless wardrobe essential woven from premium two-ply oxford cotton. Features a button-down collar, chest pocket, and a curved hem designed to look sharp tucked or untucked.",
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
    description:
      "An impeccably tailored overcoat constructed from a heavyweight Italian wool blend. Designed with a clean notched lapel, concealed button placket, and deep interior pockets for winter warmth.",
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
    description:
      "Woven on vintage shuttle looms from 13.5oz non-stretch Japanese selvedge denim. Sits comfortably at the waist with an easy, relaxed leg that stacks naturally over shoes.",
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
    stock: 12,
    placeholder: { a: "#4a453e", b: "#8c8477" },
    description:
      "Built for unpredictable elements, this lightweight water-resistant shell is cut from recycled ripstop nylon. Features bonded seams, adjustable hood bungees, and zippered storm pockets.",
  },
  {
    id: 206,
    photoUrl:
      "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=900&q=80",
    name: "Merino Wool Crewneck Sweater",
    brand: "Thread & Co.",
    category: "men",
    price: 88,
    originalPrice: null,
    rating: 4.8,
    sizes: ["S", "M", "L", "XL"],
    colors: ["navy", "grey", "black"],
    isNew: true,
    dateAdded: "2026-08-20",
    stock: 24,
    placeholder: { a: "#2d3345", b: "#1c1b1a" },
    description:
      "Spun from 100% extra-fine Australian Merino wool, this crewneck sweater offers exceptional warmth with an ultra-lightweight hand. Features ribbed trims and a modern tailored drape suitable for layering over collared shirts or wearing solo.",
  },
  {
    id: 207,
    photoUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
    name: "Linen Camp Collar Shirt",
    brand: "Northfield",
    category: "men",
    price: 62,
    originalPrice: null,
    rating: 4.6,
    sizes: ["S", "M", "L", "XL"],
    colors: ["white", "olive", "mustard"],
    isNew: true,
    dateAdded: "2026-08-18",
    stock: 19,
    placeholder: { a: "#fbf8f2", b: "#5f6b4a" },
    description:
      "Cut from breathable pure European flax linen, this relaxed camp-collar shirt is washed for lived-in softness from day one. Designed with a clean straight hem and coconut shell buttons.",
  },
  {
    id: 208,
    photoUrl:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    name: "Slim Chino Trouser",
    brand: "Lowline",
    category: "men",
    price: 68,
    originalPrice: null,
    rating: 4.7,
    sizes: ["S", "M", "L", "XL"],
    colors: ["navy", "olive", "grey"],
    isNew: false,
    dateAdded: "2026-06-15",
    stock: 28,
    placeholder: { a: "#2d3345", b: "#5f6b4a" },
    description:
      "Crafted from durable stretch cotton twill with a brushed peach finish for comfort. Features clean slanted front pockets, rear welt pockets, and a tapered ankle opening.",
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
    description:
      "Fluid knife-pleated midi skirt crafted from airy crepe fabric with subtle luster. Features a comfortable hidden elastic waistband and graceful movement from day to evening.",
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
    description:
      "Spun from a soft cotton-modal blend with an allover tactile rib. Features a relaxed crewneck, dropped shoulders, and side vents for an effortless casual drape.",
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
    description:
      "Crafted from lustrous 19mm mulberry silk charmeuse with delicate adjustable spaghetti straps. Cut on the bias to gently skim the body with an ankle-skimming midi length.",
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
    description:
      "Airy wide-leg trousers cut from a breathable linen-viscose blend that resists excessive creasing. Features front slash pockets and a clean hook-and-bar waistband.",
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
    description:
      "Sharp single-breasted blazer cut from a structured wool-blend suiting fabric. Styled with structured shoulders, peak lapels, and horn buttons for effortless power dressing.",
  },
  {
    id: 306,
    photoUrl:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
    name: "Cashmere Cardigan",
    brand: "Thread & Co.",
    category: "women",
    price: 135,
    originalPrice: null,
    rating: 4.9,
    sizes: ["XS", "S", "M", "L"],
    colors: ["grey", "white", "black"],
    isNew: true,
    dateAdded: "2026-08-22",
    stock: 14,
    placeholder: { a: "#8c8477", b: "#fbf8f2" },
    description:
      "A wardrobe investment crafted from two-ply Grade-A Mongolian cashmere. Features an easy, slightly relaxed silhouette, horn-effect buttons, and deep ribbed cuffs.",
  },
  {
    id: 307,
    photoUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
    name: "Tailored Wide-Leg Trousers",
    brand: "Aster Studio",
    category: "women",
    price: 94,
    originalPrice: null,
    rating: 4.7,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["black", "navy", "brick"],
    isNew: true,
    dateAdded: "2026-08-19",
    stock: 22,
    placeholder: { a: "#1c1b1a", b: "#2d3345" },
    description:
      "High-waisted trousers with front double pleats and an elegant flowing wide-leg silhouette. Made with a wrinkle-resistant wool-blend fabric with subtle stretch for all-day polish.",
  },
  {
    id: 308,
    photoUrl:
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80",
    name: "Poplin Wrap Blouse",
    brand: "Northfield",
    category: "women",
    price: 56,
    originalPrice: null,
    rating: 4.5,
    sizes: ["XS", "S", "M", "L"],
    colors: ["white", "mustard"],
    isNew: false,
    dateAdded: "2026-07-02",
    stock: 31,
    placeholder: { a: "#fbf8f2", b: "#d9a441" },
    description:
      "Crisp organic cotton poplin sculpted into a flattering wrap silhouette with an adjustable self-tie waist and clean bracelet sleeves.",
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
    description:
      "Classic low-profile sneaker crafted from heavy 12oz washed cotton canvas with vulcanized rubber outsoles and padded memory-foam insoles for all-day city walking.",
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
    description:
      "Supple oiled suede chelsea ankle boot with elasticated side gussets and a sturdy stacked heel. Treated with a weather-resistant finish for everyday versatility.",
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
    stock: 15,
    placeholder: { a: "#4a453e", b: "#8c8477" },
    description:
      "Performance-driven hybrid trail sneaker equipped with high-traction lugged rubber outsoles, breathable ripstop mesh uppers, and responsive dual-density cushioning.",
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
    description:
      "Crafted from rich full-grain calf leather with hand-finished burnishing. Elastic side gores and dual woven pull tabs provide a sleek, streamlined profile with easy entry.",
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
    description:
      "Traditional Mediterranean espadrille featuring breathable canvas uppers, authentic braided jute midsoles, and vulcanized rubber treads for summer ease.",
  },
  {
    id: 406,
    photoUrl:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
    name: "Minimalist Leather Sneaker",
    brand: "Thread & Co.",
    category: "shoes",
    price: 128,
    originalPrice: null,
    rating: 4.9,
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["white", "black"],
    isNew: true,
    dateAdded: "2026-08-25",
    stock: 35,
    placeholder: { a: "#fbf8f2", b: "#1c1b1a" },
    description:
      "Handcrafted from full-grain Italian calfskin leather with a cushioned leather footbed and stitched Margom-style rubber cupsole for enduring longevity and timeless versatility.",
  },
  {
    id: 407,
    photoUrl:
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=900&q=80",
    name: "Leather Penny Loafer",
    brand: "Aster Studio",
    category: "shoes",
    price: 165,
    originalPrice: null,
    rating: 4.8,
    sizes: ["8", "9", "10", "11"],
    colors: ["black", "brick"],
    isNew: false,
    dateAdded: "2026-05-10",
    stock: 12,
    placeholder: { a: "#1c1b1a", b: "#a63d40" },
    description:
      "Traditional Goodyear welt construction meets refined modern proportions. Polished box-calf leather develops a rich natural patina over time.",
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
    description:
      "Minimalist everyday carryall made from durable structured canvas with smooth leather handles. Roomy main compartment fits up to a 15-inch laptop with ease.",
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
    description:
      "Handcrafted from 1.25-inch full-grain vegetable-tanned bridle leather with beveled edges and a solid brass buckle with brushed nickel finish.",
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
    description:
      "Woven from pure lambswool with a brushed surface for exceptional softness. Finished with traditional twisted fringed edges and generous wrapping length.",
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
    description:
      "Classic teardrop aviator frames constructed from ultralight stainless steel. Fitted with scratch-resistant polarized Category 3 lenses providing 100% UV protection.",
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
    description:
      "Unstructured six-panel dad cap made from garment-washed cotton chino twill. Features an adjustable self-fabric strap and an antique brass tri-glide buckle.",
  },
  {
    id: 506,
    photoUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
    name: "Minimalist Leather Wallet",
    brand: "Thread & Co.",
    category: "accessories",
    price: 46,
    originalPrice: null,
    rating: 4.8,
    sizes: ["One Size"],
    colors: ["black", "brick", "olive"],
    isNew: true,
    dateAdded: "2026-08-21",
    stock: 40,
    placeholder: { a: "#1c1b1a", b: "#a63d40" },
    description:
      "Ultra-slim bifold wallet cut from vegetable-tanned full-grain leather. Houses up to 8 cards and folded currency with RFID-blocking protection.",
  },
  {
    id: 507,
    photoUrl:
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80",
    name: "Cashmere Beanie",
    brand: "Northfield",
    category: "accessories",
    price: 38,
    originalPrice: null,
    rating: 4.6,
    sizes: ["One Size"],
    colors: ["navy", "grey", "mustard", "black"],
    isNew: true,
    dateAdded: "2026-08-15",
    stock: 33,
    placeholder: { a: "#2d3345", b: "#d9a441" },
    description:
      "100% rib-knit cashmere watch cap beanie. Superbly soft with a fold-over cuff that can be adjusted for your ideal fit and coverage.",
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
