// Protects routes by requiring a valid JWT in the Authorization header.
// On success, attaches the authenticated user (minus password) to req.user.

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const prisma = require("../config/db");
const { sanitizeUser } = require("../utils/apiResponse");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user no longer exists");
    }

    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

// Optional auth: attaches req.user if a valid token is present,
// but does NOT block the request if there isn't one.
// Useful for routes like "get post" where likedByMe depends on the viewer.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (user) req.user = sanitizeUser(user);
    } catch (err) {
      // Invalid token on an optional route just means "treat as guest"
    }
  }
  next();
});

module.exports = { protect, optionalAuth };
