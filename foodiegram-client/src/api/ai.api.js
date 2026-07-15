import api from "./axios";

/**
 * Generates captions for an image.
 * @param {FormData} formData - FormData containing the 'image' file
 */
export const generateCaptionApi = (formData) =>
  api.post("/ai/caption", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/**
 * Suggests hashtags for a caption or image.
 * @param {FormData|Object} data - FormData (with 'image'/'caption') or JSON object
 */
export const generateHashtagsApi = (data) => {
  if (data instanceof FormData) {
    return api.post("/ai/hashtags", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("/ai/hashtags", data);
};

/**
 * Identifies food name and cuisine from an image.
 * @param {FormData} formData - FormData containing the 'image' file
 */
export const recognizeFoodApi = (formData) =>
  api.post("/ai/recognize", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/**
 * Generates a recipe from a food name or an image file.
 * @param {FormData|Object} data - FormData (with 'image'/'dishName') or JSON object
 */
export const generateRecipeApi = (data) => {
  if (data instanceof FormData) {
    return api.post("/ai/recipe", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("/ai/recipe", data);
};

/**
 * Estimates nutritional information for a food name or an image file.
 * @param {FormData|Object} data - FormData (with 'image'/'dishName') or JSON object
 */
export const analyzeNutritionApi = (data) => {
  if (data instanceof FormData) {
    return api.post("/ai/nutrition", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("/ai/nutrition", data);
};

/**
 * Sends chat history and new message to the AI chatbot.
 * @param {Object} data - Object containing 'history' and 'message'
 */
export const chatbotChatApi = (data) => api.post("/ai/chat", data);
