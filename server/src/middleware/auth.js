const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is not set. Copy server/.env.example to server/.env and fill it in."
  );
  process.exit(1);
}

/**
 * Reads "Authorization: Bearer <token>", verifies it, and attaches
 * req.user = { id, email } if valid. Responds 401 on anything else --
 * missing header, malformed token, expired token, wrong signature.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

/**
 * Like requireAuth, but never rejects.
 * If a valid Bearer token is present, attach req.user.
 * Otherwise continue as a guest.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme === "Bearer" && token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.sub, email: payload.email };
    } catch (err) {
      // Invalid or expired token: treat the request as a guest.
    }
  }

  next();
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { requireAuth, optionalAuth, signToken };