/* ==========================================================================
   CHECKOUT.JS
   ========================================================================== */

/* --------------------------------------------------------------------------
   API
   -------------------------------------------------------------------------- */

const API_BASE = "http://localhost:4000";


/* --------------------------------------------------------------------------
   PRICING
   -------------------------------------------------------------------------- */

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING_FEE = 6.99;
const EXPRESS_SHIPPING_FEE = 12.99;

const COUPON_CODES = {
  WELCOME10: 0.1,
  SAVE20: 0.2,
};


/* --------------------------------------------------------------------------
   STATE
   -------------------------------------------------------------------------- */

let appliedCoupon = JSON.parse(
  localStorage.getItem("threadco_coupon")
) || null;

let selectedShipping = "standard";


/* --------------------------------------------------------------------------
   DOM READY
   -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

  const items = getCartWithProductDetails();

  if (items.length === 0) {
    renderEmptyCheckout();
    return;
  }

  renderCheckout();
  attachEvents();
});


/* --------------------------------------------------------------------------
   RENDER EVERYTHING
   -------------------------------------------------------------------------- */

function renderCheckout() {

  const items = getCartWithProductDetails();

  renderCheckoutItems(items);
  renderTotals(items);
  updateItemCount(items);
}


/* --------------------------------------------------------------------------
   RENDER ORDER ITEMS
   -------------------------------------------------------------------------- */

function renderCheckoutItems(items) {

  const container =
    document.getElementById("checkout-items");

  if (!container) return;

  container.innerHTML = items
    .map((item) => {

      const product = item.product;

      const photo =
        product.photoUrl ||
        `assets/images/products/${product.id}.jpg`;

      const variantParts = [
        item.color,
        item.size
      ].filter(Boolean);

      const lineTotal =
        product.price * item.quantity;

      return `
        <div class="checkout-item">

          <img
            class="checkout-item__image"
            src="${photo}"
            alt="${product.name}"
          />

          <div class="checkout-item__info">

            <p class="checkout-item__name">
              ${product.name}
            </p>

            <p class="checkout-item__meta">
              ${
                variantParts.length
                  ? variantParts.join(" · ")
                  : "Standard"
              }
              · Qty ${item.quantity}
            </p>

          </div>

          <span class="checkout-item__price">
            $${lineTotal.toFixed(2)}
          </span>

        </div>
      `;
    })
    .join("");
}


/* --------------------------------------------------------------------------
   CALCULATE TOTALS
   -------------------------------------------------------------------------- */

function calculateTotals(items) {

  const subtotal = items.reduce(
    (sum, item) => {
      return sum + item.product.price * item.quantity;
    },
    0
  );


  /* Shipping */

  let shipping = 0;

  if (selectedShipping === "express") {

    shipping = EXPRESS_SHIPPING_FEE;

  } else {

    shipping =
      subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : FLAT_SHIPPING_FEE;
  }


  /* Discount */

  const discount =
    appliedCoupon
      ? subtotal * appliedCoupon.percent
      : 0;


  /* Tax */

  const tax =
    subtotal * TAX_RATE;


  /* Final total */

  const total =
    subtotal +
    shipping +
    tax -
    discount;


  return {
    subtotal,
    shipping,
    discount,
    tax,
    total
  };
}


/* --------------------------------------------------------------------------
   RENDER TOTALS
   -------------------------------------------------------------------------- */

