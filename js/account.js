/* ==========================================================================
   ACCOUNT PAGE
   ========================================================================== */

const API_BASE = (window.THREADCO_API_BASE || "http://localhost:4000/api").replace(/\/$/, "");


document.addEventListener("DOMContentLoaded", async () => {

  /* ----------------------------------------------------------------------
     GET LOGGED-IN USER
     ---------------------------------------------------------------------- */

  let currentUser = null;

  try {

    currentUser = JSON.parse(
      localStorage.getItem(
        "threadco_current_user"
      )
    );

  } catch (error) {

    console.error(
      "Could not read current user:",
      error
    );

  }


  /* If user is not logged in, send them to login page */

  if (!currentUser) {

    window.location.href =
      "login.html";

    return;
  }


  /* ----------------------------------------------------------------------
     DISPLAY USER INFORMATION
     ---------------------------------------------------------------------- */

  const accountUserName =
    document.getElementById(
      "account-user-name"
    );

  const profileName =
    document.getElementById(
      "profile-name"
    );

  const profileEmail =
    document.getElementById(
      "profile-email"
    );

  const profileAvatar =
    document.getElementById(
      "profile-avatar"
    );


  if (accountUserName) {

    accountUserName.textContent =
      currentUser.name || "User";

  }


  if (profileName) {

    profileName.textContent =
      currentUser.name || "User";

  }


  if (profileEmail) {

    profileEmail.textContent =
      currentUser.email || "";

  }


  if (profileAvatar) {

    profileAvatar.textContent =
      (currentUser.name || "U")
        .charAt(0)
        .toUpperCase();

  }


  /* ----------------------------------------------------------------------
     LOAD ORDERS FROM BACKEND
     ---------------------------------------------------------------------- */

  let userOrders = [];

  try {

    const response =
      await fetch(
        `${API_BASE}/orders`,
        {
          method: "GET",

          headers: {

            ...(localStorage.getItem("threadco_token")
              ? {
                  Authorization:
                    `Bearer ${localStorage.getItem("threadco_token")}`
                  }
              : {})

          }

        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      console.error(
        "Failed to load orders:",
        result
      );

      throw new Error(
        result.error ||
        "Failed to load orders."
      );

    }


    /*
     * Backend returns the user's orders.
     */

    userOrders =
      Array.isArray(result.orders)
        ? result.orders
        : [];

  } catch (error) {

    console.error(
      "Could not load orders:",
      error
    );


    const ordersList =
      document.getElementById(
        "orders-list"
      );


    if (ordersList) {

      ordersList.innerHTML = `

        <div class="empty-orders">

          <div class="empty-orders__icon">
            ⚠️
          </div>

          <h3>
            Couldn't load your orders
          </h3>

          <p>
            Please make sure the Thread & Co.
            server is running and try again.
          </p>

        </div>

      `;

    }

  }


  /* ----------------------------------------------------------------------
     NEWEST ORDER FIRST
     ---------------------------------------------------------------------- */

  userOrders.sort(
    (a, b) =>
      new Date(
        b.created_at ||
        b.createdAt
      ) -
      new Date(
        a.created_at ||
        a.createdAt
      )
  );


  /* ----------------------------------------------------------------------
     UPDATE ORDER COUNT
     ---------------------------------------------------------------------- */

  const ordersCount =
    document.getElementById(
      "orders-count"
    );


  if (ordersCount) {

    const count =
      userOrders.length;


    ordersCount.textContent =
      `${count} ${
        count === 1
          ? "order"
          : "orders"
      }`;

  }


  /* ----------------------------------------------------------------------
     RENDER ORDERS
     ---------------------------------------------------------------------- */

  renderOrders(userOrders);

  attachOrderDetailsEvents();


  /* ----------------------------------------------------------------------
     INITIALIZE TABS & PROFILE EDITING
     ---------------------------------------------------------------------- */

  const navOrdersCount = document.getElementById("nav-orders-count");
  if (navOrdersCount) {
    navOrdersCount.textContent = userOrders.length;
  }

  const profilePhone = document.getElementById("profile-phone");
  if (profilePhone && currentUser.phone) {
    profilePhone.hidden = false;
    profilePhone.textContent = currentUser.phone;
  }

  initAccountTabs();
  initAccountProfile(currentUser, accountUserName, profileName, profileAvatar, profilePhone);


  /* ----------------------------------------------------------------------
     LOGOUT
     ---------------------------------------------------------------------- */

  const logoutButton =
    document.getElementById(
      "logout-btn"
    );


  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      () => {

        localStorage.removeItem(
          "threadco_current_user"
        );

        localStorage.removeItem(
          "threadco_token"
        );


        window.location.href =
          "login.html";

      }
    );

  }

});

