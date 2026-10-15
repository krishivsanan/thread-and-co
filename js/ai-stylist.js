/* ==========================================================================
   AI-STYLIST.JS
   --------------------------------------------------------------------------
   Stage 1:
   - Creates the floating AI Stylist button
   - Creates the stylist panel
   - Handles open / close
   - Handles starter prompts
   - Handles a small demo conversation

   IMPORTANT:
   This is NOT connected to an LLM yet.
   Stage 2 will replace the demo response with the real AI logic.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initAIStylist();
});


/* ==========================================================================
   MAIN INITIALIZER
   ========================================================================== */

function initAIStylist() {

  /*
   * Prevent duplicate initialization.
   * This keeps the widget safe if the script is accidentally loaded twice.
   */
  if (document.querySelector(".ai-stylist-trigger")) {
    return;
  }

  createAIStylistUI();
  bindAIStylistEvents();
}


/* ==========================================================================
   CREATE UI
   ========================================================================== */

function createAIStylistUI() {

  /* ---------- Floating button ---------- */

  const trigger = document.createElement("button");

  trigger.type = "button";
  trigger.className = "ai-stylist-trigger";
  trigger.setAttribute("aria-label", "Open AI Stylist");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "ai-stylist-panel");

  trigger.innerHTML = `
    <span class="ai-stylist-trigger__icon" aria-hidden="true">✦</span>
    <span>AI Stylist</span>
  `;


  /* ---------- Overlay ---------- */

  const overlay = document.createElement("div");

  overlay.className = "ai-stylist-overlay";
  overlay.setAttribute("aria-hidden", "true");


  /* ---------- Panel ---------- */

  const panel = document.createElement("aside");

  panel.id = "ai-stylist-panel";
  panel.className = "ai-stylist-panel";

  panel.setAttribute("aria-label", "AI Stylist");
  panel.setAttribute("aria-hidden", "true");

  panel.innerHTML = `
    
    <header class="ai-stylist-header">

      <div class="ai-stylist-header__identity">

        <div class="ai-stylist-header__icon" aria-hidden="true">
          ✦
        </div>

        <div class="ai-stylist-header__text">

          <span class="ai-stylist-header__label">
            Thread & Co.
          </span>

          <span class="ai-stylist-header__name">
            AI Stylist
          </span>

        </div>

      </div>


      <button
        type="button"
        class="ai-stylist-close"
        aria-label="Close AI Stylist"
      >
        ×
      </button>

    </header>


    <div
      class="ai-stylist-chat"
      id="ai-stylist-chat"
      aria-live="polite"
    >

      <div class="ai-stylist-message ai-stylist-message--ai">

        <div class="ai-stylist-message__bubble">
          Hi! I'm your Thread & Co. stylist.
          Tell me what you're dressing for, and I'll help you find a look.
        </div>

      </div>


      <div class="ai-stylist-prompts">

        <button
          type="button"
          class="ai-stylist-prompt"
          data-prompt="I have a wedding to attend"
        >
          Wedding
        </button>

        <button
          type="button"
          class="ai-stylist-prompt"
          data-prompt="I need an outfit for a party"
        >
          Party
        </button>

        <button
          type="button"
          class="ai-stylist-prompt"
          data-prompt="I want a casual everyday outfit"
        >
          Casual
        </button>

        <button
          type="button"
          class="ai-stylist-prompt"
          data-prompt="I need help choosing an outfit"
        >
          Help me choose
        </button>

      </div>


      <div class="ai-stylist-status">

        <span
          class="ai-stylist-status__dot"
          aria-hidden="true"
        ></span>

        <span>
          Ready to style
        </span>

      </div>

    </div>


    <div class="ai-stylist-input-area">

      <form class="ai-stylist-form">

        <label
          for="ai-stylist-input"
          class="visually-hidden"
        >
          Tell the AI Stylist what you need
        </label>

        <input
          type="text"
          id="ai-stylist-input"
          class="ai-stylist-input"
          placeholder="Tell me what you're dressing for..."
          autocomplete="off"
        />

        <button
          type="submit"
          class="ai-stylist-send"
          aria-label="Send message"
        >
          →
        </button>

      </form>

    </div>
  `;


  /* ---------- Add everything to page ---------- */

  document.body.appendChild(trigger);
  document.body.appendChild(overlay);
  document.body.appendChild(panel);
}


/* ==========================================================================
   EVENTS
   ========================================================================== */

