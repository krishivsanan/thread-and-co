/* ==========================================================================
   PRODUCTS.JS
   ------------------------------------------------------------------------
   Drives the Products (catalogue) page: builds the filter sidebar FROM
   the product data, listens for filter/sort/search changes, and
   re-renders the product grid to match.

   Loaded after js/data/products.js, so the PRODUCTS array and
   COLOR_SWATCHES object are already available as global constants here.

   HOW THIS FILE IS ORGANISED (read top to bottom):
     1. STATE          - one object holding every active filter/sort/search
     2. INIT            - runs once on page load, wires everything together
     3. BUILD FILTERS   - generates checkboxes/chips/swatches from PRODUCTS
     4. APPLY FILTERS   - takes the state + PRODUCTS and returns a filtered,
                          sorted list
     5. RENDER          - turns that list into HTML on the page
     6. EVENTS          - click/change handlers that update state then
                          call APPLY FILTERS + RENDER again
   ========================================================================== */

/* ------------------------------------------------------------------------
   1. STATE
   A single object that remembers every filter the user has turned on.
   Every function below reads from this object; nothing else holds its
   own separate copy of "what's currently filtered" - that's what keeps
   the filters, the chips, and the grid all in sync with each other.
   ------------------------------------------------------------------------ */
const state = {
  search: "",           // text typed into the search box
  categories: new Set(), // e.g. {"men", "shoes"}
  brands: new Set(),
  priceRanges: new Set(), // e.g. {"under-50", "50-100"}
  sizes: new Set(),
  colors: new Set(),
  minRating: 0,          // 0 = "any rating", or 3 / 4
  sort: "featured",
};

// Human-readable labels for category values stored in the product data
const CATEGORY_LABELS = {
  men: "Men",
  women: "Women",
  shoes: "Shoes",
  accessories: "Accessories",
};

// Fixed price brackets for the "Price" filter group (kept simple - no
// slider control needed since this course hasn't covered that yet)
const PRICE_RANGES = [
  { id: "under-50", label: "Under $50", test: (p) => p < 50 },
  { id: "50-100", label: "$50 - $100", test: (p) => p >= 50 && p <= 100 },
  { id: "100-200", label: "$100 - $200", test: (p) => p > 100 && p <= 200 },
  { id: "over-200", label: "Over $200", test: (p) => p > 200 },
];

/* ------------------------------------------------------------------------
   2. INIT
   ------------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  readFiltersFromURL();   // e.g. products.html?category=men from the navbar
  buildFilterSidebar();   // generate checkboxes/chips/swatches from PRODUCTS
  attachStaticListeners(); // sort dropdown, search box, clear button, mobile drawer
  renderPage();            // first paint
});

/* Reads ?category= and ?q= from the page's URL so links like
   "products.html?category=shoes" (from the navbar) arrive pre-filtered. */
function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  const category = params.get("category");
  if (category && CATEGORY_LABELS[category]) {
    state.categories.add(category);
  }

  const query = params.get("q");
  if (query) {
    state.search = query;
  }
}

/* ------------------------------------------------------------------------
   3. BUILD FILTERS
   Instead of hand-typing every brand/size/color checkbox into the HTML,
   we generate them from PRODUCTS. This means adding a new product with a
   new brand automatically gets a filter option - nobody has to remember
   to update the sidebar by hand.
   ------------------------------------------------------------------------ */
function buildFilterSidebar() {
  buildCategoryFilters();
  buildPriceFilters();
  buildSizeFilters();
  buildColorFilters();
  buildBrandFilters();
  // Search box + rating radios already exist as static HTML in
  // products.html (they don't need to be generated), but we still need
  // to reflect the ?q= value read from the URL into the search input:
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = state.search;
}

/* Small helper: how many products currently match a given test function,
   used to show counts like "Men (5)" next to each filter option. */
function countMatching(testFn) {
  return PRODUCTS.filter(testFn).length;
}

