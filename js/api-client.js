/* ==========================================================================
   API-CLIENT.JS
   ------------------------------------------------------------------------
   Talks to the real backend (server/, see server/README.md) for product
   data. This is the first piece of the frontend to move off the static
   js/data/products.js file and onto a real database.

   HOW IT FAILS SAFE:
   If the API can't be reached (backend not running, this is a static
   deploy with no backend yet, request times out, etc.), the site does
   NOT break — it keeps using PRODUCTS_FALLBACK from js/data/products.js,
   exactly like it always has. Nothing here should ever throw past this
   file.

   WHAT IT SETS:
     window.PRODUCTS        - starts as the fallback array (set by
                               js/data/products.js, loaded just before
                               this file), then gets overwritten in place
                               with live data if/when the API responds.
                               Any code that just reads window.PRODUCTS
                               (cart-store.js, wishlist.js) automatically
                               benefits from live data once it's in,
                               with zero changes needed on their part.
     window.PRODUCTS_READY  - a Promise that ALWAYS resolves (never
                               rejects) with the product array to use.
                               Pages that need to guarantee they're
                               showing live data before their first
                               render (products.js, product-details.js)
                               `await` this before doing anything else.

   CONFIGURING THE API URL:
   Defaults to the local dev backend. Override by setting
   `window.THREADCO_API_BASE = "https://your-deployed-api.example.com/api"`
   in a small inline <script> before this file loads, once the backend
   has a real deployment.
   ========================================================================== */

(() => {
  const API_BASE = window.THREADCO_API_BASE || "http://localhost:4000/api";
  const FETCH_TIMEOUT_MS = 4000;

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`API request timed out after ${ms}ms`)), ms)
      ),
    ]);
  }

  async function fetchAllProducts() {
    // The catalogue is only 20 products today; ask for up to 200 so the
    // existing client-side filter/sort/search logic in js/products.js
    // keeps working against the FULL list, completely unchanged — it
    // has no idea whether the array it's filtering came from the network
    // or from js/data/products.js.
    const res = await withTimeout(fetch(`${API_BASE}/products?limit=200`), FETCH_TIMEOUT_MS);
    if (!res.ok) {
      throw new Error(`API responded with ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!Array.isArray(data.products)) {
      throw new Error("API response did not include a products array");
    }
    return data.products;
  }

  window.PRODUCTS_READY = fetchAllProducts()
    .then((liveProducts) => {
      window.PRODUCTS = liveProducts;
      console.info(`[api-client] Loaded ${liveProducts.length} products from the API.`);
      return liveProducts;
    })
    .catch((err) => {
      console.warn(
        `[api-client] Could not reach the products API, using bundled data instead. ` +
        `(${err.message}) See server/README.md to run the backend locally.`
      );
      return window.PRODUCTS; // still the fallback array set by js/data/products.js
    });
})();