function renderTotals(items) {

  const totals =
    calculateTotals(items);

  const totalsContainer =
    document.getElementById("checkout-totals");

  if (!totalsContainer) return;


  totalsContainer.innerHTML = `

    <div class="total-row">

      <span>Subtotal</span>

      <strong>
        $${totals.subtotal.toFixed(2)}
      </strong>

    </div>


    <div class="total-row">

      <span>Shipping</span>

      <strong>
        ${
          totals.shipping === 0
            ? "Free"
            : `$${totals.shipping.toFixed(2)}`
        }
      </strong>

    </div>


    ${
      selectedShipping === "standard" &&
      totals.subtotal < FREE_SHIPPING_THRESHOLD
        ? `
          <div class="total-row">

            <span>
              Add $${(
                FREE_SHIPPING_THRESHOLD -
                totals.subtotal
              ).toFixed(2)}
              for free shipping
            </span>

          </div>
        `
        : ""
    }


    <div class="total-row">

      <span>Estimated tax</span>

      <strong>
        $${totals.tax.toFixed(2)}
      </strong>

    </div>


    ${
      appliedCoupon
        ? `
          <div class="total-row total-row--discount">

            <span>
              Discount (${appliedCoupon.code})
            </span>

            <strong>
              −$${totals.discount.toFixed(2)}
            </strong>

          </div>
        `
        : ""
    }


    <div class="total-row total-row--grand">

      <span>Total</span>

      <strong>
        $${totals.total.toFixed(2)}
      </strong>

    </div>
  `;


  /* Place order button total */

  const placeOrderTotal =
    document.getElementById(
      "place-order-total"
    );

  if (placeOrderTotal) {

    placeOrderTotal.textContent =
      `$${totals.total.toFixed(2)}`;
  }


  /* Mobile summary total */

  const mobileTotal =
    document.getElementById(
      "mobile-summary-total"
    );

  if (mobileTotal) {

    mobileTotal.textContent =
      `$${totals.total.toFixed(2)}`;
  }


  renderMobileSummary(
    items,
    totals
  );
}


/* --------------------------------------------------------------------------
   ITEM COUNT
   -------------------------------------------------------------------------- */

function updateItemCount(items) {

  const count =
    items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );


  const mobileCount =
    document.getElementById(
      "mobile-item-count"
    );

  if (mobileCount) {

    mobileCount.textContent =
      `(${count} ${
        count === 1
          ? "item"
          : "items"
      })`;
  }
}


/* --------------------------------------------------------------------------
   MOBILE SUMMARY
   -------------------------------------------------------------------------- */

function renderMobileSummary(
  items,
  totals
) {

  const container =
    document.getElementById(
      "mobile-summary-content"
    );

  if (!container) return;


  const itemsHTML =
    items
      .map((item) => {

        const product =
          item.product;

        const photo =
          product.photoUrl ||
          `assets/images/products/${product.id}.jpg`;

        return `
          <div class="checkout-item">

            <img
              class="checkout-item__image"
              src="${photo}"
              alt="${product.name}"
            />

            <div class="checkout-item__info">

              <p class="checkout-item__name">
                ${product.name}
              </p>

              <p class="checkout-item__meta">
                Qty ${item.quantity}
              </p>

            </div>

            <span class="checkout-item__price">
              $${(
                product.price *
                item.quantity
              ).toFixed(2)}
            </span>

          </div>
        `;
      })
      .join("");


  container.innerHTML = `

    <div class="checkout-items">

      ${itemsHTML}

    </div>


    <div class="checkout-totals">

      <div class="total-row">

        <span>Subtotal</span>

        <strong>
          $${totals.subtotal.toFixed(2)}
        </strong>

      </div>


      <div class="total-row">

        <span>Shipping</span>

        <strong>
          ${
            totals.shipping === 0
              ? "Free"
              : `$${totals.shipping.toFixed(2)}`
          }
        </strong>

      </div>


      <div class="total-row">

        <span>Tax</span>

        <strong>
          $${totals.tax.toFixed(2)}
        </strong>

      </div>


      ${
        appliedCoupon
          ? `
            <div class="total-row total-row--discount">

              <span>
                Discount
              </span>

              <strong>
                −$${totals.discount.toFixed(2)}
              </strong>

            </div>
          `
          : ""
      }


      <div class="total-row total-row--grand">

        <span>Total</span>

        <strong>
          $${totals.total.toFixed(2)}
        </strong>

      </div>

    </div>
  `;
}


