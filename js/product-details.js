/* ==========================================================================
   PRODUCT-DETAILS.JS
   ------------------------------------------------------------------------
   Drives product-details.html (Module 3). Reads a product id from the
   URL (?id=202), looks it up in the shared PRODUCTS array (from
   js/data/products.js), and renders everything: gallery, color/size
   selectors, quantity, stock status, tabs, and related products.

   HOW THIS FILE IS ORGANISED (read top to bottom):
     1. LOAD PRODUCT     - read ?id= from the URL, find it in PRODUCTS
     2. STATE             - the one selected color/size/quantity/tab
     3. RENDER FUNCTIONS  - one function per section of the page
     4. CONTENT GENERATORS - description/specs/reviews built from the
                             product's existing fields (no extra data
                             file needed for this class-project scope)
     5. EVENTS            - wires up clicks/changes to state + re-render
   ========================================================================== */

/* ------------------------------------------------------------------------
   1. LOAD PRODUCT
   ------------------------------------------------------------------------ */
const urlParams = new URLSearchParams(window.location.search);
const productId = Number(urlParams.get("id"));
const product = PRODUCTS.find((p) => p.id === productId);

/* ------------------------------------------------------------------------
   2. STATE
   Everything the shopper has picked on THIS page. Kept separate from
   js/products.js's `state` (different file, different page, never
   loaded together).
   ------------------------------------------------------------------------ */
const pdState = {
  selectedColor: null,
  selectedSize: null,
  quantity: 1,
  activeTab: "description",
};

document.addEventListener("DOMContentLoaded", () => {
  if (!product) {
    renderNotFound();
    return; // stop here - nothing else on the page has data to show
  }

  // Pre-select when there's only one real option, so the shopper isn't
  // forced to click a selector that doesn't actually offer a choice.
  if (product.colors.length === 1) pdState.selectedColor = product.colors[0];
  if (product.sizes.length === 1) pdState.selectedSize = product.sizes[0];

  renderGallery();
  renderInfo();
  renderTabs();
  renderRelatedProducts();
  renderBreadcrumb();
  attachEvents();
});

const CATEGORY_LABELS_PD = { men: "Men", women: "Women", shoes: "Shoes", accessories: "Accessories" };

function renderBreadcrumb() {
  const el = document.getElementById("pd-breadcrumb");
  const categoryLabel = CATEGORY_LABELS_PD[product.category] || product.category;
  el.innerHTML = `<a href="index.html">Home</a> / <a href="products.html?category=${product.category}">${categoryLabel}</a> / <span>${product.name}</span>`;
}

/* ------------------------------------------------------------------------
   3. RENDER FUNCTIONS
   ------------------------------------------------------------------------ */

function renderNotFound() {
  const main = document.getElementById("pd-main");
  main.innerHTML = `
    <div class="container pd-not-found">
      <h1>Product not found</h1>
      <p>We couldn't find a product with that ID. It may have been removed.</p>
      <a href="products.html" class="btn btn--primary">Back to shop all</a>
    </div>`;
}

/* Gallery: one real main photo + a thumbnail strip. We only have ONE
   real photo per product right now (see js/data/products.js photoUrl),
   so thumbs 2-4 are clearly-labeled placeholders - the exact same
   "swap this file later" pattern used across the rest of the site. */
function renderGallery() {
  const mainPhoto = product.photoUrl || `assets/images/products/${product.id}.jpg`;

  const thumbs = [
    { src: mainPhoto },
    { src: `assets/images/products/${product.id}.jpg` },
    { label: "Detail shot" },
    { label: "Worn shot" },
  ];

  document.getElementById("pd-gallery-main").innerHTML = `<img src="${mainPhoto}" alt="${product.name}" id="pd-main-img" />`;

  document.getElementById("pd-gallery-thumbs").innerHTML = thumbs
    .map((thumb, index) => {
      const inner = thumb.label
        ? `<div class="img-placeholder" style="--ph-color-a:${product.placeholder.a};--ph-color-b:${product.placeholder.b};">${thumb.label}</div>`
        : `<img src="${thumb.src}" alt="${product.name}" />`;
      return `<button class="pd-gallery__thumb ${index === 0 ? "is-active" : ""}" data-thumb-src="${thumb.src || ""}" aria-label="View photo ${index + 1}">${inner}</button>`;
    })
    .join("");
}

