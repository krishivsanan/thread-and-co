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

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  updateWishlistBadge();
  updateAccountNavbar();
});
window.addEventListener("cart:updated", updateCartBadge);
window.addEventListener("wishlist:updated", updateWishlistBadge);

function updateCartBadge() {
  const badge = document.querySelector(".navbar__cart-badge") ||
    document.querySelector('.navbar__icon-btn[aria-label*="Cart"] .navbar__icon-badge') ||
    document.querySelector(".navbar__icon-badge");
  if (!badge) return;

  const count = typeof getCartCount === "function" ? getCartCount() : 0;

  if (count === 0) {
    badge.hidden = true;
  } else {
    badge.hidden = false;
    badge.textContent = count;
  }

  const cartLink = badge.closest("a");
  if (cartLink) {
    cartLink.setAttribute("aria-label", `Cart, ${count} item${count === 1 ? "" : "s"}`);
  }
}

function updateWishlistBadge() {
  const badge = document.querySelector(".navbar__wishlist-badge") ||
    document.querySelector('.navbar__icon-btn[aria-label*="Wishlist"] .navbar__icon-badge');
  if (!badge) return;

  const count = typeof getWishlistCount === "function"
    ? getWishlistCount()
    : (typeof getWishlist === "function" ? getWishlist().length : 0);

  if (count === 0) {
    badge.hidden = true;
  } else {
    badge.hidden = false;
    badge.textContent = count;
  }

  const wishlistLink = badge.closest("a");
  if (wishlistLink) {
    wishlistLink.setAttribute("aria-label", `Wishlist, ${count} item${count === 1 ? "" : "s"}`);
  }
}

function updateAccountNavbar() {
  try {
    const raw = localStorage.getItem("threadco_current_user");
    if (!raw) return;
    const user = JSON.parse(raw);
    if (!user || !user.name) return;

    const accountLink = document.querySelector('.navbar__icon-btn[aria-label*="Account"]') ||
      document.querySelector('.navbar__icon-btn[aria-label*="account"]');
    if (accountLink) {
      accountLink.setAttribute("href", "account.html");
      accountLink.setAttribute("title", `Account (${user.name})`);
      accountLink.setAttribute("aria-label", `Account: ${user.name}`);
    }
  } catch (err) {
    // Ignore invalid JSON safely
  }
}
