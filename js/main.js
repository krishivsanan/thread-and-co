/* ==========================================================================
   MAIN.JS
   ------------------------------------------------------------------------
   JavaScript that runs on EVERY page (because every page shares the same
   navbar and footer). Page-specific behavior (like the homepage's product
   scroller) belongs in that page's own file, e.g. js/home.js, not here.

   This file only touches elements that exist in the shared navbar/footer
   markup, so it's safe to include on Products, Cart, Checkout, etc. too.
   ========================================================================== */

// Wait for the HTML to finish loading before touching it, so we never try
// to grab an element that hasn't rendered yet.
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initNewsletterForm();
});

/* ------------------------------------------------------------------------
   1. MOBILE MENU
   Toggles the off-canvas nav links (see navbar.css @media max-width:900px)
   by adding/removing an "is-open" class on <body>.
   ------------------------------------------------------------------------ */
function initMobileMenu() {
  const toggleBtn = document.querySelector(".navbar__toggle");
  if (!toggleBtn) return; // guard clause: skip safely if this page has no navbar toggle

  toggleBtn.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("is-open");

    // Keep screen readers / keyboard users informed of the menu state.
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close the mobile menu automatically if someone clicks a nav link,
  // so the menu doesn't stay open after navigating.
  document.querySelectorAll(".navbar__links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* ------------------------------------------------------------------------
   2. NEWSLETTER FORM (in the footer)
   There is no backend yet (that's Module 6's job), so for now we just
   stop the browser's default page-reload-on-submit behavior and show a
   friendly confirmation message instead.

   FUTURE INTEGRATION NOTE for Module 6:
   Replace the body of the "submit" handler below with a real fetch()
   call, e.g.:
     fetch("/api/newsletter", { method: "POST", body: JSON.stringify({email}) })
   ------------------------------------------------------------------------ */
function initNewsletterForm() {
  const form = document.querySelector(".footer__newsletter-form");
  if (!form) return;

  const message = document.querySelector(".footer__newsletter-msg");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput =
      form.querySelector("input[type='email']");

      const email =
        emailInput.value.trim();


      /* Empty email */

      if (!email) {
      
        message.textContent =
          "Please enter your email address.";
      
        emailInput.focus();
      
        return;
      }


    /* Invalid email */
      
    if (!emailInput.checkValidity()) {
    
      message.textContent =
        "Please enter a valid email address.";
    
      emailInput.focus();
    
      return;
    }
  
  
    /* Success */
  
    message.textContent =
      `Thanks! We'll send offers to ${email}.`;
  
    form.reset();
  
  });
}
