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

      demoStylistResponse(prompt);

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

    demoStylistResponse(message);

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
   DEMO RESPONSE
   --------------------------------------------------------------------------
   Temporary only.

   Stage 2 will replace this function with an actual LLM/API request.
   ========================================================================== */

function demoStylistResponse(message) {

  const chat = document.querySelector("#ai-stylist-chat");

  if (!chat) {
    return;
  }


  setTimeout(() => {

    const responseElement = document.createElement("div");

    responseElement.className =
      "ai-stylist-message ai-stylist-message--ai";


    const bubble = document.createElement("div");

    bubble.className = "ai-stylist-message__bubble";


    const lowerMessage = message.toLowerCase();


    if (
      lowerMessage.includes("wedding") ||
      lowerMessage.includes("marriage")
    ) {

      bubble.textContent =
        "A wedding is a great place to start. " +
        "Tell me whether it's a daytime or evening event, " +
        "your preferred style, and your budget.";

    }

    else if (
      lowerMessage.includes("party")
    ) {

      bubble.textContent =
        "Let's build something that fits the party. " +
        "Tell me the type of party, your preferred colors, " +
        "and how much you'd like to spend.";

    }

    else if (
      lowerMessage.includes("casual")
    ) {

      bubble.textContent =
        "For a casual look, tell me what you usually prefer " +
        "— minimal, relaxed, streetwear, or something else — " +
        "and I'll help narrow it down.";

    }

    else {

      bubble.textContent =
        "I'd love to help. Tell me the occasion, your style, " +
        "preferred colors, and budget.";

    }


    responseElement.appendChild(bubble);

    chat.appendChild(responseElement);

    scrollAIStylistChat();

  }, 500);
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