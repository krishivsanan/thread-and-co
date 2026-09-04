/* ==========================================================================
   WISHLIST.JS
   ------------------------------------------------------------------------
   Drives wishlist.html. Reads product ids from js/store/cart-store.js
   (localStorage-backed), joins them with product data, and renders a
   grid of cards with "Move to cart" and "Remove" actions.

   This page builds its OWN card markup (createWishlistCardHTML below)
   rather than reusing js/shared/product-card.js's createProductCardHTML.
   Reason: this page's cards need different buttons - "Move to cart" +
   "Remove" instead of a wishlist heart + generic "Add to cart" - so
   forcing the shared function to cover both shapes would make it more
   complicated for the two pages that DO share the same card. Still
   reuses the same .product-card/.product-card__photo classes from
   css/components.css for visual consistency.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  render();
  attachEvents();
});

window.addEventListener("wishlist:updated", render);

function render() {
  const products = getWishlistWithProductDetails(); // js/store/cart-store.js

  if (products.length === 0) {
    renderEmptyState();
    return;
  }

  const grid = document.getElementById("wishlist-grid");
  if (!grid) return; // page may already be showing the empty state
  grid.innerHTML = products.map(createWishlistCardHTML).join("");
}

function renderEmptyState() {
  document.getElementById("wishlist-main").innerHTML = `
    <div class="container wishlist-empty">
      <h1>Your wishlist is empty</h1>
      <p>Tap the heart on any product to save it here for later.</p>
      <a href="products.html" class="btn btn--primary">Browse products</a>
    </div>`;
}

function createWishlistCardHTML(product) {
  const photo = product.photoUrl || `assets/images/products/${product.id}.jpg`;
  const priceHTML = product.originalPrice ? `<del>$${product.originalPrice}</del>$${product.price}` : `$${product.price}`;

  return `
    <article class="product-card" data-product-id="${product.id}">
      <a href="product-details.html?id=${product.id}" class="product-card__photo">
        <img src="${photo}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="product-card__body">
        <p class="product-card__brand">${product.brand}</p>
        <h3 class="product-card__name"><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
        <div class="product-card__meta">
          <span class="product-card__price">${priceHTML}</span>
        </div>
        <div class="wishlist-card__actions">
          <button type="button" class="btn btn--primary btn--sm wishlist-move-btn" data-product-id="${product.id}">
            ${product.stock === 0 ? "Out of stock" : "Move to cart"}
          </button>
          <button type="button" class="wishlist-remove-btn" data-product-id="${product.id}" aria-label="Remove from wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </article>`;
}

function attachEvents() {
  const grid = document.getElementById("wishlist-grid");
  if (!grid) return;

  grid.addEventListener("click", (e) => {
    const moveBtn = e.target.closest(".wishlist-move-btn");
    if (moveBtn) {
      const productId = Number(moveBtn.dataset.productId);
      const product = PRODUCTS.find((p) => p.id === productId);
      if (product && product.stock === 0) return; // can't move an out-of-stock item to cart

      moveWishlistItemToCart(productId); // js/store/cart-store.js - adds to cart AND removes from wishlist
      render(); // moveWishlistItemToCart fires wishlist:updated too, but rendering
      // immediately here avoids waiting on the event loop for the click's own feedback
      return;
    }

    const removeBtn = e.target.closest(".wishlist-remove-btn");
    if (removeBtn) {
      const productId = Number(removeBtn.dataset.productId);
      removeFromWishlist(productId); // js/store/cart-store.js
      render();
    }
  });
}