/* --------------------------------------------------------------------------
   SHIPPING METHOD
   -------------------------------------------------------------------------- */

function updateShippingMethod() {

  const selected =
    document.querySelector(
      'input[name="shipping"]:checked'
    );

  if (!selected) return;


  selectedShipping =
    selected.value;


  renderCheckout();
}


/* --------------------------------------------------------------------------
   PAYMENT METHOD
   -------------------------------------------------------------------------- */

function updatePaymentMethod() {

  const selected =
    document.querySelector(
      'input[name="payment"]:checked'
    );

  const cardDetails =
    document.getElementById(
      "card-details"
    );

  if (!selected || !cardDetails) return;


  if (selected.value === "card") {

    cardDetails.style.display =
      "block";

  } else {

    cardDetails.style.display =
      "none";
  }
}


/* --------------------------------------------------------------------------
   COUPON
   -------------------------------------------------------------------------- */

function handleCoupon(event) {

  event.preventDefault();


  const input =
    document.getElementById(
      "checkout-coupon-input"
    );

  const message =
    document.getElementById(
      "checkout-coupon-msg"
    );


  if (!input || !message) return;


  const code =
    input.value
      .trim()
      .toUpperCase();


  if (!code) {

    message.textContent =
      "Enter a discount code.";

    return;
  }


  if (COUPON_CODES[code]) {

    appliedCoupon = {

      code,

      percent:
        COUPON_CODES[code]

    };


    message.textContent =
      `${code} applied — ${
        Math.round(
          COUPON_CODES[code] * 100
        )
      }% off.`;

  } else {

    appliedCoupon = null;


    message.textContent =
      "That discount code isn't valid.";
  }


  localStorage.setItem(
    "threadco_coupon",
    JSON.stringify(appliedCoupon)
  );


  renderCheckout();
}


/* --------------------------------------------------------------------------
   CARD NUMBER FORMATTING
   -------------------------------------------------------------------------- */

function formatCardNumber(event) {

  let value =
    event.target.value.replace(
      /\D/g,
      ""
    );


  value =
    value
      .match(/.{1,4}/g)
      ?.join(" ") ||
    "";


  event.target.value =
    value;
}


function formatExpiry(event) {

  let value =
    event.target.value.replace(
      /\D/g,
      ""
    );


  if (value.length > 2) {

    value =
      value.slice(0, 2) +
      " / " +
      value.slice(2, 4);
  }


  event.target.value =
    value;
}


/* --------------------------------------------------------------------------
   FORM VALIDATION
   -------------------------------------------------------------------------- */

function validateCheckoutForm() {

  const requiredFields = [

    "email",
    "first-name",
    "last-name",
    "address",
    "city",
    "state",
    "postal-code",
    "country",
    "phone"

  ];


  let isValid = true;


  requiredFields.forEach((id) => {

    const field =
      document.getElementById(id);

    if (!field) return;


    field.style.borderColor =
      "";


    if (!field.value.trim()) {

      field.style.borderColor =
        "var(--color-brick)";

      isValid = false;
    }

  });


  /* Email validation */

  const email =
    document.getElementById(
      "email"
    );


  if (
    email &&
    email.value.trim() &&
    !email.checkValidity()
  ) {

    email.style.borderColor =
      "var(--color-brick)";

    isValid = false;
  }


  /* Card validation */

  const payment =
    document.querySelector(
      'input[name="payment"]:checked'
    );


  if (
    payment &&
    payment.value === "card"
  ) {

    const cardFields = [

      "card-name",
      "card-number",
      "expiry",
      "cvv"

    ];


    cardFields.forEach((id) => {

      const field =
        document.getElementById(id);

      if (!field) return;


      field.style.borderColor =
        "";


      if (!field.value.trim()) {

        field.style.borderColor =
          "var(--color-brick)";

        isValid = false;
      }

    });

  }


  return isValid;
}