/* ==========================================================================
   TABS NAVIGATION
   ========================================================================== */

function initAccountTabs() {
  const tabOrders = document.getElementById("tab-orders");
  const tabProfile = document.getElementById("tab-profile");
  const sectionOrders = document.getElementById("section-orders");
  const sectionProfile = document.getElementById("section-profile");

  if (!tabOrders || !tabProfile || !sectionOrders || !sectionProfile) return;

  function switchTab(tabName) {
    if (tabName === "profile") {
      tabProfile.classList.add("is-active");
      tabOrders.classList.remove("is-active");
      sectionProfile.hidden = false;
      sectionOrders.hidden = true;
      history.replaceState(null, "", "#profile");
    } else {
      tabOrders.classList.add("is-active");
      tabProfile.classList.remove("is-active");
      sectionOrders.hidden = false;
      sectionProfile.hidden = true;
      history.replaceState(null, "", "#orders");
    }
  }

  tabOrders.addEventListener("click", () => switchTab("orders"));
  tabProfile.addEventListener("click", () => switchTab("profile"));

  // Check URL hash for direct tab linking
  if (window.location.hash === "#profile" || window.location.hash === "#settings") {
    switchTab("profile");
  }
}

/* ==========================================================================
   PROFILE & ADDRESS MANAGEMENT
   ========================================================================== */

function initAccountProfile(user, accountUserName, profileName, profileAvatar, profilePhone) {
  let currentUser = { ...user };
  const form = document.getElementById("profile-form");
  const feedback = document.getElementById("profile-feedback");
  const saveBtn = document.getElementById("save-profile-btn");

  if (!form) return;

  // Pre-fill personal info
  const nameInput = document.getElementById("edit-name");
  const emailInput = document.getElementById("edit-email");
  const phoneInput = document.getElementById("edit-phone");

  if (nameInput) nameInput.value = currentUser.name || "";
  if (emailInput) emailInput.value = currentUser.email || "";
  if (phoneInput) phoneInput.value = currentUser.phone || "";

  // Pre-fill address from localStorage if exists
  let savedAddress = {};
  try {
    savedAddress = JSON.parse(localStorage.getItem("threadco_saved_address")) || {};
  } catch (e) {
    savedAddress = {};
  }

  const addressInput = document.getElementById("edit-address");
  const aptInput = document.getElementById("edit-apartment");
  const cityInput = document.getElementById("edit-city");
  const stateInput = document.getElementById("edit-state");
  const postalInput = document.getElementById("edit-postal-code");
  const countryInput = document.getElementById("edit-country");

  if (addressInput) addressInput.value = savedAddress.address || "";
  if (aptInput) aptInput.value = savedAddress.apartment || "";
  if (cityInput) cityInput.value = savedAddress.city || "";
  if (stateInput) stateInput.value = savedAddress.state || "";
  if (postalInput) postalInput.value = savedAddress.postalCode || "";
  if (countryInput) countryInput.value = savedAddress.country || "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const currentPasswordInput = document.getElementById("edit-current-password");
    const newPasswordInput = document.getElementById("edit-new-password");
    const confirmPasswordInput = document.getElementById("edit-confirm-password");

    const currentPassword = currentPasswordInput ? currentPasswordInput.value : "";
    const newPassword = newPasswordInput ? newPasswordInput.value : "";
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

    // Validate password change if attempted
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        showProfileFeedback(feedback, "Current password is required to change password.", "error");
        currentPasswordInput.focus();
        return;
      }
      if (newPassword.length < 6) {
        showProfileFeedback(feedback, "New password must be at least 6 characters.", "error");
        newPasswordInput.focus();
        return;
      }
      if (newPassword !== confirmPassword) {
        showProfileFeedback(feedback, "New passwords do not match. Please verify.", "error");
        confirmPasswordInput.focus();
        return;
      }
    }

    // Save shipping address to localStorage
    const addressData = {
      address: addressInput ? addressInput.value.trim() : "",
      apartment: aptInput ? aptInput.value.trim() : "",
      city: cityInput ? cityInput.value.trim() : "",
      state: stateInput ? stateInput.value.trim() : "",
      postalCode: postalInput ? postalInput.value.trim() : "",
      country: countryInput ? countryInput.value.trim() : "",
    };
    localStorage.setItem("threadco_saved_address", JSON.stringify(addressData));

    // Send update request to server
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }

    try {
      const token = localStorage.getItem("threadco_token");
      const payload = {
        name,
        phone,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }

      // Update current user in memory and localStorage
      const updatedUser = {
        ...currentUser,
        name: result.user.name,
        phone: result.user.phone,
        savedAddress: addressData,
      };
      currentUser = updatedUser;
      localStorage.setItem("threadco_current_user", JSON.stringify(updatedUser));

      // Update UI displays
      if (accountUserName) accountUserName.textContent = updatedUser.name;
      if (profileName) profileName.textContent = updatedUser.name;
      if (profileAvatar) {
        profileAvatar.textContent = (updatedUser.name || "U").charAt(0).toUpperCase();
      }
      if (profilePhone) {
        profilePhone.hidden = !updatedUser.phone;
        profilePhone.textContent = updatedUser.phone || "";
      }

      // Clear password inputs
      if (currentPasswordInput) currentPasswordInput.value = "";
      if (newPasswordInput) newPasswordInput.value = "";
      if (confirmPasswordInput) confirmPasswordInput.value = "";

      showProfileFeedback(feedback, "Profile and default shipping address saved successfully!", "success");
    } catch (err) {
      console.error("Profile update error:", err);
      showProfileFeedback(feedback, err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
      }
    }
  });
}

