/* ==========================================================================
   NAVBAR-BADGES.JS
   ------------------------------------------------------------------------
   Small, page-agnostic script that keeps the navbar's cart count badge
   correct. Loaded on EVERY page, right after js/store/cart-store.js.

   Two situations it handles:
     1. Page just loaded - set the badge from whatever's already in
        localStorage (so refreshing the page keeps the right count).
     2. Cart changes WITHOUT a page reload - e.g. clicking "Add to cart"
        on the products grid. The cart store fires a "cart:updated"
        event whenever that happens (see dispatchStoreEvent in
        cart-store.js), and this file listens for it.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", updateCartBadge);
window.addEventListener("cart:updated", updateCartBadge);

function updateCartBadge() {
  const badge = document.querySelector(".navbar__icon-badge");
  if (!badge) return;

  const count = getCartCount();

  if (count === 0) {
    badge.hidden = true;
  } else {
    badge.hidden = false;
    badge.textContent = count;
  }

  // Keep the accessible label in sync too, e.g. "Cart, 3 items"
  const cartLink = badge.closest("a");
  if (cartLink) {
    cartLink.setAttribute("aria-label", `Cart, ${count} item${count === 1 ? "" : "s"}`);
  }
}
