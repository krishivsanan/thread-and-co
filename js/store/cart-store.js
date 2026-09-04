/* ==========================================================================
   CART-STORE.JS  -  Module 4: Cart & Wishlist
   ------------------------------------------------------------------------
   This is the site's shared cart + wishlist "database" - except instead
   of a server, it's saved in the browser's localStorage, so the cart
   survives page navigation AND a full page refresh (the same problem
   the original project brief solves with Redux + redux-persist; this is
   the plain-JS equivalent of that idea).

   EVERY page that touches the cart or wishlist loads this file FIRST,
   before its own page script. It exposes plain global functions
   (addToCart, removeFromCart, etc.) - no import/export, since the rest
   of the site doesn't use JS modules either.

   HOW THIS FILE IS ORGANISED:
     1. STORAGE HELPERS   - read/write localStorage safely
     2. CART               - add/remove/update items, totals
     3. WISHLIST            - add/remove/move-to-cart
     4. EVENTS               - lets any page react live when the cart/
                              wishlist changes (e.g. the navbar badge)

   FUTURE INTEGRATION NOTE for Module 6 (Authentication & Backend):
   Once a real backend + logged-in accounts exist, swap the body of each
   function below for real API calls (e.g. POST /cart) instead of
   localStorage - the FUNCTION NAMES here (addToCart, removeFromCart...)
   are what the rest of the site calls, so keeping those names the same
   means nothing outside this file has to change.
   ========================================================================== */

const CART_STORAGE_KEY = "threadco_cart";
const WISHLIST_STORAGE_KEY = "threadco_wishlist";

/* ------------------------------------------------------------------------
   1. STORAGE HELPERS
   ------------------------------------------------------------------------ */

/* Reads and JSON-parses a key from localStorage, returning a fallback
   value if it's missing or corrupted. Wrapping every localStorage read
   in try/catch matters because localStorage can throw (e.g. private
   browsing mode in some browsers, or someone hand-editing the stored
   value into invalid JSON) - one bad read shouldn't crash the page. */
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`Couldn't read ${key} from localStorage, using default.`, err);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Couldn't save ${key} to localStorage.`, err);
  }
}

/* ------------------------------------------------------------------------
   2. CART
   A cart item looks like:
     { productId: 202, size: "M", color: "navy", quantity: 2 }
   size/color are null for products with only one option (see
   product.sizes.length === 1 handling in product-details.js).
   ------------------------------------------------------------------------ */

function getCart() {
  return readStorage(CART_STORAGE_KEY, []);
}

function saveCart(cart) {
  writeStorage(CART_STORAGE_KEY, cart);
  dispatchStoreEvent("cart:updated", cart);
}

/* Two cart lines count as "the same item" only if product AND size AND
   color all match - a navy Medium tee and a black Medium tee are
   different lines, each with their own quantity. */
function isSameLine(item, productId, size, color) {
  return item.productId === productId && item.size === size && item.color === color;
}

function addToCart({ productId, size = null, color = null, quantity = 1 }) {
  const cart = getCart();
  const existing = cart.find((item) => isSameLine(item, productId, size, color));

  if (existing) {
    existing.quantity += quantity; // already have this exact line - bump the quantity
  } else {
    cart.push({ productId, size, color, quantity });
  }

  saveCart(cart);
}

function removeFromCart(productId, size = null, color = null) {
  const cart = getCart().filter((item) => !isSameLine(item, productId, size, color));
  saveCart(cart);
}

function updateCartQuantity(productId, size, color, newQuantity) {
  const cart = getCart();
  const item = cart.find((i) => isSameLine(i, productId, size, color));
  if (!item) return;

  if (newQuantity <= 0) {
    removeFromCart(productId, size, color); // dropping to 0 removes the line entirely
    return;
  }

  item.quantity = newQuantity;
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

/* Total number of individual items (not lines) - what the navbar badge
   shows. Two lines of quantity 2 and 3 => badge shows 5. */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

/* Joins each cart line with its full product record from PRODUCTS (see
   js/data/products.js) so pages can show the name/price/photo without
   duplicating that data into the cart itself. Lines whose product no
   longer exists (e.g. removed from the catalogue) are silently dropped
   rather than crashing the cart page. */
function getCartWithProductDetails() {
  return getCart()
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean);
}

/* ------------------------------------------------------------------------
   3. WISHLIST
   Simpler than the cart: just a list of product ids (no size/color/qty -
   you either want the product or you don't).
   ------------------------------------------------------------------------ */

function getWishlist() {
  return readStorage(WISHLIST_STORAGE_KEY, []);
}

function saveWishlist(wishlist) {
  writeStorage(WISHLIST_STORAGE_KEY, wishlist);
  dispatchStoreEvent("wishlist:updated", wishlist);
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

function addToWishlist(productId) {
  const wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    saveWishlist(wishlist);
  }
}

function removeFromWishlist(productId) {
  saveWishlist(getWishlist().filter((id) => id !== productId));
}

/* Toggles wishlist state and reports back what happened, so a click
   handler can update a heart icon without also calling isInWishlist()
   itself right after. */
function toggleWishlist(productId) {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false; // now NOT in the wishlist
  }
  addToWishlist(productId);
  return true; // now IS in the wishlist
}

/* "Move to cart": adds the default (first) size/color to the cart, then
   removes the product from the wishlist - one click, matching the
   "Move to cart" button required in the wishlist spec. Products that
   need a real size/color choice (more than one option) still get moved
   with a sensible default rather than blocking the shopper; they can
   always adjust size/color later from the product page or cart. */
function moveWishlistItemToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  addToCart({
    productId,
    size: product.sizes[0] || null,
    color: product.colors[0] || null,
    quantity: 1,
  });
  removeFromWishlist(productId);
}

function getWishlistWithProductDetails() {
  return getWishlist()
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);
}

/* ------------------------------------------------------------------------
   4. EVENTS
   Dispatches a plain browser CustomEvent whenever the cart or wishlist
   changes, so any page can listen for "cart:updated" and refresh
   whatever it's showing (the navbar badge count, a cart page's totals,
   etc.) without needing to know WHO changed the cart or WHY.
   ------------------------------------------------------------------------ */
function dispatchStoreEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
