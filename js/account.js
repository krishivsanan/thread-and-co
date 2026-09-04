/* ==========================================================================
   ACCOUNT PAGE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------------------------------------
     GET LOGGED-IN USER
     ---------------------------------------------------------------------- */

  const currentUser = JSON.parse(
    localStorage.getItem("threadco_current_user")
  );


  /* If user is not logged in, send them to login page */

  if (!currentUser) {

    window.location.href = "login.html";

    return;
  }


  /* ----------------------------------------------------------------------
     DISPLAY USER INFORMATION
     ---------------------------------------------------------------------- */

  const accountUserName =
    document.getElementById("account-user-name");

  const profileName =
    document.getElementById("profile-name");

  const profileEmail =
    document.getElementById("profile-email");

  const profileAvatar =
    document.getElementById("profile-avatar");


  if (accountUserName) {

    accountUserName.textContent =
      currentUser.name;
  }


  if (profileName) {

    profileName.textContent =
      currentUser.name;
  }


  if (profileEmail) {

    profileEmail.textContent =
      currentUser.email;
  }


  if (profileAvatar) {

    profileAvatar.textContent =
      currentUser.name
        .charAt(0)
        .toUpperCase();
  }


  /* ----------------------------------------------------------------------
     LOAD ALL ORDERS
     ---------------------------------------------------------------------- */

  const allOrders = JSON.parse(
    localStorage.getItem("threadco_orders")
  ) || [];


  /* Only show orders belonging to current user */

  const userOrders =
    allOrders.filter(
      (order) =>
        order.userId === currentUser.id
    );


  /* Newest order first */

  userOrders.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );


  /* ----------------------------------------------------------------------
     UPDATE ORDER COUNT
     ---------------------------------------------------------------------- */

  const ordersCount =
    document.getElementById("orders-count");


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
     LOGOUT
     ---------------------------------------------------------------------- */

  const logoutButton =
    document.getElementById("logout-btn");


  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      () => {

        localStorage.removeItem(
          "threadco_current_user"
        );


        window.location.href =
          "login.html";

      }
    );

  }


});


/* ==========================================================================
   RENDER ORDERS
   ========================================================================== */

function renderOrders(orders) {

  const ordersList =
    document.getElementById("orders-list");


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

  const date =
    formatOrderDate(order.createdAt);


  /* ----------------------------------------------------------------------
     PRODUCTS
     ---------------------------------------------------------------------- */

  const productsHTML =
    order.items
      .map((item) => {

        const product =
          item.product;

        if (!product) return "";


        const image =
          product.photoUrl ||
          `assets/images/products/${product.id}.jpg`;


        const quantity =
          item.quantity || 1;


        const lineTotal =
          product.price * quantity;


        const variantParts = [
          item.color,
          item.size
        ].filter(Boolean);


        return `
          <div class="order-product">

            <img
              src="${image}"
              alt="${product.name}"
            >

            <div>

              <p class="order-product__name">
                ${product.name}
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
    order.totals?.subtotal || 0;

  const shippingCost =
    order.totals?.shipping || 0;

  const tax =
    order.totals?.tax || 0;

  const discount =
    order.totals?.discount || 0;

  const total =
    order.totals?.total || 0;


  /* ----------------------------------------------------------------------
     CUSTOMER
     ---------------------------------------------------------------------- */

  const customerName =
    order.customer?.name ||
    "Not available";

  const customerEmail =
    order.customer?.email ||
    "Not available";

  const customerPhone =
    order.customer?.phone ||
    "Not available";


  /* ----------------------------------------------------------------------
     DELIVERY
     ---------------------------------------------------------------------- */

  const delivery =
    order.delivery || {};


  const shippingAddress = [
    delivery.address,
    delivery.apartment,
    delivery.city,
    delivery.state,
    delivery.postalCode,
    delivery.country
  ]
    .filter(Boolean)
    .join(", ") || "Not available";


  const shippingMethod =
    typeof order.shipping === "object"
      ? order.shipping.method
      : order.shipping || "Standard delivery";


  /* ----------------------------------------------------------------------
     PAYMENT
     ---------------------------------------------------------------------- */

  const paymentMethod =
    order.payment?.method ||
    "Not available";

  const paymentStatus =
    order.payment?.status ||
    "Not available";


  /* ----------------------------------------------------------------------
     DISCOUNT
     ---------------------------------------------------------------------- */

  const discountHTML =
    discount > 0
      ? `
        <div class="order-detail-row order-detail-row--discount">

          <span>
            Discount
            ${
              order.coupon?.code
                ? `(${order.coupon.code})`
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
            ${order.orderNumber}
          </strong>

          <p class="order-date">
            Placed on ${date}
          </p>

        </div>

        <span class="order-status">
          ${order.status || "Order placed"}
        </span>

      </div>


      <!-- PRODUCTS -->

      <div class="order-products">
        ${productsHTML}
      </div>


      <!-- BASIC TOTAL -->

      <div class="order-card__footer">

        <span>

          ${order.items.length}

          ${
            order.items.length === 1
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
                ${order.status || "Order placed"}
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
          button.closest(".order-card");

        if (!card) return;


        const details =
          card.querySelector(".order-details");

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