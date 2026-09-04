# Thread & Co. — E-Commerce Clothing Website

A real storefront project. Currently built with **plain HTML, CSS and
JavaScript** only — no framework dependency, so it deploys anywhere
(GitHub Pages, Netlify, your own host) with zero build step.

## Live status

✅ **Module 1 — Home & Navigation** — done (`index.html`)
✅ **Module 2 — Product Catalogue** — done (`products.html`)
✅ **Module 3 — Product Details** — done (`product-details.html`)
✅ **Module 4 — Cart & Wishlist** — done (`cart.html`, `wishlist.html`)
⬜ Modules 5–6 (Checkout & Orders, Authentication & Backend) are not
built yet.

## Folder structure

```
ecommerce-clothing/
├── index.html            ← the homepage (Module 1)
├── products.html         ← shop-all / catalogue page (Module 2)
├── product-details.html  ← single-product page (Module 3)
├── cart.html              ← shopping cart page (Module 4)
├── wishlist.html          ← saved-items page (Module 4)
├── css/
│   ├── variables.css     ← colors, fonts, spacing — shared by EVERY page
│   ├── base.css          ← reset + typography + buttons/tags — shared by EVERY page
│   ├── navbar.css        ← shared navbar styles
│   ├── footer.css        ← shared footer styles
│   ├── components.css    ← reusable pieces used on 2+ pages (product cards, scroller,
│   │                         page-header/breadcrumb)
│   ├── home.css          ← styles used ONLY on index.html
│   ├── products.css      ← styles used ONLY on products.html (filters, toolbar)
│   ├── product-details.css ← styles used ONLY on product-details.html (gallery, tabs);
│   │                           also reused by cart.html for the quantity stepper
│   ├── cart.css            ← styles used ONLY on cart.html (item rows, order summary)
│   └── wishlist.css        ← styles used ONLY on wishlist.html (card actions, empty state)
├── js/
│   ├── main.js            ← shared behavior (mobile menu, newsletter form)
│   ├── home.js             ← behavior used ONLY on index.html
│   ├── products.js         ← filtering/sorting/search/render logic for products.html
│   ├── product-details.js  ← render/selection logic for product-details.html
│   ├── cart.js              ← render/quantity/coupon logic for cart.html
│   ├── wishlist.js          ← render/move-to-cart logic for wishlist.html
│   ├── store/
│   │   └── cart-store.js   ← THE cart + wishlist state, persisted to localStorage —
│   │                           every page that touches cart/wishlist loads this first
│   ├── shared/
│   │   ├── product-card.js  ← builds a product card's HTML — used by products.js
│   │   │                        AND product-details.js ("Related Products"), so both
│   │   │                        pages always render the exact same card
│   │   └── navbar-badges.js ← keeps the navbar's cart count badge correct — loaded
│   │                            on every page, right after store/cart-store.js
│   └── data/
│       └── products.js     ← mock "database": one array of 20 product objects
├── assets/
│   ├── icons/              ← put reusable .svg icons here later if needed
│   └── images/
│       ├── products/        ← one image per product, named <product-id>.jpg
│       │                       (e.g. 202.jpg = id 202 in js/data/products.js)
│       └── site/             ← hero panels, category tiles, offer banner photo
└── README.md
```

### About the cart/wishlist store (Module 4)

`js/store/cart-store.js` is the single source of truth for the cart and
wishlist — it's the plain-JS equivalent of the Redux + redux-persist
combo the original brief called for: state lives in memory during the
visit AND is written to `localStorage`, so it survives navigating
between pages and refreshing the browser.

**Every page that shows a wishlist heart or an "Add to cart" button
loads this file first**, then calls its plain global functions —
`addToCart()`, `removeFromCart()`, `updateCartQuantity()`, `toggleWishlist()`,
`moveWishlistItemToCart()`, etc. Nothing outside this one file talks to
`localStorage` directly, which matters for **Module 6**: swapping this
file's internals for real API calls later (e.g. `POST /api/cart`) won't
require touching `products.js`, `product-details.js`, `cart.js`, or
`wishlist.js` at all, as long as the function names stay the same.

Whenever the cart or wishlist changes, this file fires a
`cart:updated`/`wishlist:updated` browser event — that's how the navbar
badge (`js/shared/navbar-badges.js`) updates itself immediately, even
when the change happened from a totally different part of the page.

### About product-details.html (Module 3)

One HTML file serves every product — it reads `?id=` from the URL (e.g.
`product-details.html?id=202`), looks that id up in `PRODUCTS`, and
renders the whole page from it: gallery, color/size selectors, quantity,
stock status, add to cart/wishlist, description, specifications, and
reviews. Every product card site-wide already links here with the
correct id, so there's nothing to wire up when a new product is added
to the data file — its detail page just works.

### About `js/data/products.js`