function renderInfo() {
  const container = document.getElementById("pd-info");

  const priceHTML = product.originalPrice
    ? `<del>$${product.originalPrice}</del>$${product.price}`
    : `$${product.price}`;

  const colorSwatchesHTML = product.colors
    .map((color) => {
      const hex = COLOR_SWATCHES[color] || "#ccc";
      const selected = pdState.selectedColor === color ? "is-selected" : "";
      return `<button type="button" class="color-swatch ${selected}" style="background-color:${hex};" data-color="${color}" aria-label="${color}" title="${color}"></button>`;
    })
    .join("");

  const sizeChipsHTML = product.sizes
    .map((size) => {
      const selected = pdState.selectedSize === size ? "is-selected" : "";
      return `<button type="button" class="size-chip ${selected}" data-size="${size}">${size}</button>`;
    })
    .join("");

  container.innerHTML = `
    <p class="pd-info__brand">${product.brand}</p>
    <h1 class="pd-info__title">${product.name}</h1>

    <p class="pd-info__rating">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9" /></svg>
      ${product.rating}
      <button type="button" id="pd-review-jump">(${getReviews().length} reviews)</button>
    </p>

    <p class="pd-info__price">${priceHTML}</p>

    <div class="pd-info__section">
      <p class="pd-info__label">Color <span class="selected-value" id="pd-selected-color">${pdState.selectedColor || "select a color"}</span></p>
      <div class="color-swatches" id="pd-color-swatches">${colorSwatchesHTML}</div>
    </div>

    <div class="pd-info__section">
      <p class="pd-info__label">Size <span class="selected-value" id="pd-selected-size">${pdState.selectedSize || "select a size"}</span></p>
      <div class="size-chips" id="pd-size-chips">${sizeChipsHTML}</div>
    </div>

    <div class="pd-info__section">
      <p class="pd-info__label">Quantity</p>
      <div class="qty-stepper">
        <button type="button" id="pd-qty-minus" aria-label="Decrease quantity">&minus;</button>
        <input type="number" id="pd-qty-input" value="${pdState.quantity}" min="1" max="${product.stock || 1}" readonly />
        <button type="button" id="pd-qty-plus" aria-label="Increase quantity">+</button>
      </div>
    </div>

    ${renderStockStatusHTML()}

    <div class="pd-actions">
      <button type="button" class="btn btn--primary" id="pd-add-to-cart" ${product.stock === 0 ? "disabled" : ""}>
        ${product.stock === 0 ? "Out of stock" : "Add to cart"}
      </button>
      <button type="button" class="pd-wishlist-btn ${isInWishlist(product.id) ? "is-active" : ""}" id="pd-wishlist-btn" aria-label="Add to wishlist" aria-pressed="${isInWishlist(product.id)}">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.4-1.2 5 0 7.4 3 2.4-3 5-4.2 7.4-3 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
        </svg>
      </button>
    </div>
    <p class="pd-validation" id="pd-validation"></p>
  `;
}

function renderStockStatusHTML() {
  const stock = product.stock || 0;
  if (stock === 0) {
    return `<p class="pd-stock pd-stock--out">Out of stock</p>`;
  }
  if (stock < 5) {
    return `<p class="pd-stock pd-stock--low">Only ${stock} left - order soon</p>`;
  }
  return `<p class="pd-stock pd-stock--in">In stock</p>`;
}

function renderTabs() {
  document.getElementById("pd-tab-description").innerHTML = `<p>${generateDescription()}</p>`;
  document.getElementById("pd-tab-specifications").innerHTML = generateSpecificationsHTML();
  document.getElementById("pd-tab-reviews").innerHTML = generateReviewsHTML();
}

function renderRelatedProducts() {
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);

  const section = document.getElementById("pd-related");
  if (related.length === 0) {
    section.hidden = true;
    return;
  }

  document.getElementById("pd-related-track").innerHTML = related.map(createProductCardHTML).join("");
}

