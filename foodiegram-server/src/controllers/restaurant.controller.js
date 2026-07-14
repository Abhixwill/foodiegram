// Handles restaurant listing, details, creation, and search.

const asyncHandler = require("express-async-handler");
const prisma = require("../config/db");
const { success, failure } = require("../utils/apiResponse");

// @route   POST /api/restaurants
// @access  Private
const createRestaurant = asyncHandler(async (req, res) => {
  const { name, description, address, cuisine } = req.body;

  if (!name) return failure(res, 400, "Restaurant name is required");

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      description: description || "",
      address: address || "",
      cuisine: cuisine || "",
      coverImageUrl: req.file ? req.file.path : "",
      ownerId: req.user.id,
    },
  });

  return success(res, 201, "Restaurant created", { restaurant });
});

// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);
  const skip = (page - 1) * limit;

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { _count: { select: { posts: true } } },
    }),
    prisma.restaurant.count(),
  ]);

  return success(res, 200, "Restaurants fetched", {
    restaurants,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// @route   GET /api/restaurants/search?q=term
// @access  Public
const searchRestaurants = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return success(res, 200, "Restaurants fetched", { restaurants: [] });

  const restaurants = await prisma.restaurant.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { cuisine: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
  });

  return success(res, 200, "Restaurants fetched", { restaurants });
});

// @route   GET /api/restaurants/:id
// @access  Public
// Returns restaurant details along with all posts tagged to it.
const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      owner: { select: { id: true, name: true, username: true } },
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, username: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  });

  if (!restaurant) return failure(res, 404, "Restaurant not found");

  return success(res, 200, "Restaurant fetched", { restaurant });
});

// @route   PUT /api/restaurants/:id
// @access  Private (owner only)
const updateRestaurant = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.restaurant.findUnique({ where: { id } });

  if (!existing) return failure(res, 404, "Restaurant not found");
  if (existing.ownerId !== req.user.id) {
    return failure(res, 403, "You can only edit restaurants you added");
  }

  const { name, description, address, cuisine } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (address !== undefined) data.address = address;
  if (cuisine !== undefined) data.cuisine = cuisine;
  if (req.file) data.coverImageUrl = req.file.path;

  const updated = await prisma.restaurant.update({ where: { id }, data });
  return success(res, 200, "Restaurant updated", { restaurant: updated });
});

// @route   DELETE /api/restaurants/:id
// @access  Private (owner only)
const deleteRestaurant = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.restaurant.findUnique({ where: { id } });

  if (!existing) return failure(res, 404, "Restaurant not found");
  if (existing.ownerId !== req.user.id) {
    return failure(res, 403, "You can only delete restaurants you added");
  }

  await prisma.restaurant.delete({ where: { id } });
  return success(res, 200, "Restaurant deleted");
});

module.exports = {
  createRestaurant,
  getRestaurants,
  searchRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
