require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "unreachable", message: err.message });
  }
});

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);

// 404 for anything under /api that isn't handled above
app.use("/api", (req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Thread & Co. API listening on http://localhost:${PORT}`);
});
