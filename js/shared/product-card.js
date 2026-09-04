/* ==========================================================================
   PRODUCT-CARD.JS (shared)
   ------------------------------------------------------------------------
   One function, createProductCardHTML(product), that builds a product
   card's HTML string. Used by:
     - js/products.js       (the main catalogue grid)
     - js/product-details.js (the "Related Products" strip)

   WHY THIS IS ITS OWN FILE:
   Both pages need the exact same card markup/classes (see
   css/components.css .product-card). Keeping the builder in one shared
   file means the card only has ONE place to update - change it here and
   both pages pick up the change automatically, instead of two copies
   quietly drifting apart over time.

   Must be loaded (via <script>) BEFORE products.js or product-details.js
   in every page's <head>/<body>, since both call this function directly
   as a global. Also expects js/store/cart-store.js to already be loaded
   (for isInWishlist), so a card renders with the correct heart state
   from the moment it first appears on screen.
   ========================================================================== */

function createProductCardHTML(product) {
  const badge = product.isNew
    ? `<span class="tag tag--mustard">New</span>`
    : product.originalPrice
    ? `<span class="tag tag--brick">-${Math.round(100 - (product.price / product.originalPrice) * 100)}%</span>`
    : "";

  const priceHTML = product.originalPrice
    ? `<del>$${product.originalPrice}</del>$${product.price}`
    : `$${product.price}`;

  // isInWishlist() lives in js/store/cart-store.js, loaded before this
  // file on every page that uses it - so a card built AFTER the page
  // already has this product in the wishlist renders with a filled
  // heart from the start, instead of looking wrong until clicked.
  const wishlisted = typeof isInWishlist === "function" && isInWishlist(product.id);

  return `
    <article class="product-card">
      <a href="product-details.html?id=${product.id}" class="product-card__photo">
        <img src="${product.photoUrl || `assets/images/products/${product.id}.jpg`}" alt="${product.name}" loading="lazy" />
        <div class="product-card__tags">${badge}</div>
      </a>
      <button class="product-card__wishlist ${wishlisted ? "is-active" : ""}" data-product-id="${product.id}" aria-label="Add to wishlist" aria-pressed="${wishlisted}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.4-1.2 5 0 7.4 3 2.4-3 5-4.2 7.4-3 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
        </svg>
      </button>
      <div class="product-card__body">
        <p class="product-card__brand">${product.brand}</p>
        <h3 class="product-card__name"><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
        <div class="product-card__meta">
          <span class="product-card__price">${priceHTML}</span>
          <span class="product-card__rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9" /></svg>
            ${product.rating}
          </span>
        </div>
        <button class="btn btn--outline btn--sm product-card__add" data-product-id="${product.id}">Add to cart</button>
      </div>
    </article>`;
}
