const express = require("express");
const router = express.Router();

const {
  createRestaurant,
  getRestaurants,
  searchRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurant.controller");

const { protect } = require("../middleware/auth.middleware");
const { uploadRestaurantImage } = require("../middleware/upload.middleware");

// IMPORTANT: /search must come before the dynamic /:id route
router.get("/search", searchRestaurants);
router.get("/", getRestaurants);
router.post("/", protect, uploadRestaurantImage.single("image"), createRestaurant);
router.get("/:id", getRestaurantById);
router.put("/:id", protect, uploadRestaurantImage.single("image"), updateRestaurant);
router.delete("/:id", protect, deleteRestaurant);

module.exports = router;
