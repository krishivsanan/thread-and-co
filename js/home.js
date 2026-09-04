/* ==========================================================================
   HOME.JS
   ------------------------------------------------------------------------
   JavaScript that ONLY runs on index.html. Loaded AFTER js/main.js in the
   HTML <script> order, so the shared behavior (mobile menu, newsletter)
   is already set up by the time this file runs.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNewArrivalsScroller();
  initCountdown();
  initWishlistButtons();
  initAddToCartButtons();
});

/* ------------------------------------------------------------------------
   1. NEW ARRIVALS HORIZONTAL SCROLLER
   The "New Arrivals" section scrolls sideways (see .scroller__track in
   home.css, which has overflow-x: auto). These left/right buttons just
   nudge that scroll position instead of making the user drag manually.
   ------------------------------------------------------------------------ */
function initNewArrivalsScroller() {
  const track = document.querySelector(".scroller__track");
  const prevBtn = document.querySelector("[data-scroll='prev']");
  const nextBtn = document.querySelector("[data-scroll='next']");

  if (!track || !prevBtn || !nextBtn) return;

  // Scroll by roughly "one card's width" each click.
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
   Purely visual for the demo: counts down to a fixed target date/time so
   the "limited time offer" banner feels alive. Later, Module 5 (Checkout
   & Coupons) can swap FIXED_TARGET_DATE for a real expiry date that comes
   from the coupon data in the database.
   ------------------------------------------------------------------------ */
function initCountdown() {
  const countdownEl = document.querySelector(".countdown");
  if (!countdownEl) return;

  const hoursEl = countdownEl.querySelector("[data-unit='hours']");
  const minutesEl = countdownEl.querySelector("[data-unit='minutes']");
  const secondsEl = countdownEl.querySelector("[data-unit='seconds']");

  // Demo target: 48 hours from the moment the page loads.
  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 48);

  function updateCountdown() {
    const now = new Date();
    let diffInSeconds = Math.max(0, Math.floor((targetDate - now) / 1000));

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    // padStart(2, "0") turns 5 into "05" so the digits don't jump around.
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown(); // run once immediately so there's no 1-second blank flash
  setInterval(updateCountdown, 1000); // then keep updating every second
}

/* ------------------------------------------------------------------------
   3. WISHLIST HEART BUTTONS ON PRODUCT CARDS
   Toggles the wishlist via js/store/cart-store.js (localStorage-backed)
   and reflects that in the heart icon. Each button carries the
   product's id in data-product-id.
   ------------------------------------------------------------------------ */
function initWishlistButtons() {
  const wishlistButtons = document.querySelectorAll(".product-card__wishlist");

  wishlistButtons.forEach((button) => {
    const productId = Number(button.dataset.productId);

    // These cards are hard-coded HTML (not built by createProductCardHTML
    // like the catalogue/related-products grids are), so their initial
    // "is this already wishlisted?" state has to be set here on load
    // instead of at render time.
    if (isInWishlist(productId)) {
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
    }

    button.addEventListener("click", () => {
      const isNowActive = toggleWishlist(productId); // js/store/cart-store.js
      button.classList.toggle("is-active", isNowActive);
      button.setAttribute("aria-pressed", isNowActive ? "true" : "false");
    });
  });
}

/* ------------------------------------------------------------------------
   4. "ADD TO CART" BUTTONS ON PRODUCT CARDS
   Adds the product to the cart via js/store/cart-store.js and gives
   quick visual feedback on the button itself.
   ------------------------------------------------------------------------ */
function initAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll(".product-card__add");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.productId);
      const originalText = button.textContent;

      addToCart({ productId, quantity: 1 }); // js/store/cart-store.js
      button.textContent = "Added ✓";

      // Reset the button label after a moment so it can be clicked again.
      setTimeout(() => {
        button.textContent = originalText;
      }, 1200);
    });
  });
}
