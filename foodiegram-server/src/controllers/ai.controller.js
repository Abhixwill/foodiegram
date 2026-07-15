// Handles all AI requests (Caption generation, Hashtags, Recognition, Recipe generation, Nutrition analysis, and Chatbot).
// Delegates prompt engineering and API queries to gemini.service.js.

const asyncHandler = require("express-async-handler");
const geminiService = require("../services/gemini.service");
const { success, failure } = require("../utils/apiResponse");

/**
 * Extracts image URL from req.file (from Multer storage) or req.body.
 * @param {Object} req - Express request object
 * @returns {string|null} The image URL or null if not found
 */
const getImageUrl = (req) => {
  if (req.file && req.file.path) {
    return req.file.path; // Cloudinary secure URL from multer
  }
  if (req.body.imageUrl) {
    return req.body.imageUrl;
  }
  return null;
};

// @route   POST /api/ai/caption
// @access  Private
const generateCaption = asyncHandler(async (req, res) => {
  const imageUrl = getImageUrl(req);
  if (!imageUrl) {
    return failure(res, 400, "An image file or imageUrl is required");
  }

  const captions = await geminiService.generateCaption(imageUrl);
  return success(res, 200, "Captions generated successfully", { captions });
});

// @route   POST /api/ai/hashtags
// @access  Private
const generateHashtags = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const imageUrl = getImageUrl(req);

  if (!caption && !imageUrl) {
    return failure(res, 400, "Either a caption or an image is required");
  }

  const hashtags = await geminiService.generateHashtags(caption, imageUrl);
  return success(res, 200, "Hashtags suggested successfully", { hashtags });
});

// @route   POST /api/ai/recognize
// @access  Private
const recognizeFood = asyncHandler(async (req, res) => {
  const imageUrl = getImageUrl(req);
  if (!imageUrl) {
    return failure(res, 400, "An image file or imageUrl is required");
  }

  const result = await geminiService.recognizeFood(imageUrl);
  return success(res, 200, "Food recognized successfully", result);
});

// @route   POST /api/ai/recipe
// @access  Private
const generateRecipe = asyncHandler(async (req, res) => {
  const { dishName } = req.body;
  const imageUrl = getImageUrl(req);

  if (!dishName && !imageUrl) {
    return failure(res, 400, "Either a dish name or an image is required");
  }

  const recipe = await geminiService.generateRecipe(dishName, imageUrl);
  return success(res, 200, "Recipe generated successfully", { recipe });
});

// @route   POST /api/ai/nutrition
// @access  Private
const analyzeNutrition = asyncHandler(async (req, res) => {
  const { dishName } = req.body;
  const imageUrl = getImageUrl(req);

  if (!dishName && !imageUrl) {
    return failure(res, 400, "Either a dish name or an image is required");
  }

  const nutrition = await geminiService.analyzeNutrition(dishName, imageUrl);
  return success(res, 200, "Nutrition analyzed successfully", { nutrition });
});

// @route   POST /api/ai/chat
// @access  Private
const chat = asyncHandler(async (req, res) => {
  const { history, message } = req.body;

  if (!message || message.trim() === "") {
    return failure(res, 400, "Message content is required");
  }

  const chatHistory = Array.isArray(history) ? history : [];
  const reply = await geminiService.chat(chatHistory, message.trim());
  return success(res, 200, "Chat response generated", { reply });
});

module.exports = {
  generateCaption,
  generateHashtags,
  recognizeFood,
  generateRecipe,
  analyzeNutrition,
  chat,
};