function bindAIStylistEvents() {

  const trigger = document.querySelector(".ai-stylist-trigger");
  const overlay = document.querySelector(".ai-stylist-overlay");
  const panel = document.querySelector(".ai-stylist-panel");
  const closeButton = document.querySelector(".ai-stylist-close");
  const form = document.querySelector(".ai-stylist-form");
  const input = document.querySelector(".ai-stylist-input");

  if (!trigger || !overlay || !panel || !closeButton || !form || !input) {
    return;
  }


  /* ---------- Open ---------- */

  trigger.addEventListener("click", () => {
    openAIStylist();
  });


  /* ---------- Close button ---------- */

  closeButton.addEventListener("click", () => {
    closeAIStylist();
  });


  /* ---------- Overlay ---------- */

  overlay.addEventListener("click", () => {
    closeAIStylist();
  });


  /* ---------- Escape key ---------- */

  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
      closeAIStylist();
    }

  });


  /* ---------- Starter prompts ---------- */

  document.querySelectorAll(".ai-stylist-prompt").forEach((button) => {

    button.addEventListener("click", () => {

      const prompt = button.dataset.prompt;

      if (!prompt) {
        return;
      }

      addUserMessage(prompt);

      input.value = "";

      fetchStylistResponse(prompt);

    });

  });


  /* ---------- Input form ---------- */

  form.addEventListener("submit", (event) => {

    event.preventDefault();

    const message = input.value.trim();

    if (!message) {
      input.focus();
      return;
    }

    addUserMessage(message);

    input.value = "";

    fetchStylistResponse(message);

  });
}


/* ==========================================================================
   OPEN
   ========================================================================== */

function openAIStylist() {

  const trigger = document.querySelector(".ai-stylist-trigger");
  const panel = document.querySelector(".ai-stylist-panel");
  const input = document.querySelector(".ai-stylist-input");

  if (!trigger || !panel) {
    return;
  }

  document.body.classList.add("ai-stylist-open");

  trigger.setAttribute("aria-expanded", "true");

  panel.setAttribute("aria-hidden", "false");

  /*
   * Give the browser a moment to open the panel
   * before moving focus to the input.
   */
  setTimeout(() => {

    if (input) {
      input.focus();
    }

  }, 250);
}


/* ==========================================================================
   CLOSE
   ========================================================================== */

function closeAIStylist() {

  const trigger = document.querySelector(".ai-stylist-trigger");
  const panel = document.querySelector(".ai-stylist-panel");

  if (!trigger || !panel) {
    return;
  }

  document.body.classList.remove("ai-stylist-open");

  trigger.setAttribute("aria-expanded", "false");

  panel.setAttribute("aria-hidden", "true");

  trigger.focus();
}


/* ==========================================================================
   ADD USER MESSAGE
   ========================================================================== */

function addUserMessage(message) {

  const chat = document.querySelector("#ai-stylist-chat");

  if (!chat) {
    return;
  }

  const messageElement = document.createElement("div");

  messageElement.className =
    "ai-stylist-message ai-stylist-message--user";

  const bubble = document.createElement("div");

  bubble.className = "ai-stylist-message__bubble";

  /*
   * textContent is intentionally used instead of innerHTML.
   * This prevents user-entered text from being interpreted as HTML.
   */
  bubble.textContent = message;

  messageElement.appendChild(bubble);

  chat.appendChild(messageElement);

  scrollAIStylistChat();
}


/* ==========================================================================
   AI STYLIST BACKEND INTEGRATION (STAGE 2)
   --------------------------------------------------------------------------
   Communicates with POST /api/stylist (powered by Gemini AI) and renders
   tailored styling advice along with real interactive product recommendation
   cards with "View" and "Add to Cart" actions.
   ========================================================================== */

const STYLIST_API_BASE = (window.THREADCO_API_BASE || "http://localhost:4000/api").replace(/\/$/, "");
let stylistHistory = [];