This is a stand-in database — one JavaScript array (`PRODUCTS`) that
`products.js` reads to build the catalogue. **Module 3 (Product Details)
should read from this same array** rather than creating its own copy of
product data, so both pages always agree on what a product's name/price/
etc. actually is. When Module 6 builds a real backend, this file gets
replaced by a `fetch("/api/products")` call that returns the same shape
of data — nothing else has to change.

## How to add your module (Products, Cart, Checkout, etc.)

1. **Create your page as a new `.html` file** in the project root, e.g.
   `products.html`, `cart.html`, `checkout.html`.
2. **Copy the `<header class="navbar">...</header>` block and the
   `<footer class="footer">...</footer>` block** from `index.html` into your
   new page, unchanged, so navigation looks identical everywhere. Just
   update which link has `class="is-active"`.
3. In your page's `<head>`, link the stylesheets in this order:
   ```html
   <link rel="stylesheet" href="css/variables.css" />
   <link rel="stylesheet" href="css/base.css" />
   <link rel="stylesheet" href="css/navbar.css" />
   <link rel="stylesheet" href="css/footer.css" />
   <link rel="stylesheet" href="css/products.css" />
   <!-- ↑ create your own page-specific CSS file, named after your page -->
   ```
4. Before the closing `</body>` tag, include the shared script, then your
   own:
   ```html
   <script src="js/main.js"></script>
   <script src="js/products.js"></script>
   ```
5. **Reuse existing classes** wherever you can instead of inventing new
   ones — `.btn`, `.btn--primary`, `.btn--outline`, `.tag`, `.product-card`,
   `.container`, `.section` are all already defined in `css/base.css` /
   `css/components.css` and are meant to be shared. This keeps the whole
   site feeling like one product instead of six different ones glued
   together. If you use something from a page-specific file (e.g.
   `home.css`) on your own page too, **move it into `components.css`**
   instead of copy-pasting it — see the note at the top of that file.

## Design tokens (colors/fonts) — don't hardcode!

Always use the CSS variables from `css/variables.css` instead of typing a
color or font directly, e.g.:

```css
/* ✅ do this */
.my-badge { background-color: var(--color-brick); }

/* ❌ not this */
.my-badge { background-color: #a63d40; }
```

If we ever need to change the brand color, we only have to edit one file.

## Placeholder content — what's fake right now

- **Product/site photos are real image FILES** (not CSS gradients) in
  `assets/images/products/` and `assets/images/site/` — each one is a
  generated placeholder with a "PLACEHOLDER — REPLACE ME" watermark, so
  it's obvious at a glance which files still need real photography.
  **To swap in a real photo:** just overwrite the file at the exact
  same path/filename (e.g. replace `assets/images/products/202.jpg`
  with your actual photo of that product, same filename, and it updates
  everywhere that product appears — homepage, catalogue, and later the
  product details page — with no HTML/CSS/JS changes needed). Keep a
  similar aspect ratio (roughly 3:4 for product photos) so the layout
  doesn't shift.
- **"Add to cart" and wishlist heart buttons are fully real now** — they
  persist to the browser's `localStorage` via `js/store/cart-store.js`
  (see "About the cart/wishlist store" above), survive page refresh, and
  the navbar cart count updates live. What's still a stand-in: the cart
  only lives in *this browser* — there's no account/server sync until
  Module 6 exists, so it won't follow a shopper across devices.
- **Coupon codes** (`WELCOME10`, `SAVE20`) are hard-coded in `js/cart.js`
  for demo purposes — replace `COUPON_CODES` with a real server-validated
  lookup before launch, or anyone can read the codes straight out of the
  page source.
- **Newsletter form** just shows a "Thanks!" message locally — Module 6
  will connect it to a real backend endpoint.
- **Prices, stock counts, and ratings** are placeholder numbers in
  `js/data/products.js` — edit that file directly with your real catalogue
  before launch.

⚠️ **Before this goes live for real customers:** every photo in
`assets/images/` needs to be replaced with photography you own the
rights to (your own product shots, or stock images you've actually
licensed). None of the generated placeholder images are meant to be
used in production — they exist only so the layout has something to
show while real content is being prepared.

Search each JS/CSS file for comments starting with `FUTURE INTEGRATION
NOTE` to find every spot that's intentionally a stand-in for later work.

## Git workflow (for a 6-person team)

- Work in **one shared repository** — don't create six separate projects.
- Create a branch per module, e.g. `feature/product-catalogue`,
  `feature/cart-wishlist`.
- Open a Pull Request into `main` when your page works, so a teammate can
  review it before merging.
- Keep commits small and describe *what* changed, e.g.
  `git commit -m "Add product filter sidebar to products.html"`.

## Running the site locally

No build step needed — just open `index.html` in a browser, or (recommended)
use a local server so relative paths behave exactly like they will on
GitHub Pages:

- VS Code: install the **Live Server** extension, right-click
  `index.html` → "Open with Live Server".
- Or, with Python installed: `python -m http.server`, then visit
  `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under "Build and deployment", choose **Deploy from a branch**, pick
   `main` and the root folder (`/`).
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.
