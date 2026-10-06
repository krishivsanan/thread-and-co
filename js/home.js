/* ==========================================================================
   HOME.JS
   ------------------------------------------------------------------------
   JavaScript that ONLY runs on index.html. Loaded AFTER js/main.js in the
   HTML <script> order, so the shared behavior (mobile menu, newsletter)
   is already set up by the time this file runs.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  initNewArrivalsScroller();
  initCountdown();

  if (window.PRODUCTS_READY) {
    await window.PRODUCTS_READY;
  }

  renderFeaturedProducts();
  renderNewArrivals();
  initDelegatedProductActions();
});

// Sync hearts if wishlist changes elsewhere
window.addEventListener("wishlist:updated", updateHomepageWishlistHearts);

/* ------------------------------------------------------------------------
   1. NEW ARRIVALS HORIZONTAL SCROLLER
   ------------------------------------------------------------------------ */
function initNewArrivalsScroller() {
  const track = document.querySelector(".scroller__track");
  const prevBtn = document.querySelector("[data-scroll='prev']");
  const nextBtn = document.querySelector("[data-scroll='next']");

  if (!track || !prevBtn || !nextBtn) return;

  const SCROLL_AMOUNT = 280;

  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  });
}

/* ------------------------------------------------------------------------
   2. OFFER COUNTDOWN TIMER
   ------------------------------------------------------------------------ */
function initCountdown() {
  const countdownEl = document.querySelector(".countdown");
  if (!countdownEl) return;

  const hoursEl = countdownEl.querySelector("[data-unit='hours']");
  const minutesEl = countdownEl.querySelector("[data-unit='minutes']");
  const secondsEl = countdownEl.querySelector("[data-unit='seconds']");

  if (!hoursEl || !minutesEl || !secondsEl) return;

  const COUNTDOWN_KEY = "threadco_sale_end";
  let targetTime = Number(localStorage.getItem(COUNTDOWN_KEY));

  if (!targetTime || targetTime <= Date.now()) {
    targetTime = Date.now() + 48 * 60 * 60 * 1000;
    localStorage.setItem(COUNTDOWN_KEY, String(targetTime));
  }

  function updateCountdown() {
    const difference = Math.max(0, targetTime - Date.now());
    let totalSeconds = Math.floor(difference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");

    if (difference <= 0) {
      clearInterval(timer);
    }
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
}

/* ------------------------------------------------------------------------
   3. DYNAMIC PRODUCTS RENDERING
   ------------------------------------------------------------------------ */
function renderFeaturedProducts() {
  const container = document.getElementById("featured-grid");
  if (!container || typeof createProductCardHTML !== "function") return;

  const products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  if (products.length === 0) return;

  // Curate 4 featured items (prioritize high ratings and distinct categories)
  const featured = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  container.innerHTML = featured.map(createProductCardHTML).join("");
}

function renderNewArrivals() {
  const track = document.getElementById("new-arrivals-track") || document.querySelector(".scroller__track");
  if (!track || typeof createProductCardHTML !== "function") return;

  const products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  if (products.length === 0) return;

  // New arrivals: items marked isNew, or sorted by dateAdded descending
  const newArrivals = products
    .filter((p) => p.isNew)
    .concat(products.filter((p) => !p.isNew))
    .slice(0, 6);

  track.innerHTML = newArrivals.map(createProductCardHTML).join("");
}

/* ------------------------------------------------------------------------
   4. DELEGATED EVENT HANDLERS (Wishlist & Add to Cart)
   ------------------------------------------------------------------------ */
function initDelegatedProductActions() {
  document.addEventListener("click", (event) => {
    // 1. Wishlist toggle
    const wishlistBtn = event.target.closest(".product-card__wishlist");
    if (wishlistBtn) {
      const productId = Number(wishlistBtn.dataset.productId);
      if (!productId || typeof toggleWishlist !== "function") return;

      const isNowActive = toggleWishlist(productId);
      syncWishlistButtons(productId, isNowActive);
      return;
    }

    // 2. Add to cart
    const addBtn = event.target.closest(".product-card__add");
    if (addBtn) {
      const productId = Number(addBtn.dataset.productId);
      if (!productId || typeof addToCart !== "function") return;

      addToCart({ productId, quantity: 1 });
      const originalText = addBtn.textContent;
      addBtn.textContent = "Added ✓";
      setTimeout(() => {
        addBtn.textContent = originalText;
      }, 1200);
    }
  });
}

function syncWishlistButtons(productId, isActive) {
  document.querySelectorAll(`.product-card__wishlist[data-product-id="${productId}"]`).forEach((btn) => {
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function updateHomepageWishlistHearts() {
  if (typeof isInWishlist !== "function") return;
  document.querySelectorAll(".product-card__wishlist").forEach((btn) => {
    const productId = Number(btn.dataset.productId);
    if (!productId) return;
    const active = isInWishlist(productId);
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}
