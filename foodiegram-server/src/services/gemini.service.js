// Google Gemini API service wrapper.
// Uses native Node fetch (v18+) to communicate with the Gemini API.
// Avoids external dependencies like @google/generative-ai for portability and ease of setup.

const fetch = globalThis.fetch;

/**
 * Downloads an image from a URL and converts it to base64 + mimetype.
 * Useful for processing images uploaded to Cloudinary.
 * @param {string} url - The URL of the image
 * @returns {Promise<{ mimeType: string, data: string }>}
 */
const downloadImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    return {
      mimeType,
      data: buffer.toString("base64"),
    };
  } catch (error) {
    console.error("Error downloading image:", error);
    throw new Error("Failed to process image for AI analysis");
  }
};

/**
 * Sends a content generation request to the Gemini API.
 * @param {Array} contents - The contents array conforming to Gemini format
 * @param {boolean} jsonMode - If true, configures the API to return JSON
 * @param {string} systemInstructionText - Optional system prompt
 * @returns {Promise<string>} The generated text content
 */
const callGemini = async (contents, jsonMode = false, systemInstructionText = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your server .env file.");
  }

  // gemini-3.5-flash is extremely fast, cost-effective, and excels at multimodal tasks
  const model = "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents,
  };

  if (jsonMode) {
    body.generationConfig = {
      responseMimeType: "application/json",
    };
  }

  if (systemInstructionText) {
    body.systemInstruction = {
      parts: [
        {
          text: systemInstructionText,
        },
      ],
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API error response:", errText);
    throw new Error(`Gemini API returned error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini did not return any content");
  }

  return text;
};

/**
 * Generates creative food captions from an image URL.
 * @param {string} imageUrl - The image URL
 * @returns {Promise<Array<string>>} List of 3 suggested captions
 */
const generateCaption = async (imageUrl) => {
  const imageData = await downloadImageAsBase64(imageUrl);

  const contents = [
    {
      parts: [
        {
          text: "Analyze this food image and generate 3 engaging, creative, and mouth-watering captions for a social media post. Return a JSON array of exactly 3 strings.",
        },
        {
          inlineData: imageData,
        },
      ],
    },
  ];

  const rawJson = await callGemini(contents, true);
  return JSON.parse(rawJson);
};

/**
 * Suggests relevant food hashtags from caption text and/or an image.
 * @param {string} [caption] - The caption text
 * @param {string} [imageUrl] - Optional image URL
 * @returns {Promise<Array<string>>} List of suggested hashtags (without '#' prefix)
 */
const generateHashtags = async (caption, imageUrl) => {
  const parts = [
    {
      text: `Suggest 10-15 relevant, high-performing food hashtags.
      ${caption ? `Analyze this caption for context: "${caption}"` : ""}
      Return a JSON array of strings (excluding the '#' prefix, e.g. ["foodie", "pizza", "delicious"]).`,
    },
  ];

  if (imageUrl) {
    const imageData = await downloadImageAsBase64(imageUrl);
    parts.push({ inlineData: imageData });
  }

  const contents = [{ parts }];
  const rawJson = await callGemini(contents, true);
  return JSON.parse(rawJson);
};

/**
 * Recognizes the main dish name and cuisine from an image.
 * @param {string} imageUrl - The image URL
 * @returns {Promise<{ dishName: string, cuisine: string }>}
 */
const recognizeFood = async (imageUrl) => {
  const imageData = await downloadImageAsBase64(imageUrl);

  const contents = [
    {
      parts: [
        {
          text: "Analyze this food image. Identify the main dish name and the cuisine type (e.g. Italian, Indian, Mexican, Chinese, Fusion). Return a JSON object with keys: 'dishName' (string) and 'cuisine' (string). Keep it brief.",
        },
        {
          inlineData: imageData,
        },
      ],
    },
  ];

  const rawJson = await callGemini(contents, true);
  return JSON.parse(rawJson);
};

/**
 * Generates a recipe from a dish name or an image.
 * @param {string} [dishName] - Name of the dish
 * @param {string} [imageUrl] - Optional image URL
 * @returns {Promise<Object>} The generated recipe object
 */
const generateRecipe = async (dishName, imageUrl) => {
  const parts = [
    {
      text: `Generate a detailed recipe.
      ${dishName ? `Specifically for the dish: "${dishName}"` : "Analyze the provided image to identify the dish and generate a recipe for it."}
      Return a JSON object with the following fields:
      - 'title' (string): Name of the recipe
      - 'description' (string): Brief mouth-watering summary
      - 'prepTime' (string): Preparation time (e.g. '15 mins')
      - 'cookTime' (string): Cooking time (e.g. '30 mins')
      - 'difficulty' (string): 'Easy', 'Medium', or 'Hard'
      - 'ingredients' (array of strings): Detailed ingredients with quantities
      - 'steps' (array of strings): Step-by-step cooking instructions`,
    },
  ];

  if (imageUrl) {
    const imageData = await downloadImageAsBase64(imageUrl);
    parts.push({ inlineData: imageData });
  }

  const contents = [{ parts }];
  const rawJson = await callGemini(contents, true);
  return JSON.parse(rawJson);
};

/**
 * Estimates nutritional details of a dish.
 * @param {string} [dishName] - Name of the dish
 * @param {string} [imageUrl] - Optional image URL
 * @returns {Promise<Object>} The nutrition details object
 */
const analyzeNutrition = async (dishName, imageUrl) => {
  const parts = [
    {
      text: `Estimate the nutritional values per serving.
      ${dishName ? `Specifically for the dish: "${dishName}"` : "Analyze the provided image to identify the dish and analyze its nutrition."}
      Return a JSON object with the following fields:
      - 'calories' (number): total calories in kcal
      - 'protein' (number): grams of protein (integer)
      - 'carbs' (number): grams of carbohydrates (integer)
      - 'fats' (number): grams of fats (integer)
      - 'servingSize' (string): standard serving size (e.g., '1 plate', '1 bowl', '100g')
      - 'nutritionalNotes' (string): A short, professional analysis of the nutritional value (max 2 sentences).`,
    },
  ];

  if (imageUrl) {
    const imageData = await downloadImageAsBase64(imageUrl);
    parts.push({ inlineData: imageData });
  }

  const contents = [{ parts }];
  const rawJson = await callGemini(contents, true);
  return JSON.parse(rawJson);
};

/**
 * Generates a response for the food assistant chatbot.
 * @param {Array} history - The chat message history
 * @param {string} message - The new user message
 * @returns {Promise<string>} The chatbot's reply
 */
const chat = async (history, message) => {
  // Map conversation history to Gemini API format
  const contents = history.map((item) => ({
    role: item.role === "user" ? "user" : "model",
    parts: [{ text: item.text }],
  }));

  // Append new user message
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  const systemInstruction = `You are FoodieBot, a helpful, passionate AI food assistant on the FoodieGram social platform.
  Your goal is to answer food-related questions, suggest recipes, explain cooking techniques, recommend dish pairings, and advise on cuisines and restaurants.
  Always maintain a warm, welcoming, and food-loving tone. Use emojis where appropriate.
  If a user asks anything completely unrelated to food, drinks, cooking, or dining, politely guide them back to culinary topics.
  Keep responses concise, formatted nicely with markdown and bullet points for readability.`;

  return await callGemini(contents, false, systemInstruction);
};

module.exports = {
  generateCaption,
  generateHashtags,
  recognizeFood,
  generateRecipe,
  analyzeNutrition,
  chat,
};