/* --------------------------------------------------------------------------
   PLACE ORDER
   -------------------------------------------------------------------------- */

async function handlePlaceOrder(event) {

  event.preventDefault();


  const items =
    getCartWithProductDetails();


  if (items.length === 0) {

    renderEmptyCheckout();

    return;
  }


  /* Validate form */

  const isValid =
    validateCheckoutForm();


  if (!isValid) {

    alert(
      "Please complete all required fields before placing your order."
    );

    return;
  }


  /* Current logged-in user */

  let currentUser = null;

  try {

    currentUser =
      JSON.parse(
        localStorage.getItem(
          "threadco_current_user"
        )
      );

  } catch (error) {

    console.warn(
      "Could not read current user.",
      error
    );
  }


  /* Payment method */

  const selectedPayment =
    document.querySelector(
      'input[name="payment"]:checked'
    );


  const paymentMethod =
    selectedPayment?.value === "cash"
      ? "cash"
      : "card";


  /* Customer information */

  const firstName =
    document.getElementById(
      "first-name"
    )?.value.trim() || "";


  const lastName =
    document.getElementById(
      "last-name"
    )?.value.trim() || "";


  const customerName =
    `${firstName} ${lastName}`.trim();


  const customerEmail =
    document.getElementById(
      "email"
    )?.value.trim() || "";


  const customerPhone =
    document.getElementById(
      "phone"
    )?.value.trim() || "";


  /* Delivery information */

  const delivery = {

    address:
      document.getElementById(
        "address"
      )?.value.trim() || "",

    apartment:
      document.getElementById(
        "apartment"
      )?.value.trim() || "",

    city:
      document.getElementById(
        "city"
      )?.value.trim() || "",

    state:
      document.getElementById(
        "state"
      )?.value.trim() || "",

    postalCode:
      document.getElementById(
        "postal-code"
      )?.value.trim() || "",

    country:
      document.getElementById(
        "country"
      )?.value.trim() || ""
  };


  /* Prepare products for backend */

  const orderItems =
    items.map((item) => {

      const productId =
        item.productId ??
        item.product?.id ??
        item.id;


      return {

        productId,

        quantity:
          item.quantity,

        size:
          item.size || null,

        color:
          item.color || null
      };

    });


  /* Complete order payload */

  const orderData = {

    items: orderItems,

    customer: {

      name:
        customerName,

      email:
        customerEmail,

      phone:
        customerPhone
    },

    delivery,

    shippingMethod:
      selectedShipping,

    couponCode:
      appliedCoupon?.code || null,

    paymentMethod

  };


  /* ----------------------------------------------------------------------
     SEND ORDER TO BACKEND
     ---------------------------------------------------------------------- */

  try {

    const response =
      await fetch(
        `${API_BASE}/api/orders`,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            ...(localStorage.getItem("threadco_token")
              ? {
                  Authorization:
                    `Bearer ${localStorage.getItem("threadco_token")}`
                  }
              : {})

          },

          body:
            JSON.stringify(orderData)

        }
      );


    const result =
      await response.json();


    /* Backend error */

    if (!response.ok) {

      console.error(
        "Backend order error:",
        result
      );


      alert(
        result.error ||
        "Unable to place order. Please try again."
      );

      return;
    }


    /* --------------------------------------------------------------------
       ORDER CREATED SUCCESSFULLY
       -------------------------------------------------------------------- */

    console.log(
      "Order created successfully:",
      result
    );


    /* Save latest order for success UI */

    if (result.order) {

      localStorage.setItem(
        "threadco_last_order",
        JSON.stringify(
          result.order
        )
      );

    }


    /* Clear cart */

    clearCart();


    /* Clear coupon */

    appliedCoupon = null;

    localStorage.removeItem(
      "threadco_coupon"
    );


    /* Show order number */

    const orderNumberElement =
      document.getElementById(
        "success-order-number"
      );


    if (
      orderNumberElement &&
      result.order
    ) {

      orderNumberElement.textContent =
        result.order.order_number ||
        result.order.orderNumber ||
        "Confirmed";

    }


    /* Show success modal */

    const modal =
      document.getElementById(
        "order-success-modal"
      );


    if (modal) {

      modal.hidden = false;

    } else {

      alert(
        "Order placed successfully!"
      );

    }


  } catch (error) {

    console.error(
      "Order creation failed:",
      error
    );


    alert(
      "Unable to connect to the server. Please make sure the backend is running."
    );

  }

}