function showProfileFeedback(el, message, type) {
  if (!el) return;
  el.hidden = false;
  el.className = `account-feedback account-feedback--${type}`;
  el.innerHTML = `
    <span class="account-feedback__icon">${type === "success" ? "✓" : "⚠️"}</span>
    <span>${message}</span>
  `;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}


/* ==========================================================================
   RENDER ORDERS
   ========================================================================== */

function renderOrders(orders) {

  const ordersList =
    document.getElementById(
      "orders-list"
    );


  if (!ordersList) return;


  /* ----------------------------------------------------------------------
     EMPTY STATE
     ---------------------------------------------------------------------- */

  if (orders.length === 0) {

    ordersList.innerHTML = `

      <div class="empty-orders">

        <div class="empty-orders__icon">
          🛍️
        </div>

        <h3>
          No orders yet
        </h3>

        <p>
          When you place an order,
          it will appear here.
        </p>

        <a
          href="products.html"
          class="btn btn--primary"
        >
          Start shopping
        </a>

      </div>

    `;

    return;
  }


  /* ----------------------------------------------------------------------
     ORDER CARDS
     ---------------------------------------------------------------------- */

  ordersList.innerHTML =
    orders
      .map((order) => {

        return createOrderCard(order);

      })
      .join("");

}


/* ==========================================================================
   CREATE ORDER CARD
   ========================================================================== */