async function fetchStylistResponse(message) {
  const chat = document.querySelector("#ai-stylist-chat");
  if (!chat) return;

  // Render typing / thinking indicator
  const loadingElement = document.createElement("div");
  loadingElement.className = "ai-stylist-message ai-stylist-message--ai ai-stylist-message--loading";
  loadingElement.innerHTML = `
    <div class="ai-stylist-typing" aria-label="Stylist is thinking">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  chat.appendChild(loadingElement);
  scrollAIStylistChat();

  try {
    const response = await fetch(`${STYLIST_API_BASE}/stylist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: stylistHistory,
      }),
    });

    loadingElement.remove();

    if (!response.ok) {
      throw new Error(`Stylist server error: ${response.statusText}`);
    }

    const data = await response.json();
    const replyText = data.reply || "Here are pieces from our store that fit your style:";
    const products = Array.isArray(data.products) ? data.products : [];

    // Save to conversation history (keep last 6 turns)
    stylistHistory.push(
      { role: "user", content: message },
      { role: "model", content: replyText }
    );
    if (stylistHistory.length > 8) {
      stylistHistory = stylistHistory.slice(-8);
    }

    // Render AI conversational advice bubble
    const responseElement = document.createElement("div");
    responseElement.className = "ai-stylist-message ai-stylist-message--ai";
    const bubble = document.createElement("div");
    bubble.className = "ai-stylist-message__bubble";
    bubble.textContent = replyText;
    responseElement.appendChild(bubble);
    chat.appendChild(responseElement);

    // Render interactive product recommendation cards if available
    if (products.length > 0) {
      const cardsContainer = document.createElement("div");
      cardsContainer.className = "ai-stylist-cards";

      products.forEach((product) => {
        const card = createRecommendationCard(product);
        cardsContainer.appendChild(card);
      });

      chat.appendChild(cardsContainer);
    }

    scrollAIStylistChat();
  } catch (err) {
    console.error("AI Stylist request error:", err);
    loadingElement.remove();

    const errorElement = document.createElement("div");
    errorElement.className = "ai-stylist-message ai-stylist-message--ai";
    const bubble = document.createElement("div");
    bubble.className = "ai-stylist-message__bubble";
    bubble.textContent = "I'm having a little trouble connecting to the styling engine right now. Please try again in a moment, or explore our collections directly!";
    errorElement.appendChild(bubble);
    chat.appendChild(errorElement);
    scrollAIStylistChat();
  }
}

function createRecommendationCard(product) {
  const card = document.createElement("div");
  card.className = "ai-stylist-card";

  const photo = product.photo_url || product.photoUrl || `assets/images/products/${product.id}.jpg`;
  const name = product.name || "Curated Item";
  const price = Number(product.price || 0).toFixed(2);
  const category = (product.category || "").toUpperCase();

  card.innerHTML = `
    <div class="ai-stylist-card__media">
      <img src="${photo}" alt="${name}" class="ai-stylist-card__img" onerror="this.src='assets/images/products/1.jpg'" />
      ${category ? `<span class="ai-stylist-card__tag">${category}</span>` : ""}
    </div>
    <div class="ai-stylist-card__content">
      <h4 class="ai-stylist-card__name">${name}</h4>
      <span class="ai-stylist-card__price">$${price}</span>
      <div class="ai-stylist-card__actions">
        <a href="product-details.html?id=${product.id}" class="ai-stylist-card__btn ai-stylist-card__btn--view">
          View
        </a>
        <button type="button" class="ai-stylist-card__btn ai-stylist-card__btn--cart">
          + Add to Cart
        </button>
      </div>
    </div>
  `;

  // Attach Add to Cart event listener
  const cartBtn = card.querySelector(".ai-stylist-card__btn--cart");
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      addToCartFromStylist(product, cartBtn);
    });
  }

  return card;
}

function addToCartFromStylist(product, button) {
  // Use global addToCart if available (from cart-store.js)
  if (typeof addToCart === "function") {
    const defaultColor = (product.colors && product.colors[0]) || null;
    const defaultSize = (product.sizes && product.sizes[0]) || null;
    addToCart({
      productId: Number(product.id),
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
    });
  } else {
    // Fallback: save to localStorage directly and dispatch event
    try {
      const cart = JSON.parse(localStorage.getItem("threadco_cart")) || [];
      const existing = cart.find((i) => i.productId === Number(product.id));
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          productId: Number(product.id),
          size: null,
          color: null,
          quantity: 1,
        });
      }
      localStorage.setItem("threadco_cart", JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
    } catch (e) {
      console.warn("Could not save to cart from stylist:", e);
    }
  }

  // Visual button state feedback
  const originalText = button.textContent;
  button.disabled = true;
  button.classList.add("is-added");
  button.textContent = "Added ✓";

  setTimeout(() => {
    button.disabled = false;
    button.classList.remove("is-added");
    button.textContent = originalText;
  }, 1600);
}


/* ==========================================================================
   SCROLL CHAT
   ========================================================================== */

function scrollAIStylistChat() {

  const chat = document.querySelector("#ai-stylist-chat");

  if (!chat) {
    return;
  }

  chat.scrollTo({
    top: chat.scrollHeight,
    behavior: "smooth"
  });
}