function buildCategoryFilters() {
  const container = document.getElementById("filter-category");
  if (!container) return;

  // Set removes duplicates automatically, so even though 20 products
  // exist we still only get 4 unique category names.
  const uniqueCategories = [...new Set(PRODUCTS.map((p) => p.category))];

  container.innerHTML = uniqueCategories
    .map((cat) => {
      const count = countMatching((p) => p.category === cat);
      const checked = state.categories.has(cat) ? "checked" : "";
      return `
        <label class="filter-option">
          <input type="checkbox" data-filter="category" value="${cat}" ${checked} />
          <span>${CATEGORY_LABELS[cat] || cat}</span>
          <span class="count">${count}</span>
        </label>`;
    })
    .join("");
}

function buildPriceFilters() {
  const container = document.getElementById("filter-price");
  if (!container) return;

  container.innerHTML = PRICE_RANGES.map((range) => {
    const count = countMatching((p) => range.test(p.price));
    const checked = state.priceRanges.has(range.id) ? "checked" : "";
    return `
      <label class="filter-option">
        <input type="checkbox" data-filter="price" value="${range.id}" ${checked} />
        <span>${range.label}</span>
        <span class="count">${count}</span>
      </label>`;
  }).join("");
}

function buildSizeFilters() {
  const container = document.getElementById("filter-size");
  if (!container) return;

  // .flatMap flattens every product's sizes array into one big list, then
  // Set removes the duplicates - "M" only needs to appear once even
  // though a dozen products all have an "M" size.
  const uniqueSizes = [...new Set(PRODUCTS.flatMap((p) => p.sizes))];

  container.innerHTML = uniqueSizes
    .map((size) => {
      const isSelected = state.sizes.has(size) ? "is-selected" : "";
      return `<button type="button" class="size-chip ${isSelected}" data-filter="size" data-value="${size}">${size}</button>`;
    })
    .join("");
}

function buildColorFilters() {
  const container = document.getElementById("filter-color");
  if (!container) return;

  const uniqueColors = [...new Set(PRODUCTS.flatMap((p) => p.colors))];

  container.innerHTML = uniqueColors
    .map((color) => {
      const isSelected = state.colors.has(color) ? "is-selected" : "";
      const hex = COLOR_SWATCHES[color] || "#ccc";
      return `<button type="button" class="color-swatch ${isSelected}" style="background-color:${hex};" data-filter="color" data-value="${color}" aria-label="${color}" title="${color}"></button>`;
    })
    .join("");
}

function buildBrandFilters() {
  const container = document.getElementById("filter-brand");
  if (!container) return;

  const uniqueBrands = [...new Set(PRODUCTS.map((p) => p.brand))].sort();

  container.innerHTML = uniqueBrands
    .map((brand) => {
      const count = countMatching((p) => p.brand === brand);
      const checked = state.brands.has(brand) ? "checked" : "";
      return `
        <label class="filter-option">
          <input type="checkbox" data-filter="brand" value="${brand}" ${checked} />
          <span>${brand}</span>
          <span class="count">${count}</span>
        </label>`;
    })
    .join("");
}

/* ------------------------------------------------------------------------
   4. APPLY FILTERS
   Pure logic, no DOM here: take PRODUCTS + the current state, return the
   filtered and sorted list that should be on screen.
   ------------------------------------------------------------------------ */
