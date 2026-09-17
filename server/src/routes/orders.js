const express = require("express");
const pool = require("../db/pool");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING_FEE = 6.99;
const EXPRESS_SHIPPING_FEE = 12.99;
const COUPON_CODES = { WELCOME10: 0.1, SAVE20: 0.2 };

function generateOrderNumber() {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TC-${Date.now().toString().slice(-8)}${random}`;
}

/**
 * POST /api/orders
 * Creates a real order from the cart.
 * Only productId/size/color/quantity are trusted from the client.
 * Prices, stock, and totals are recalculated from the database.
 */
router.post("/", optionalAuth, async (req, res, next) => {
  const {
    items,
    customer,
    delivery,
    shippingMethod,
    paymentMethod,
    couponCode,
  } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty." });
  }

  if (!["cash", "card"].includes(paymentMethod)) {
    return res.status(400).json({ error: "Invalid payment method." });
  }

  if (!customer?.email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const client = await pool.connect();
  let order, orderItems, isCash, total;

  try {
    await client.query("BEGIN");

    const productIds = [...new Set(items.map((i) => Number(i.productId)))];

    const productsResult = await client.query(
      "SELECT * FROM products WHERE id = ANY($1::int[])",
      [productIds]
    );

    const productsById = new Map(
      productsResult.rows.map((p) => [p.id, p])
    );

    orderItems = [];

    for (const item of items) {
      const product = productsById.get(Number(item.productId));
      const quantity = Number(item.quantity);

      if (!product || !Number.isInteger(quantity) || quantity <= 0) {
        throw Object.assign(
          new Error(`Invalid item for product ${item.productId}.`),
          { status: 400 }
        );
      }

      if (product.stock < quantity) {
        throw Object.assign(
          new Error(
            `Not enough stock for "${product.name}" (only ${product.stock} left).`
          ),
          { status: 409 }
        );
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        size: item.size || null,
        color: item.color || null,
        quantity,
        unitPrice: Number(product.price),
      });
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const shipping =
      shippingMethod === "express"
        ? EXPRESS_SHIPPING_FEE
        : subtotal >= FREE_SHIPPING_THRESHOLD
          ? 0
          : FLAT_SHIPPING_FEE;

    const discountRate =
      couponCode && COUPON_CODES[couponCode]
        ? COUPON_CODES[couponCode]
        : 0;

    const discount = subtotal * discountRate;
    const tax = subtotal * TAX_RATE;

    total = subtotal + shipping + tax - discount;

    const orderNumber = generateOrderNumber();
    isCash = paymentMethod === "cash";

    const orderResult = await client.query(
      `INSERT INTO orders (
         order_number,
         user_id,
         customer_name,
         customer_email,
         customer_phone,
         address,
         apartment,
         city,
         state,
         postal_code,
         country,
         shipping_method,
         shipping_cost,
         subtotal,
         discount,
         tax,
         total,
         coupon_code,
         payment_method,
         payment_status,
         status
       )
       VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
         $12,$13,$14,$15,$16,$17,$18,$19,$20,$21
       )
       RETURNING *`,
      [
        orderNumber,
        req.user?.id ?? null,
        customer.name || "",
        customer.email,
        customer.phone || "",
        delivery?.address || "",
        delivery?.apartment || "",
        delivery?.city || "",
        delivery?.state || "",
        delivery?.postalCode || "",
        delivery?.country || "",
        shippingMethod === "express" ? "express" : "standard",
        shipping,
        subtotal,
        discount,
        tax,
        total,
        couponCode || null,
        paymentMethod,
        "paid",
        "placed",
      ]
    );

    order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           product_name,
           size,
           color,
           quantity,
           unit_price
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          order.id,
          item.productId,
          item.name,
          item.size,
          item.color,
          item.quantity,
          item.unitPrice,
        ]
      );

      const stockUpdate = await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1",
        [item.quantity, item.productId]
      );
      
      if (stockUpdate.rowCount !== 1) {
        throw Object.assign(
          new Error(`Not enough stock for "${item.name}".`),
          { status: 409 }
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    client.release();

    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }

    return next(err);
  }

  client.release();

  if (isCash) {
    return res.status(201).json({
      order,
      checkoutUrl: null,
    });
  }


    // Card payment is currently simulated for development.
    return res.status(201).json({
      order,
      checkoutUrl: null,
      paymentRequired: false,
      paymentStatus: "paid",
    });
  });   


/**
 * GET /api/orders/:orderNumber
 *
 * Used to retrieve an order after checkout.
 */

/* --------------------------------------------------------------------------
   GET ALL ORDERS FOR LOGGED-IN USER
   -------------------------------------------------------------------------- */

router.get("/", optionalAuth, async (req, res) => {

  try {

    if (!req.user) {

      return res.status(401).json({
        error: "Authentication required."
      });

    }


    const result = await pool.query(
      `
      SELECT
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'photo_url', p.photo_url,
              'size', oi.size,
              'color', oi.color,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price
            )
            ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items

      FROM orders o

      LEFT JOIN order_items oi
        ON oi.order_id = o.id
      LEFT JOIN products p
        ON p.id = oi.product_id  

      WHERE o.user_id = $1

      GROUP BY o.id

      ORDER BY o.created_at DESC
      `,
      [req.user.id]
    );


    res.json({
      orders: result.rows
    });


  } catch (error) {

    console.error(
      "Failed to fetch orders:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch orders."
    });

  }

});
router.get("/:orderNumber", optionalAuth, async (req, res, next) => {
  try {
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE order_number = $1",
      [req.params.orderNumber]
    );

    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (
      order.user_id &&
      (!req.user || req.user.id !== order.user_id)
    ) {
      return res.status(403).json({ error: "Not your order." });
    }

    const itemsResult = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [order.id]
    );

    res.json({
      order,
      items: itemsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;