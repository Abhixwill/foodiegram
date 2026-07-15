// Local verification script for Google Gemini Service.
// Run this directly from the server root folder: `node test-ai.js`

require("dotenv").config();
const geminiService = require("./src/services/gemini.service");

console.log("🔍 Testing Gemini Service Imports...");
if (
  geminiService.generateCaption &&
  geminiService.generateHashtags &&
  geminiService.recognizeFood &&
  geminiService.generateRecipe &&
  geminiService.analyzeNutrition &&
  geminiService.chat
) {
  console.log("✅ All service methods imported successfully!");
} else {
  console.error("❌ Some service methods are missing.");
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log("⚠️ GEMINI_API_KEY is not defined in the server's .env file.");
  console.log("👉 Add it inside C:/Users/hp/Desktop/Foodiegram/foodiegram-server/.env to test actual API calls.");
  console.log("Import test passed successfully.");
  process.exit(0);
}

const runTest = async () => {
  try {
    console.log("🔍 Fetching available models from Gemini API...");
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await fetch(listUrl);
    if (listRes.ok) {
      const listData = await listRes.json();
      console.log("📋 Available Models:");
      listData.models?.forEach(m => console.log(` - ${m.name}`));
    } else {
      console.log("⚠️ Failed to list models:", listRes.status, listRes.statusText);
    }

    console.log("\n🚀 Testing Chatbot response with gemini-3.5-flash...");
    const reply = await geminiService.chat(
      [],
      "Recommend a quick breakfast recipe using eggs and bread."
    );
    console.log("🤖 Chatbot response: \n", reply);
    console.log("\n✅ API connection and execution succeeded!");
  } catch (error) {
    console.error("❌ API execution failed:", error.message);
  }
};

runTest();
