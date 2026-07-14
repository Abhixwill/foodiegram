const express = require("express");
const router = express.Router();

const { getProfile, updateProfile, searchUsers } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { uploadAvatar } = require("../middleware/upload.middleware");

// IMPORTANT: /search and /me must come before the dynamic /:username route
router.get("/search", searchUsers);
router.put("/me", protect, uploadAvatar.single("avatar"), updateProfile);
router.get("/:username", getProfile);

module.exports = router;
