// Handles user registration, login, and fetching the logged-in user.

const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const prisma = require("../config/db");
const generateToken = require("../utils/generateToken");
const { success, failure, sanitizeUser } = require("../utils/apiResponse");

// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return failure(res, 400, "Please provide name, username, email and password");
  }

  if (password.length < 6) {
    return failure(res, 400, "Password must be at least 6 characters");
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return failure(res, 409, "A user with that email or username already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: { name, username, email, password: hashedPassword },
  });

  const token = generateToken(user.id);

  return success(res, 201, "Account created successfully", {
    token,
    user: sanitizeUser(user),
  });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return failure(res, 400, "Please provide email/username and password");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  if (!user) {
    return failure(res, 401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return failure(res, 401, "Invalid credentials");
  }

  const token = generateToken(user.id);

  return success(res, 200, "Logged in successfully", {
    token,
    user: sanitizeUser(user),
  });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is already sanitized by the protect middleware
  return success(res, 200, "Current user fetched", { user: req.user });
});

module.exports = { signup, login, getMe };
