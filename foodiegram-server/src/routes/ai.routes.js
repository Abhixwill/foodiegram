// Defines AI routing endpoints. Protects all endpoints via protect middleware.
// Mounts uploadPostImage.single("image") for routes that accept image file uploads.

const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth.middleware");
const { uploadPostImage } = require("../middleware/upload.middleware");

// Protect all routes: only logged-in users can use AI features
router.use(protect);

// Endpoints
router.post("/caption", uploadPostImage.single("image"), aiController.generateCaption);
router.post("/hashtags", uploadPostImage.single("image"), aiController.generateHashtags);
router.post("/recognize", uploadPostImage.single("image"), aiController.recognizeFood);
router.post("/recipe", uploadPostImage.single("image"), aiController.generateRecipe);
router.post("/nutrition", uploadPostImage.single("image"), aiController.analyzeNutrition);
router.post("/chat", aiController.chat);

module.exports = router;