function getVisibleProducts() {
  let results = PRODUCTS.filter((product) => {
    // --- text search: match against name OR brand ---
    if (state.search) {
      const needle = state.search.toLowerCase();
      const haystack = `${product.name} ${product.brand}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    // --- category ---
    if (state.categories.size > 0 && !state.categories.has(product.category)) {
      return false;
    }

    // --- brand ---
    if (state.brands.size > 0 && !state.brands.has(product.brand)) {
      return false;
    }

    // --- price range: product must fall in AT LEAST ONE checked bracket ---
    if (state.priceRanges.size > 0) {
      const matchesAnyRange = [...state.priceRanges].some((rangeId) => {
        const range = PRICE_RANGES.find((r) => r.id === rangeId);
        return range && range.test(product.price);
      });
      if (!matchesAnyRange) return false;
    }

    // --- size: product must have AT LEAST ONE of the checked sizes ---
    if (state.sizes.size > 0) {
      const hasMatchingSize = product.sizes.some((s) => state.sizes.has(s));
      if (!hasMatchingSize) return false;
    }

    // --- color: same idea as size ---
    if (state.colors.size > 0) {
      const hasMatchingColor = product.colors.some((c) => state.colors.has(c));
      if (!hasMatchingColor) return false;
    }

    // --- rating ---
    if (state.minRating > 0 && product.rating < state.minRating) {
      return false;
    }

    return true; // product survived every active filter
  });

  results = sortProducts(results);
  return results;
}

function sortProducts(products) {
  // .slice() copies the array first so we never mutate/reorder the
  // original PRODUCTS array while sorting.
  const sorted = products.slice();

  switch (state.sort) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    case "featured":
    default:
      return sorted; // keep the original catalogue order
  }
}

/* ------------------------------------------------------------------------
   5. RENDER
   ------------------------------------------------------------------------ */
function renderPage() {
  const products = getVisibleProducts();
  renderResultCount(products.length);
  renderActiveFilterChips();
  renderGrid(products);
  // Filter option counts (the little numbers next to each checkbox) and
  // selected states can change as filters combine, so rebuild the
  // sidebar options every time too.
  buildFilterSidebar();
}

function renderResultCount(count) {
  const el = document.getElementById("result-count");
  if (el) el.textContent = `${count} product${count === 1 ? "" : "s"}`;
}

function renderGrid(products) {
  const grid = document.getElementById("product-grid");
  const emptyState = document.getElementById("empty-state");
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = "";
    grid.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  grid.hidden = false;
  grid.innerHTML = products.map(createProductCardHTML).join("");
}

/* Builds one product card's HTML. Same markup/classes as the cards on
   the homepage (see index.html + css/components.css) so they look
   identical everywhere they appear. */
/* createProductCardHTML(product) now lives in js/shared/product-card.js
   so the Products page and the Product Details page's "Related
   Products" strip both build cards from the exact same function. That
   file is loaded via <script> before this one - see products.html. */

/* Little removable "pills" shown above the grid summarising active
   filters, e.g. [Men ×] [Under $50 ×] - lets the user see + undo
   filters without opening the sidebar again. */
function renderActiveFilterChips() {
  const container = document.getElementById("active-filters");
  if (!container) return;

  const chips = [];

  state.categories.forEach((v) => chips.push({ group: "category", value: v, label: CATEGORY_LABELS[v] || v }));
  state.brands.forEach((v) => chips.push({ group: "brand", value: v, label: v }));
  state.priceRanges.forEach((v) => {
    const range = PRICE_RANGES.find((r) => r.id === v);
    chips.push({ group: "price", value: v, label: range ? range.label : v });
  });
  state.sizes.forEach((v) => chips.push({ group: "size", value: v, label: `Size ${v}` }));
  state.colors.forEach((v) => chips.push({ group: "color", value: v, label: v }));
  if (state.minRating > 0) chips.push({ group: "rating", value: state.minRating, label: `${state.minRating}★ & up` });

  container.innerHTML = chips
    .map(
      (chip) => `
      <span class="active-filter-chip">
        ${chip.label}
        <button type="button" data-remove-group="${chip.group}" data-remove-value="${chip.value}" aria-label="Remove filter">&times;</button>
      </span>`
    )
    .join("");
}

/* ------------------------------------------------------------------------
   6. EVENTS
   ------------------------------------------------------------------------ */
function attachStaticListeners() {
  // ---- Search box (own input on this page, separate from the navbar one) ----
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderPage();
    });
  }

  // ---- Sort dropdown ----
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderPage();
    });
  }

  // ---- Rating radio buttons ----
  document.querySelectorAll("input[name='rating']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.minRating = Number(e.target.value);
      renderPage();
    });
  });

  // ---- Clear all filters ----
  const clearBtn = document.getElementById("clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.search = "";
      state.categories.clear();
      state.brands.clear();
      state.priceRanges.clear();
      state.sizes.clear();
      state.colors.clear();
      state.minRating = 0;
      if (searchInput) searchInput.value = "";
      document.querySelectorAll("input[name='rating'][value='0']").forEach((r) => (r.checked = true));
      renderPage();
    });
  }

  // ---- Removing one chip from the "active filters" row ----
  const activeFiltersContainer = document.getElementById("active-filters");
  if (activeFiltersContainer) {
    activeFiltersContainer.addEventListener("click", (e) => {
      const button = e.target.closest("[data-remove-group]");
      if (!button) return;
      removeFilter(button.dataset.removeGroup, button.dataset.removeValue);
      renderPage();
    });
  }

  // ---- Checkbox filters (Category, Brand, Price) - event delegation ----
  // Rather than adding a listener to every single checkbox (which would
  // have to be redone every time buildFilterSidebar() regenerates them),
  // we listen once on the whole sidebar and check WHAT was clicked.
  const filtersPanel = document.getElementById("filters-panel");
  if (filtersPanel) {
    filtersPanel.addEventListener("change", (e) => {
      const input = e.target;
      const filterType = input.dataset.filter;
      if (!filterType) return;

      const targetSet = {
        category: state.categories,
        brand: state.brands,
        price: state.priceRanges,
      }[filterType];

      if (!targetSet) return;

      if (input.checked) {
        targetSet.add(input.value);
      } else {
        targetSet.delete(input.value);
      }
      renderPage();
    });

    // ---- Size chips + color swatches (buttons, not checkboxes) ----
    filtersPanel.addEventListener("click", (e) => {
      const button = e.target.closest("[data-filter='size'], [data-filter='color']");
      if (!button) return;

      const targetSet = button.dataset.filter === "size" ? state.sizes : state.colors;
      const value = button.dataset.value;

      if (targetSet.has(value)) {
        targetSet.delete(value);
      } else {
        targetSet.add(value);
      }
      renderPage();
    });
  }

  // ---- Product grid: wishlist + add-to-cart buttons (event delegation
  // again, because renderGrid() rebuilds these buttons every render) ----
  const grid = document.getElementById("product-grid");
  if (grid) {
    grid.addEventListener("click", (e) => {
      const wishlistBtn = e.target.closest(".product-card__wishlist");
      if (wishlistBtn) {
        const productId = Number(wishlistBtn.dataset.productId);
        const isActive = toggleWishlist(productId); // js/store/cart-store.js
        wishlistBtn.classList.toggle("is-active", isActive);
        wishlistBtn.setAttribute("aria-pressed", isActive ? "true" : "false");
        return;
      }

      const addToCartBtn = e.target.closest(".product-card__add");
      if (addToCartBtn) {
        const productId = Number(addToCartBtn.dataset.productId);
        // The catalogue grid has no size/color selector (that lives on
        // the product details page), so a quick "add" from here uses
        // no size/color - addToCart's isSameLine() still merges it
        // correctly with any other size/color-less line for this
        // product already in the cart.
        addToCart({ productId, quantity: 1 }); // js/store/cart-store.js

        const originalText = addToCartBtn.textContent;
        addToCartBtn.textContent = "Added ✓";
        setTimeout(() => (addToCartBtn.textContent = originalText), 1200);
      }
    });
  }

  // ---- Mobile "Filters" drawer open/close ----
  const filterToggle = document.getElementById("filter-toggle");
  const filtersBackdrop = document.getElementById("filters-backdrop");
  if (filterToggle) {
    filterToggle.addEventListener("click", () => document.body.classList.add("filters-open"));
  }
  if (filtersBackdrop) {
    filtersBackdrop.addEventListener("click", () => document.body.classList.remove("filters-open"));
  }
  const closeFiltersBtn = document.getElementById("close-filters");
  if (closeFiltersBtn) {
    closeFiltersBtn.addEventListener("click", () => document.body.classList.remove("filters-open"));
  }
}

/* Removes one single filter value - used by the "×" on an active filter chip. */
function removeFilter(group, value) {
  if (group === "rating") {
    state.minRating = 0;
    document.querySelectorAll("input[name='rating'][value='0']").forEach((r) => (r.checked = true));
    return;
  }

  const targetSet = {
    category: state.categories,
    brand: state.brands,
    price: state.priceRanges,
    size: state.sizes,
    color: state.colors,
  }[group];

  if (targetSet) targetSet.delete(value);
}