/* --------------------------------------------------------------------------
   EMPTY CART
   -------------------------------------------------------------------------- */

function renderEmptyCheckout() {

  const main =
    document.getElementById(
      "checkout-main"
    );


  if (!main) return;


  main.innerHTML = `

    <section
      class="container"
      style="
        min-height: 60vh;
        display: grid;
        place-items: center;
        text-align: center;
      "
    >

      <div>

        <p
          class="checkout-header__eyebrow"
        >
          YOUR BAG IS EMPTY
        </p>


        <h1
          style="
            margin-top: 10px;
          "
        >
          Nothing to check out yet.
        </h1>


        <p
          style="
            margin-top: 12px;
            color: var(--color-muted);
          "
        >
          Add something you love,
          then come back here.
        </p>


        <a
          href="products.html"
          class="btn btn--primary"
          style="
            margin-top: 24px;
          "
        >
          Continue shopping
        </a>

      </div>

    </section>
  `;
}


/* --------------------------------------------------------------------------
   EVENTS
   -------------------------------------------------------------------------- */

function attachEvents() {


  /* Shipping */

  document
    .querySelectorAll(
      'input[name="shipping"]'
    )
    .forEach((input) => {

      input.addEventListener(
        "change",
        updateShippingMethod
      );

    });


  /* Payment */

  document
    .querySelectorAll(
      'input[name="payment"]'
    )
    .forEach((input) => {

      input.addEventListener(
        "change",
        updatePaymentMethod
      );

    });


  /* Coupon */

  const couponForm =
    document.getElementById(
      "checkout-coupon-form"
    );


  if (couponForm) {

    couponForm.addEventListener(
      "submit",
      handleCoupon
    );

  }


  /* Checkout form */

  const checkoutForm =
    document.getElementById(
      "checkout-form"
    );


  if (checkoutForm) {

    checkoutForm.addEventListener(
      "submit",
      handlePlaceOrder
    );

  }


  /* Mobile summary */

  const summaryToggle =
    document.getElementById(
      "mobile-summary-toggle"
    );


  const summaryContent =
    document.getElementById(
      "mobile-summary-content"
    );


  if (
    summaryToggle &&
    summaryContent
  ) {

    summaryToggle.addEventListener(
      "click",
      () => {

        summaryContent.classList.toggle(
          "is-open"
        );

      }
    );

  }


  /* Card number */

  const cardNumber =
    document.getElementById(
      "card-number"
    );


  if (cardNumber) {

    cardNumber.addEventListener(
      "input",
      formatCardNumber
    );

  }


  /* Expiry */

  const expiry =
    document.getElementById(
      "expiry"
    );


  if (expiry) {

    expiry.addEventListener(
      "input",
      formatExpiry
    );

  }

}


/* --------------------------------------------------------------------------
   LIVE CART UPDATES
   -------------------------------------------------------------------------- */

window.addEventListener(
  "cart:updated",
  () => {

    const checkoutItems =
      document.getElementById(
        "checkout-items"
      );


    if (!checkoutItems) return;


    const items =
      getCartWithProductDetails();


    if (items.length === 0) {

      renderEmptyCheckout();

    } else {

      renderCheckout();

    }

  }
);