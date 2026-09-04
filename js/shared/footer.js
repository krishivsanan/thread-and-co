/* ==========================================================================
   SHARED FOOTER
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const footerContainer =
    document.getElementById("site-footer");

  if (!footerContainer) return;


  footerContainer.innerHTML = `

    <footer class="footer">

      <div class="container">

        <div class="footer__grid">


          <!-- BRAND -->

          <div class="footer__brand">

            <a
              href="index.html"
              class="navbar__logo"
            >
              Thread<span>&</span>Co.
            </a>

            <p>
              Considered clothing for the way you
              actually live, work and move.
            </p>

          </div>


          <!-- SHOP -->

          <nav>

            <h3 class="footer__heading">
              Shop
            </h3>

            <ul class="footer__links">

              <li>
                <a href="products.html?category=men">
                  Men
                </a>
              </li>

              <li>
                <a href="products.html?category=women">
                  Women
                </a>
              </li>

              <li>
                <a href="products.html?category=shoes">
                  Shoes
                </a>
              </li>

              <li>
                <a href="products.html?category=accessories">
                  Accessories
                </a>
              </li>

            </ul>

          </nav>


          <!-- HELP -->

          <nav>

            <h3 class="footer__heading">
              Help
            </h3>

            <ul class="footer__links">

              <li>
                <a href="help.html#track">
                  Track order
                </a>
              </li>

              <li>
                <a href="help.html#shipping">
                  Shipping &amp; returns
                </a>
              </li>

              <li>
                <a href="help.html#faq">
                  FAQ
                </a>
              </li>

              <li>
                <a href="help.html#contact">
                  Contact us
                </a>
              </li>

            </ul>

          </nav>


          <!-- NEWSLETTER -->

          <div>

            <h3 class="footer__heading">
              Stay in the loop
            </h3>

            <p class="footer-text">
              Sign up for 10% off your first order.
            </p>

            <form class="footer__newsletter-form">

              <label
                for="newsletter-email"
                class="visually-hidden"
              >
                Email address
              </label>

              <input
                type="email"
                id="newsletter-email"
                placeholder="you@example.com"
                required
              >

              <button type="submit">
                Join
              </button>

            </form>

            <p
              class="footer__newsletter-msg"
              aria-live="polite"
            ></p>

          </div>


        </div>


        <!-- BOTTOM -->

        <div class="footer__bottom">

          <p>
            © 2026 Thread &amp; Co.
          </p>


          <div class="footer__socials">

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              IG
            </a>

            <a
              href="https://pinterest.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
            >
              PIN
            </a>

            <a
              href="https://tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              TT
            </a>

          </div>

        </div>

      </div>

    </footer>

  `;

});