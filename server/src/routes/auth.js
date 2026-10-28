const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const pool = require("../db/pool");
const { requireAuth, signToken } = require("../middleware/auth");

const router = express.Router();

const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Slow down credential-guessing: 10 attempts per 15 minutes per IP,
// shared across signup and login (both are places to brute-force from).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

function toPublicUser(row) {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone ?? undefined };
}

/**
 * POST /api/auth/signup
 * body: { name, email, password, phone? }
 */
router.post("/signup", authLimiter, async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone`,
      [name.trim(), email.trim(), passwordHash, phone ?? null]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    const user = result.rows[0];

    // Deliberately identical error for "no such user" and "wrong password" --
    // distinguishing them lets an attacker enumerate which emails have
    // accounts.
    const genericError = { error: "Incorrect email or password." };
    if (!user) {
      return res.status(401).json(genericError);
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json(genericError);
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/reset-password
 * body: { email, newPassword }
 */
router.post("/reset-password", authLimiter, async (req, res, next) => {
  try {
    const { email, newPassword } = req.body || {};

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const userRes = await pool.query(
      "SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "No account found with this email address." });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2",
      [passwordHash, userRes.rows[0].id]
    );

    res.json({ message: "Password reset successfully! Please sign in with your new password." });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 * Lets the frontend check "am I still logged in?" on page load without
 * re-sending a password, and get fresh user details.
 */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User no longer exists." });
    }
    res.json({ user: toPublicUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});


/**
 * PUT /api/auth/profile
 * header: Authorization: Bearer <token>
 * body: { name?, phone?, currentPassword?, newPassword? }
 * Updates the authenticated user's profile fields.
 */
router.put("/profile", requireAuth, async (req, res, next) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body || {};
    const userId = req.user.id;

    // Fetch current user
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    const user = userResult.rows[0];

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set a new password." });
      }
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters." });
      }
      const matches = await bcrypt.compare(currentPassword, user.password_hash);
      if (!matches) {
        return res.status(401).json({ error: "Current password is incorrect." });
      }
    }

    // Build update fields
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined && typeof name === "string" && name.trim().length > 0) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone || null);
    }

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    values.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, name, email, phone`,
      values
    );

    res.json({ user: toPublicUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