/* ------------------------------------------------------------------------
   4. CONTENT GENERATORS
   These build description/specifications/reviews FROM the product's
   existing fields (name, brand, category) rather than needing a second,
   separately-maintained data file - one less place for content to fall
   out of sync with the product itself.
   ------------------------------------------------------------------------ */

function generateDescription() {
  const categoryPhrase = {
    men: "menswear",
    women: "womenswear",
    shoes: "footwear",
    accessories: "accessories",
  }[product.category];

  return `The ${product.name} from ${product.brand} is part of our ${categoryPhrase} collection, designed for everyday wear without sacrificing quality. Made with attention to fit and finish, it's built to hold up to regular use while staying comfortable from morning to night. Available in ${product.colors.join(", ")}.`;
}

function generateSpecificationsHTML() {
  const isShoe = product.category === "shoes";
  const isAccessory = product.category === "accessories";

  const specs = isShoe
    ? {
        Material: "Leather and textile upper",
        Sole: "Rubber outsole",
        Closure: "Lace-up",
        Origin: "Imported",
      }
    : isAccessory
    ? {
        Material: "Premium materials, see product care label",
        Dimensions: "One size fits most",
        Care: "Spot clean as needed",
        Origin: "Imported",
      }
    : {
        Material: "Cotton blend",
        Fit: "True to size, regular fit",
        Care: "Machine wash cold",
        Origin: "Imported",
      };

  const rows = Object.entries(specs)
    .map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`)
    .join("");

  return `<table class="spec-table"><tbody>${rows}</tbody></table>`;
}

/* A small, fixed pool of reviewer names/comments. Which 3 reviews show
   up for a given product is based on the product's own id, so the same
   product always shows the same reviews on every visit/reload instead
   of changing randomly each time. */
const REVIEW_POOL = [
  { author: "Priya S.", comment: "Fits exactly as described and the material feels great. Would buy again." },
  { author: "Jordan M.", comment: "Good quality for the price. Shipping was quick too." },
  { author: "Alex T.", comment: "Nice piece, though I'd size up if you're between sizes." },
  { author: "Sam R.", comment: "Better in person than in photos. Very happy with this purchase." },
  { author: "Casey L.", comment: "Solid everyday item, holds up well after a few washes." },
  { author: "Morgan K.", comment: "Comfortable and true to size. Matches the color shown online." },
];

function getReviews() {
  // Rotate through the pool starting at a different point per product id,
  // so different products show different (but still consistent) reviews.
  const start = product.id % REVIEW_POOL.length;
  const picks = [
    REVIEW_POOL[start],
    REVIEW_POOL[(start + 1) % REVIEW_POOL.length],
    REVIEW_POOL[(start + 2) % REVIEW_POOL.length],
  ];

  // Star rating per review, clustered around the product's overall rating.
  const offsets = [0, -0.5, 0.5];
  return picks.map((review, i) => ({
    ...review,
    stars: Math.min(5, Math.max(1, Math.round(product.rating + offsets[i]))),
    date: ["Jul 2026", "Jun 2026", "May 2026"][i],
  }));
}

function generateReviewsHTML() {
  return getReviews()
    .map((review) => {
      const starsHTML = Array.from({ length: 5 }, (_, i) => {
        const filled = i < review.stars;
        return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" data-filled="${filled}"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9" /></svg>`;
      }).join("");

      return `
        <div class="review">
          <div class="review__head">
            <span class="review__author">${review.author}</span>
            <span class="review__date">${review.date}</span>
          </div>
          <div class="review__stars">${starsHTML}</div>
          <p>${review.comment}</p>
        </div>`;
    })
    .join("");
}

/* ------------------------------------------------------------------------
   5. EVENTS
   ------------------------------------------------------------------------ */