function createOrderCard(order) {

  /* ----------------------------------------------------------------------
     BASIC ORDER DATA
     ---------------------------------------------------------------------- */

  const orderNumber =
    order.order_number ||
    order.orderNumber ||
    "Order";


  const createdAt =
    order.created_at ||
    order.createdAt;


  const date =
    formatOrderDate(createdAt);


  const status =
    order.status ||
    "Order placed";


  /* ----------------------------------------------------------------------
     PRODUCTS
     ---------------------------------------------------------------------- */

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];


  const productsHTML =
    items
      .map((item) => {

        /*
         * Backend order items use:
         * product_name
         * product_id
         * unit_price
         *
         * Old frontend orders used:
         * item.product
         */

        const product =
          item.product || null;


        const productName =
          item.product_name ||
          product?.name ||
          "Product";


        const productId =
          item.product_id ||
          product?.id;


        const image =
          item.photo_url ||
          product?.photoUrl ||
          "assets/images/products/1.jpg";


        const quantity =
          Number(item.quantity) || 1;


        const unitPrice =
          Number(
            item.unit_price ??
            product?.price ??
            0
          );


        const lineTotal =
          unitPrice * quantity;


        const variantParts = [
          item.color,
          item.size
        ].filter(Boolean);


        return `
          <div class="order-product">

            <img
              src="${image}"
              alt="${productName}"
            >

            <div>

              <p class="order-product__name">
                ${productName}
              </p>

              <p class="order-product__meta">

                ${
                  variantParts.length
                    ? variantParts.join(" · ") + " · "
                    : ""
                }

                Qty ${quantity}

              </p>

            </div>

            <span class="order-product__price">
              $${lineTotal.toFixed(2)}
            </span>

          </div>
        `;

      })
      .join("");


  /* ----------------------------------------------------------------------
     TOTALS
     ---------------------------------------------------------------------- */

  const subtotal =
    Number(
      order.subtotal ??
      order.totals?.subtotal ??
      0
    );


  const shippingCost =
    Number(
      order.shipping_cost ??
      order.totals?.shipping ??
      0
    );


  const tax =
    Number(
      order.tax ??
      order.totals?.tax ??
      0
    );


  const discount =
    Number(
      order.discount ??
      order.totals?.discount ??
      0
    );


  const total =
    Number(
      order.total ??
      order.totals?.total ??
      0
    );


  /* ----------------------------------------------------------------------
     CUSTOMER
     ---------------------------------------------------------------------- */

  const customerName =
    order.customer_name ||
    order.customer?.name ||
    "Not available";


  const customerEmail =
    order.customer_email ||
    order.customer?.email ||
    "Not available";


  const customerPhone =
    order.customer_phone ||
    order.customer?.phone ||
    "Not available";


  /* ----------------------------------------------------------------------
     DELIVERY
     ---------------------------------------------------------------------- */

  const shippingAddress = [

    order.address ||
      order.delivery?.address,

    order.apartment ||
      order.delivery?.apartment,

    order.city ||
      order.delivery?.city,

    order.state ||
      order.delivery?.state,

    order.postal_code ||
      order.delivery?.postalCode,

    order.country ||
      order.delivery?.country

  ]
    .filter(Boolean)
    .join(", ") || "Not available";


  const shippingMethod =
    order.shipping_method ||
    order.shipping?.method ||
    "Standard delivery";


  /* ----------------------------------------------------------------------
     PAYMENT
     ---------------------------------------------------------------------- */

  const paymentMethod =
    order.payment_method ||
    order.payment?.method ||
    "Not available";


  const paymentStatus =
    order.payment_status ||
    order.payment?.status ||
    "Not available";


  /* ----------------------------------------------------------------------
     COUPON
     ---------------------------------------------------------------------- */

  const couponCode =
    order.coupon_code ||
    order.coupon?.code ||
    "";


  const discountHTML =
    discount > 0
      ? `
        <div class="order-detail-row order-detail-row--discount">

          <span>
            Discount
            ${
              couponCode
                ? `(${couponCode})`
                : ""
            }
          </span>

          <strong>
            −$${discount.toFixed(2)}
          </strong>

        </div>
      `
      : "";


  /* ----------------------------------------------------------------------
     ORDER CARD
     ---------------------------------------------------------------------- */

  return `

    <article class="order-card">


      <!-- HEADER -->

      <div class="order-card__header">

        <div>

          <strong class="order-number">
            ${orderNumber}
          </strong>

          <p class="order-date">
            Placed on ${date}
          </p>

        </div>

        <span class="order-status">
          ${status}
        </span>

      </div>


      <!-- PRODUCTS -->

      <div class="order-products">
        ${productsHTML}
      </div>


      <!-- BASIC TOTAL -->

      <div class="order-card__footer">

        <span>

          ${items.length}

          ${
            items.length === 1
              ? "item"
              : "items"
          }

        </span>


        <div>

          <span>
            Total
          </span>

          <strong class="order-card__total">
            $${total.toFixed(2)}
          </strong>

        </div>

      </div>


      <!-- VIEW DETAILS -->

      <button
        type="button"
        class="order-details-toggle"
        aria-expanded="false"
      >

        <span>
          View full order details
        </span>

        <span>
          +
        </span>

      </button>


      <!-- FULL DETAILS -->

      <div class="order-details">


        <!-- CUSTOMER -->

        <div class="order-details__section">

          <h3>
            Customer
          </h3>

          <div class="order-info-grid">

            <div>

              <span>
                Name
              </span>

              <strong>
                ${customerName}
              </strong>

            </div>


            <div>

              <span>
                Email
              </span>

              <strong>
                ${customerEmail}
              </strong>

            </div>


            <div>

              <span>
                Phone
              </span>

              <strong>
                ${customerPhone}
              </strong>

            </div>

          </div>

        </div>


        <!-- DELIVERY -->

        <div class="order-details__section">

          <h3>
            Delivery
          </h3>

          <div class="order-info-grid">

            <div class="order-info-grid__full">

              <span>
                Address
              </span>

              <strong>
                ${shippingAddress}
              </strong>

            </div>


            <div>

              <span>
                Shipping method
              </span>

              <strong>
                ${shippingMethod}
              </strong>

            </div>


            <div>

              <span>
                Status
              </span>

              <strong>
                ${status}
              </strong>

            </div>

          </div>

        </div>


        <!-- PAYMENT -->

        <div class="order-details__section">

          <h3>
            Payment
          </h3>

          <div class="order-info-grid">

            <div>

              <span>
                Method
              </span>

              <strong>
                ${paymentMethod}
              </strong>

            </div>


            <div>

              <span>
                Payment status
              </span>

              <strong>
                ${paymentStatus}
              </strong>

            </div>

          </div>

        </div>


        <!-- PRICE -->

        <div class="order-details__section">

          <h3>
            Price breakdown
          </h3>

          <div class="order-price-breakdown">


            <div class="order-detail-row">

              <span>
                Subtotal
              </span>

              <strong>
                $${subtotal.toFixed(2)}
              </strong>

            </div>


            <div class="order-detail-row">

              <span>
                Shipping
              </span>

              <strong>

                ${
                  shippingCost === 0
                    ? "Free"
                    : `$${shippingCost.toFixed(2)}`
                }

              </strong>

            </div>


            <div class="order-detail-row">

              <span>
                Tax
              </span>

              <strong>
                $${tax.toFixed(2)}
              </strong>

            </div>


            ${discountHTML}


            <div
              class="order-detail-row
                     order-detail-row--total"
            >

              <span>
                Total
              </span>

              <strong>
                $${total.toFixed(2)}
              </strong>

            </div>


          </div>

        </div>


      </div>

    </article>

  `;
}


/* ==========================================================================
   FORMAT DATE
   ========================================================================== */

function formatOrderDate(dateString) {

  const date =
    new Date(dateString);


  if (Number.isNaN(date.getTime())) {

    return "Unknown date";

  }


  return date.toLocaleDateString(
    "en-US",
    {

      year: "numeric",

      month: "long",

      day: "numeric"

    }
  );

}


/* ==========================================================================
   ORDER DETAILS TOGGLE
   ========================================================================== */

function attachOrderDetailsEvents() {

  const buttons =
    document.querySelectorAll(
      ".order-details-toggle"
    );


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const card =
          button.closest(
            ".order-card"
          );

        if (!card) return;


        const details =
          card.querySelector(
            ".order-details"
          );

        if (!details) return;


        const isOpen =
          card.classList.toggle(
            "order-card--expanded"
          );


        button.setAttribute(
          "aria-expanded",
          isOpen
        );


        const text =
          button.querySelector(
            "span:first-child"
          );


        const icon =
          button.querySelector(
            "span:last-child"
          );


        if (text) {

          text.textContent =
            isOpen
              ? "Hide order details"
              : "View full order details";

        }


        if (icon) {

          icon.textContent =
            isOpen
              ? "−"
              : "+";

        }

      }
    );

  });

}