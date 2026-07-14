// Handles user profiles, profile editing, and user search.

const asyncHandler = require("express-async-handler");
const prisma = require("../config/db");
const { success, failure, sanitizeUser } = require("../utils/apiResponse");

// @route   GET /api/users/:username
// @access  Public
// Returns a user's public profile along with their posts.
const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { likes: true, comments: true } },
        },
      },
      _count: { select: { posts: true } },
    },
  });

  if (!user) return failure(res, 404, "User not found");

  const { password, ...safeUser } = user;

  return success(res, 200, "Profile fetched", { user: safeUser });
});

// @route   PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  const data = {};

  if (name !== undefined) data.name = name;
  if (bio !== undefined) data.bio = bio;
  if (req.file) data.avatarUrl = req.file.path; // Cloudinary URL

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data,
  });

  return success(res, 200, "Profile updated", { user: sanitizeUser(updated) });
});

// @route   GET /api/users/search?q=term
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return success(res, 200, "Users fetched", { users: [] });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, username: true, avatarUrl: true, bio: true },
    take: 20,
  });

  return success(res, 200, "Users fetched", { users });
});

module.exports = { getProfile, updateProfile, searchUsers };