function attachEvents() {
  // ---- Gallery thumbnails swap the main image ----
  document.getElementById("pd-gallery-thumbs").addEventListener("click", (e) => {
    const thumb = e.target.closest(".pd-gallery__thumb");
    if (!thumb || !thumb.dataset.thumbSrc) return; // placeholder thumbs have no real src to swap in

    document.querySelectorAll(".pd-gallery__thumb").forEach((t) => t.classList.remove("is-active"));
    thumb.classList.add("is-active");
    document.getElementById("pd-main-img").src = thumb.dataset.thumbSrc;
  });

  // ---- Info panel: color, size, quantity, add to cart, wishlist ----
  // (event delegation on #pd-info since renderInfo() rebuilds it whenever
  // quantity/validation changes)
  const infoPanel = document.getElementById("pd-info");

  infoPanel.addEventListener("click", (e) => {
    const colorBtn = e.target.closest("[data-color]");
    if (colorBtn) {
      pdState.selectedColor = colorBtn.dataset.color;
      renderInfo();
      return;
    }

    const sizeBtn = e.target.closest("[data-size]");
    if (sizeBtn) {
      pdState.selectedSize = sizeBtn.dataset.size;
      renderInfo();
      return;
    }

    if (e.target.id === "pd-qty-minus") {
      pdState.quantity = Math.max(1, pdState.quantity - 1);
      renderInfo();
      return;
    }

    if (e.target.id === "pd-qty-plus") {
      pdState.quantity = Math.min(product.stock || 1, pdState.quantity + 1);
      renderInfo();
      return;
    }

    if (e.target.closest("#pd-add-to-cart")) {
      handleAddToCart();
      return;
    }

    if (e.target.closest("#pd-wishlist-btn")) {
      const btn = document.getElementById("pd-wishlist-btn");
      const isActive = toggleWishlist(product.id); // js/store/cart-store.js
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      return;
    }

    if (e.target.id === "pd-review-jump") {
      pdState.activeTab = "reviews";
      updateActiveTabUI();
      document.getElementById("pd-tabs").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // ---- Tabs ----
  document.getElementById("pd-tabs-nav").addEventListener("click", (e) => {
    const tabBtn = e.target.closest("[data-tab]");
    if (!tabBtn) return;
    pdState.activeTab = tabBtn.dataset.tab;
    updateActiveTabUI();
  });

  // ---- Related products grid: wishlist + add-to-cart (same pattern as products.js) ----
  const relatedTrack = document.getElementById("pd-related-track");
  if (relatedTrack) {
    relatedTrack.addEventListener("click", (e) => {
      const wishlistBtn = e.target.closest(".product-card__wishlist");
      if (wishlistBtn) {
        const relatedId = Number(wishlistBtn.dataset.productId);
        const isActive = toggleWishlist(relatedId); // js/store/cart-store.js
        wishlistBtn.classList.toggle("is-active", isActive);
        wishlistBtn.setAttribute("aria-pressed", isActive ? "true" : "false");
        return;
      }
      const addBtn = e.target.closest(".product-card__add");
      if (addBtn) {
        const relatedId = Number(addBtn.dataset.productId);
        addToCart({ productId: relatedId, quantity: 1 }); // js/store/cart-store.js
        const original = addBtn.textContent;
        addBtn.textContent = "Added ✓";
        setTimeout(() => (addBtn.textContent = original), 1200);
      }
    });
  }
}

function updateActiveTabUI() {
  document.querySelectorAll(".pd-tabs__btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === pdState.activeTab);
  });
  document.querySelectorAll(".pd-tabs__panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `pd-tab-${pdState.activeTab}`);
  });
}

/* "Add to cart" validates that a color/size have been picked when the
   product actually offers more than one option - can't add "a shirt" to
   the cart, only "a shirt, size M, navy". */
function handleAddToCart() {
  const validationEl = document.getElementById("pd-validation");

  if (product.colors.length > 1 && !pdState.selectedColor) {
    validationEl.textContent = "Please select a color.";
    return;
  }
  if (product.sizes.length > 1 && !pdState.selectedSize) {
    validationEl.textContent = "Please select a size.";
    return;
  }

  validationEl.textContent = "";

  addToCart({
    productId: product.id,
    size: pdState.selectedSize,
    color: pdState.selectedColor,
    quantity: pdState.quantity,
  }); // js/store/cart-store.js

  const btn = document.getElementById("pd-add-to-cart");
  const original = btn.textContent;
  btn.textContent = "Added ✓";
  setTimeout(() => (btn.textContent = original), 1200);
}
