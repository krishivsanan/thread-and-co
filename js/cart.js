/* ==========================================================================
   CART.JS
   ------------------------------------------------------------------------
   Drives cart.html. Reads the cart from js/store/cart-store.js (which
   persists it in localStorage), joins it with product data from
   js/data/products.js, and renders the item list + order summary.

   HOW THIS FILE IS ORGANISED:
     1. PRICING CONSTANTS  - tax rate, shipping threshold, coupon codes
     2. STATE               - the one thing this page tracks that ISN'T
                              in the cart store itself: the applied coupon
     3. RENDER               - item rows + order summary totals
     4. EVENTS               - quantity/remove/coupon/clear-cart handlers
   ========================================================================== */

/* ------------------------------------------------------------------------
   1. PRICING CONSTANTS
   ------------------------------------------------------------------------ */
const TAX_RATE = 0.08; // flat 8% - a real store would vary this by shipping address
const FREE_SHIPPING_THRESHOLD = 50; // matches the navbar banner's "Free shipping over $50"
const FLAT_SHIPPING_FEE = 6.99;

// A tiny stand-in "coupon database". Module 5 (Checkout) or Module 6
// (Backend) can replace this object with a real lookup once coupons are
// validated server-side instead of hard-coded client-side.
const COUPON_CODES = {
  WELCOME10: 0.1, // 10% off
  SAVE20: 0.2, // 20% off
};

/* ------------------------------------------------------------------------
   2. STATE
   The cart items themselves live in localStorage via cart-store.js -
   this page doesn't keep its own copy. The ONLY thing tracked here is
   which coupon (if any) is currently applied, since a coupon is a
   property of this shopping session, not of the cart's contents.
   ------------------------------------------------------------------------ */
let appliedCoupon = null; // e.g. { code: "WELCOME10", percent: 0.1 }

document.addEventListener("DOMContentLoaded", () => {
  render();
  attachEvents();
});

// If the cart changes elsewhere (e.g. this page is open in two tabs, or
// a "Move to cart" happened on the wishlist page just before navigating
// here), keep this page in sync automatically.
window.addEventListener("cart:updated", render);

/* ------------------------------------------------------------------------
   3. RENDER
   ------------------------------------------------------------------------ */
function render() {
  const items = getCartWithProductDetails(); // js/store/cart-store.js

  if (items.length === 0) {
    renderEmptyState();
    return;
  }

  renderItems(items);
  renderSummary(items);
}

function renderEmptyState() {
  document.getElementById("cart-main").innerHTML = `
    <div class="container cart-empty">
      <h1>Your cart is empty</h1>
      <p>Looks like you haven't added anything yet.</p>
      <a href="products.html" class="btn btn--primary">Start shopping</a>
    </div>`;
}

function renderItems(items) {
  const container = document.getElementById("cart-items");
  if (!container) return; // empty state may have replaced this container already

  container.innerHTML = items
    .map((item) => {
      const photo = item.product.photoUrl || `assets/images/products/${item.product.id}.jpg`;
      const variantParts = [item.color, item.size].filter(Boolean);
      const lineTotal = (item.product.price * item.quantity).toFixed(2);

      return `
        <div class="cart-item" data-product-id="${item.productId}" data-size="${item.size || ""}" data-color="${item.color || ""}">
          <a href="product-details.html?id=${item.product.id}" class="cart-item__photo">
            <img src="${photo}" alt="${item.product.name}" />
          </a>

          <div>
            <p class="cart-item__brand">${item.product.brand}</p>
            <a href="product-details.html?id=${item.product.id}" class="cart-item__name">${item.product.name}</a>
            ${variantParts.length ? `<p class="cart-item__variant">${variantParts.join(" · ")}</p>` : ""}

            <div class="cart-item__controls">
              <div class="qty-stepper">
                <button type="button" class="cart-qty-minus" aria-label="Decrease quantity">&minus;</button>
                <input type="number" value="${item.quantity}" min="1" readonly />
                <button type="button" class="cart-qty-plus" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="cart-item__remove">Remove</button>
            </div>
          </div>

          <div class="cart-item__price-col">
            <p class="cart-item__line-total">$${lineTotal}</p>
            <p class="cart-item__unit-price">$${item.product.price} each</p>
          </div>
        </div>`;
    })
    .join("");
}

function renderSummary(items) {
  const summaryEl = document.getElementById("order-summary-body");
  if (!summaryEl) return;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const discount = appliedCoupon ? subtotal * appliedCoupon.percent : 0;
  const total = subtotal + shipping + tax - discount;

  summaryEl.innerHTML = `
    <div class="order-summary__row">
      <span>Subtotal</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="order-summary__row">
      <span>Shipping</span>
      <span>${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
    </div>
    ${
      shipping > 0
        ? `<p class="order-summary__shipping-note">Add $${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping</p>`
        : ""
    }
    <div class="order-summary__row">
      <span>Estimated tax</span>
      <span>$${tax.toFixed(2)}</span>
    </div>
    ${
      appliedCoupon
        ? `<div class="order-summary__row order-summary__row--discount">
             <span>Discount (${appliedCoupon.code})</span>
             <span>&minus;$${discount.toFixed(2)}</span>
           </div>`
        : ""
    }
    <div class="order-summary__row order-summary__row--total">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>`;
}

/* ------------------------------------------------------------------------
   4. EVENTS
   ------------------------------------------------------------------------ */
function attachEvents() {
  // ---- Quantity +/- and Remove (event delegation - rows get rebuilt on every render) ----
  const itemsContainer = document.getElementById("cart-items");
  if (itemsContainer) {
    itemsContainer.addEventListener("click", (e) => {
      const row = e.target.closest(".cart-item");
      if (!row) return;

      const productId = Number(row.dataset.productId);
      const size = row.dataset.size || null;
      const color = row.dataset.color || null;

      if (e.target.closest(".cart-qty-plus")) {
        const current = getCart().find((i) => i.productId === productId && i.size === size && i.color === color);
        if (current) updateCartQuantity(productId, size, color, current.quantity + 1);
        return;
      }

      if (e.target.closest(".cart-qty-minus")) {
        const current = getCart().find((i) => i.productId === productId && i.size === size && i.color === color);
        if (current) updateCartQuantity(productId, size, color, current.quantity - 1);
        return;
      }

      if (e.target.closest(".cart-item__remove")) {
        removeFromCart(productId, size, color);
      }
    });
  }

  // ---- Coupon form ----
  const couponForm = document.getElementById("coupon-form");
  if (couponForm) {
    couponForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("coupon-input");
      const code = input.value.trim().toUpperCase();
      const msgEl = document.getElementById("coupon-msg");

      if (!code) return;

      if (COUPON_CODES[code]) {
        appliedCoupon = { code, percent: COUPON_CODES[code] };
        msgEl.textContent = `"${code}" applied - ${Math.round(COUPON_CODES[code] * 100)}% off.`;
        msgEl.className = "coupon-msg coupon-msg--success";
      } else {
        appliedCoupon = null;
        msgEl.textContent = "That code isn't valid.";
        msgEl.className = "coupon-msg coupon-msg--error";
      }

      renderSummary(getCartWithProductDetails());
    });
  }

  // ---- Clear cart ----
  const clearBtn = document.getElementById("clear-cart");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Remove everything from your cart?")) {
        clearCart();
      }
    });
  }

  // ---- Checkout button ----
  // Module 5 (Checkout & Orders) hasn't been built yet, so this just
  // links to checkout.html - clicking it before that file exists will
  // 404, same pattern used for other not-yet-built pages across the site.
}
