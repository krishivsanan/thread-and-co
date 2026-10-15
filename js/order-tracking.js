/* ==========================================================================
   ORDER TRACKING (help.html#track)
   --------------------------------------------------------------------------
   Queries GET /api/orders/:orderNumber to track real-time order status.
   ========================================================================== */

(() => {
  const API_BASE = (window.THREADCO_API_BASE || "http://localhost:4000/api").replace(/\/$/, "");

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("order-tracker-form");
    const input = document.getElementById("tracker-order-number");
    const resultContainer = document.getElementById("tracker-result");
    const submitBtn = document.getElementById("tracker-submit-btn");

    if (!form || !input || !resultContainer) return;

    // Auto-fill from URL params if available (e.g. help.html?order=TC-1234#track)
    const urlParams = new URLSearchParams(window.location.search);
    const initialOrder = urlParams.get("order") || urlParams.get("orderNumber");
    if (initialOrder) {
      input.value = initialOrder.trim();
      trackOrder(initialOrder.trim());
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const orderNumber = input.value.trim();
      if (!orderNumber) {
        showError("Please enter a valid order number.");
        return;
      }
      trackOrder(orderNumber);
    });

    async function trackOrder(orderNumber) {
      setLoading(true);

      const token = localStorage.getItem("threadco_token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}`, {
          method: "GET",
          headers,
        });

        const data = await response.json();

        if (response.status === 404) {
          showError(`Order <strong>${escapeHtml(orderNumber)}</strong> was not found. Please verify the order number from your confirmation email.`);
          return;
        }

        if (response.status === 403) {
          showError(`This order is associated with a registered account. Please <a href="login.html" class="tracker-error__link">sign in to your account</a> to track it.`);
          return;
        }

        if (!response.ok) {
          showError(data.error || "Unable to retrieve order details. Please try again later.");
          return;
        }

        renderOrderResult(data.order, data.items || []);
      } catch (err) {
        console.error("Order tracking error:", err);
        showError("Could not connect to the server. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }

    function setLoading(isLoading) {
      if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? "Checking..." : "Track";
      }
      if (isLoading) {
        resultContainer.innerHTML = `
          <div class="order-tracker__loading">
            <span class="order-tracker__spinner" aria-hidden="true"></span>
            <p>Looking up order details...</p>
          </div>
        `;
      }
    }

    function showError(message) {
      resultContainer.innerHTML = `
        <div class="order-tracker__status order-tracker__status--error">
          <div class="order-tracker__status-icon">⚠️</div>
          <div class="order-tracker__status-body">
            <p>${message}</p>
          </div>
        </div>
      `;
    }

    function renderOrderResult(order, items) {
      const orderNumber = order.order_number || order.orderNumber || "Order";
      const rawStatus = (order.status || "placed").toLowerCase();
      const statusLabel = getStatusLabel(rawStatus);
      const placedDate = formatDate(order.created_at || order.createdAt);
      const total = Number(order.total || 0).toFixed(2);
      const shippingMethod = order.shipping_method || "Standard";

      const addressParts = [
        order.address,
        order.apartment,
        order.city,
        order.state,
        order.postal_code,
        order.country,
      ].filter(Boolean).join(", ");

      const steps = [
        { key: "placed", label: "Placed" },
        { key: "processing", label: "Processing" },
        { key: "shipped", label: "Shipped" },
        { key: "delivered", label: "Delivered" },
      ];

      const currentStepIndex = getStepIndex(rawStatus);

      const timelineHtml = `
        <div class="tracker-timeline">
          ${steps.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return `
              <div class="tracker-timeline__step ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}">
                <div class="tracker-timeline__dot"></div>
                <span class="tracker-timeline__label">${step.label}</span>
              </div>
            `;
          }).join("")}
        </div>
      `;

      const itemsHtml = items.map((item) => {
        const name = escapeHtml(item.product_name || item.name || "Item");
        const qty = item.quantity || 1;
        const price = Number(item.unit_price || 0).toFixed(2);
        const variant = [item.size, item.color].filter(Boolean).join(" · ");
        const photo = item.photo_url || "assets/images/products/1.jpg";

        return `
          <div class="tracker-item">
            <img src="${photo}" alt="${name}" class="tracker-item__img" onerror="this.src='assets/images/products/1.jpg'" />
            <div class="tracker-item__details">
              <span class="tracker-item__name">${name}</span>
              <span class="tracker-item__meta">${variant ? variant + " · " : ""}Qty ${qty}</span>
            </div>
            <span class="tracker-item__price">$${price}</span>
          </div>
        `;
      }).join("");

      resultContainer.innerHTML = `
        <div class="order-tracker__card">
          <div class="order-tracker__header">
            <div>
              <span class="order-tracker__badge-order">${escapeHtml(orderNumber)}</span>
              <p class="order-tracker__date">Placed on ${placedDate}</p>
            </div>
            <span class="order-tracker__badge order-tracker__badge--${rawStatus}">
              ${statusLabel}
            </span>
          </div>

          ${timelineHtml}

          <div class="order-tracker__meta-grid">
            <div>
              <span class="order-tracker__meta-label">Shipping Method</span>
              <span class="order-tracker__meta-val">${escapeHtml(shippingMethod)}</span>
            </div>
            <div>
              <span class="order-tracker__meta-label">Total Amount</span>
              <span class="order-tracker__meta-val">$${total}</span>
            </div>
            ${addressParts ? `
              <div class="order-tracker__meta-full">
                <span class="order-tracker__meta-label">Delivery Address</span>
                <span class="order-tracker__meta-val">${escapeHtml(addressParts)}</span>
              </div>
            ` : ""}
          </div>

          ${items.length > 0 ? `
            <div class="order-tracker__items-section">
              <span class="order-tracker__meta-label">Order Items (${items.length})</span>
              <div class="order-tracker__items-list">
                ${itemsHtml}
              </div>
            </div>
          ` : ""}
        </div>
      `;
    }

    function getStatusLabel(status) {
      switch (status) {
        case "placed": return "Order Placed";
        case "processing": return "Processing";
        case "shipped": return "Shipped";
        case "delivered": return "Delivered";
        case "cancelled": return "Cancelled";
        default: return status.charAt(0).toUpperCase() + status.slice(1);
      }
    }

    function getStepIndex(status) {
      switch (status) {
        case "placed": return 0;
        case "processing": return 1;
        case "shipped": return 2;
        case "delivered": return 3;
        case "cancelled": return -1;
        default: return 0;
      }
    }

    function formatDate(dateStr) {
      if (!dateStr) return "Recent";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    function escapeHtml(str) {
      if (!str) return "";
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }
  });
})();
