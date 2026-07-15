import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChefHat,
  Flame,
  MessageSquare,
  Utensils,
  BookOpen,
  HeartPulse,
  Clock,
  Send,
  Upload,
  ArrowRight,
  Check,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

import {
  recognizeFoodApi,
  analyzeNutritionApi,
  generateRecipeApi,
  chatbotChatApi
} from "../api/ai.api";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

const AiHub = () => {
  const [activeTab, setActiveTab] = useState("recognize"); // 'recognize' | 'recipe' | 'chat'

  // --- Recognition & Nutrition State ---
  const [recImage, setRecImage] = useState(null);
  const [recPreview, setRecPreview] = useState("");
  const [recLoading, setRecLoading] = useState(false);
  const [recResult, setRecResult] = useState(null); // { dishName, cuisine, nutrition: { calories, protein, carbs, fats, servingSize, nutritionalNotes } }
  const recFileInputRef = useRef(null);

  // --- Recipe Generator State ---
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeImage, setRecipeImage] = useState(null);
  const [recipePreview, setRecipePreview] = useState("");
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState(null); // { title, description, prepTime, cookTime, difficulty, ingredients: [], steps: [] }
  const recipeFileInputRef = useRef(null);

  // --- Chatbot State ---
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: "👋 Hi there! I'm FoodieBot, your AI culinary assistant. Ask me anything about recipes, ingredients, cuisines, or matching drinks. I can even help you plan meals!"
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // --- Helpers for Nutrition & Recognition ---
  const handleRecFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRecImage(file);
    setRecPreview(URL.createObjectURL(file));
    setRecResult(null);
  };

  const handleRecAnalyze = async (e) => {
    e.preventDefault();
    if (!recImage) {
      toast.error("Please upload a food photo first");
      return;
    }

    setRecLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", recImage);

      // 1. Recognize the food
      const recRes = await recognizeFoodApi(formData);
      const { dishName, cuisine } = recRes.data;

      // 2. Fetch the nutrition details
      // We pass the same image in a separate API call to keep endpoints clean
      const nutrRes = await analyzeNutritionApi(formData);
      const { nutrition } = nutrRes.data;

      setRecResult({
        dishName,
        cuisine,
        nutrition
      });
      toast.success("Analysis complete!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to analyze food");
    } finally {
      setRecLoading(false);
    }
  };

  // --- Helpers for Recipe Generator ---
  const handleRecipeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRecipeImage(file);
    setRecipePreview(URL.createObjectURL(file));
    setRecipeResult(null);
  };

  const handleRecipeGenerate = async (e) => {
    e.preventDefault();
    if (!recipeSearch && !recipeImage) {
      toast.error("Please enter a dish name or upload a photo");
      return;
    }

    setRecipeLoading(true);
    try {
      let res;
      if (recipeImage) {
        const formData = new FormData();
        formData.append("image", recipeImage);
        if (recipeSearch) formData.append("dishName", recipeSearch);
        res = await generateRecipeApi(formData);
      } else {
        res = await generateRecipeApi({ dishName: recipeSearch });
      }

      setRecipeResult(res.data.recipe);
      toast.success("Recipe generated!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate recipe");
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleUseRecognizedForRecipe = (dishName) => {
    setRecipeSearch(dishName);
    setRecipeImage(null);
    setRecipePreview("");
    setRecipeResult(null);
    setActiveTab("recipe");
  };

  // --- Helpers for Chatbot ---
  const handleSendMessage = async (e, directText = null) => {
    if (e) e.preventDefault();
    const textToSend = directText || chatMessage;
    if (!textToSend.trim()) return;

    if (!directText) setChatMessage("");
    setChatHistory((prev) => [...prev, { role: "user", text: textToSend }]);
    setChatLoading(true);

    try {
      // Map frontend history to the structure backend expects
      const res = await chatbotChatApi({
        history: chatHistory.slice(1), // omit the custom welcome message from api history
        message: textToSend
      });

      setChatHistory((prev) => [...prev, { role: "model", text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      toast.error("FoodieBot encountered an error");
    } finally {
      setChatLoading(false);
    }
  };

  // Quick Chat Suggestion Chips
  const suggestions = [
    "Recommend a healthy dinner recipe",
    "What can I cook with pasta and tomatoes?",
    "Suggest popular street foods in Mexico",
    "Is avocado good for weight loss?"
  ];

  return (
    <div className="page-container max-w-4xl pt-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-coral-500 to-amber-500 shadow-lg text-white mb-3"
        >
          <Sparkles className="h-7 w-7" />
        </motion.div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-coral-600 to-amber-600 dark:from-coral-300 dark:to-amber-300 bg-clip-text text-transparent">
          AI Culinary Kitchen
        </h1>
        <p className="text-sm mt-1 text-ink-900/60 dark:text-amber-50/60">
          Identify food, generate macros, create recipes, and chat with FoodieBot.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-coral-200/40 dark:border-white/10 mb-8 p-1 glass rounded-2xl max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab("recognize")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "recognize"
              ? "bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-md"
              : "hover:bg-coral-500/10 text-ink-900/70 dark:text-amber-50/70"
          }`}
        >
          <HeartPulse className="h-4 w-4" />
          Recognition & Nutrition
        </button>
        <button
          onClick={() => setActiveTab("recipe")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "recipe"
              ? "bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-md"
              : "hover:bg-coral-500/10 text-ink-900/70 dark:text-amber-50/70"
          }`}
        >
          <ChefHat className="h-4 w-4" />
          Recipe Maker
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "chat"
              ? "bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-md"
              : "hover:bg-coral-500/10 text-ink-900/70 dark:text-amber-50/70"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          AI Chatbot
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === "recognize" && (
          <motion.div
            key="recognize-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Input Form */}
            <div className="md:col-span-5 space-y-4">
              <div className="glass rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-coral-500" />
                  Upload Food Photo
                </h2>

                <form onSubmit={handleRecAnalyze} className="space-y-4">
                  <label className="block cursor-pointer">
                    {recPreview ? (
                      <div className="relative group rounded-2xl overflow-hidden shadow-md">
                        <img
                          src={recPreview}
                          alt="To analyze"
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full bg-coral-500 shadow-md">
                            Change Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-64 rounded-2xl border-2 border-dashed border-coral-300 dark:border-white/20 flex flex-col items-center justify-center gap-2 text-coral-400 dark:text-amber-200/50 hover:bg-coral-500/5 dark:hover:bg-white/5 transition-colors">
                        <Upload className="h-10 w-10" />
                        <span className="text-sm font-medium">Drag food photo here</span>
                        <span className="text-xs text-ink-900/40 dark:text-amber-50/40">
                          Supports PNG, JPG, WEBP
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={recFileInputRef}
                      accept="image/*"
                      onChange={handleRecFileChange}
                      className="hidden"
                    />
                  </label>

                  <Button
                    type="submit"
                    loading={recLoading}
                    disabled={!recImage}
                    className="w-full"
                  >
                    Analyze Dish
                  </Button>
                </form>
              </div>
            </div>

            {/* Results Display */}
            <div className="md:col-span-7">
              {recLoading ? (
                <div className="glass rounded-3xl p-10 h-full flex flex-col items-center justify-center min-h-[300px]">
                  <Loader label="AI is recognizing your food and calculating macros..." />
                </div>
              ) : recResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-3xl p-6 space-y-6"
                >
                  {/* Title & Cuisine */}
                  <div>
                    <span className="text-xs font-extrabold tracking-widest text-coral-500 uppercase">
                      {recResult.cuisine} Cuisine
                    </span>
                    <h2 className="text-2xl font-black mt-1 leading-tight text-ink-900 dark:text-white">
                      {recResult.dishName}
                    </h2>
                  </div>

                  {/* Nutrition Dashboard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Calorie Dial */}
                    <div className="col-span-2 sm:col-span-2 glass-strong rounded-2xl p-4 flex flex-col items-center justify-center text-center border-l-4 border-coral-500">
                      <Flame className="h-6 w-6 text-coral-500 mb-1" />
                      <span className="text-3xl font-black text-ink-900 dark:text-white">
                        {recResult.nutrition.calories}
                      </span>
                      <span className="text-xs text-ink-900/50 dark:text-amber-50/50 font-medium">
                        Calories (kcal)
                      </span>
                      <span className="text-[10px] text-ink-900/30 dark:text-amber-50/30 mt-1">
                        per {recResult.nutrition.servingSize}
                      </span>
                    </div>

                    {/* Macros */}
                    <div className="col-span-2 sm:col-span-2 space-y-2 flex flex-col justify-center">
                      {/* Protein */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-0.5">
                          <span className="text-coral-600 dark:text-coral-400">Protein</span>
                          <span>{recResult.nutrition.protein}g</span>
                        </div>
                        <div className="h-2 bg-coral-100 dark:bg-ink-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-coral-500 rounded-full"
                            style={{ width: `${Math.min((recResult.nutrition.protein / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Carbs */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-0.5">
                          <span className="text-blue-500">Carbs</span>
                          <span>{recResult.nutrition.carbs}g</span>
                        </div>
                        <div className="h-2 bg-blue-100 dark:bg-ink-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((recResult.nutrition.carbs / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Fats */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-0.5">
                          <span className="text-amber-600 dark:text-amber-400">Fats</span>
                          <span>{recResult.nutrition.fats}g</span>
                        </div>
                        <div className="h-2 bg-amber-100 dark:bg-ink-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min((recResult.nutrition.fats / 40) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {recResult.nutrition.nutritionalNotes && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-ink-900/80 dark:text-amber-50/80 leading-relaxed">
                        <span className="font-bold block text-amber-600 dark:text-amber-300 mb-0.5">
                          Nutrition Note:
                        </span>
                        {recResult.nutrition.nutritionalNotes}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleUseRecognizedForRecipe(recResult.dishName)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ChefHat className="h-4 w-4" />
                      Generate Recipe for this Dish
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="glass rounded-3xl p-10 h-full flex flex-col items-center justify-center text-center text-ink-900/40 dark:text-amber-50/40 min-h-[300px]">
                  <Utensils className="h-10 w-10 text-coral-300 mb-3" />
                  <p className="text-sm font-medium max-w-xs">
                    Upload a food picture on the left and click "Analyze Dish" to view nutritional specs.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "recipe" && (
          <motion.div
            key="recipe-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Input Form */}
            <div className="md:col-span-5 space-y-4">
              <div className="glass rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-coral-500" />
                  Recipe Parameters
                </h2>

                <form onSubmit={handleRecipeGenerate} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-ink-900/60 dark:text-amber-50/60">
                      Dish Name (e.g. Lasagna)
                    </label>
                    <input
                      type="text"
                      value={recipeSearch}
                      onChange={(e) => setRecipeSearch(e.target.value)}
                      placeholder="e.g. Margherita Pizza, Chocolate Cookie"
                      className="input-field"
                    />
                  </div>

                  <div className="text-center text-xs font-bold text-ink-900/40 dark:text-amber-50/40 my-2">
                    — OR UPLOAD AN IMAGE —
                  </div>

                  <label className="block cursor-pointer">
                    {recipePreview ? (
                      <div className="relative group rounded-2xl overflow-hidden shadow-sm border border-coral-200/40">
                        <img
                          src={recipePreview}
                          alt="To recognize"
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full bg-coral-500 shadow-md">
                            Change Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-44 rounded-2xl border-2 border-dashed border-coral-300 dark:border-white/20 flex flex-col items-center justify-center gap-1.5 text-coral-400 hover:bg-coral-500/5 transition-colors">
                        <Upload className="h-8 w-8" />
                        <span className="text-xs font-semibold">Upload Finished Dish Photo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={recipeFileInputRef}
                      accept="image/*"
                      onChange={handleRecipeFileChange}
                      className="hidden"
                    />
                  </label>

                  <Button
                    type="submit"
                    loading={recipeLoading}
                    disabled={!recipeSearch && !recipeImage}
                    className="w-full"
                  >
                    Generate Full Recipe
                  </Button>
                </form>
              </div>
            </div>

            {/* Results Display */}
            <div className="md:col-span-7">
              {recipeLoading ? (
                <div className="glass rounded-3xl p-10 h-full flex flex-col items-center justify-center min-h-[350px]">
                  <Loader label="AI is detailing prep time, difficulty, ingredients and steps..." />
                </div>
              ) : recipeResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-3xl p-6 space-y-6 max-h-[80vh] overflow-y-auto"
                >
                  {/* Header info */}
                  <div>
                    <div className="flex gap-2 flex-wrap mb-1">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full glass border border-coral-200 text-coral-600 dark:text-amber-200">
                        {recipeResult.difficulty}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full glass border border-coral-200 text-coral-600 dark:text-amber-200 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Prep: {recipeResult.prepTime} | Cook: {recipeResult.cookTime}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black mt-2 text-ink-900 dark:text-white leading-tight">
                      {recipeResult.title}
                    </h2>
                    <p className="text-xs mt-1 text-ink-900/60 dark:text-amber-50/60 italic">
                      "{recipeResult.description}"
                    </p>
                  </div>

                  {/* Ingredients with interactive checklist */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-coral-600 dark:text-amber-300 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Ingredients Checklist
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recipeResult.ingredients.map((ing, i) => (
                        <li key={i} className="text-xs">
                          <label className="flex items-start gap-2.5 p-2 rounded-xl bg-coral-500/5 hover:bg-coral-500/10 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-coral-300 text-coral-500 focus:ring-coral-400 mt-0.5 cursor-pointer h-4 w-4"
                            />
                            <span className="text-ink-900/80 dark:text-amber-50/80">
                              {ing}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-coral-600 dark:text-amber-300 flex items-center gap-2">
                      <ChefHat className="h-4 w-4" /> Cooking Instructions
                    </h3>
                    <ol className="space-y-3">
                      {recipeResult.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-coral-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-xs leading-relaxed text-ink-900/85 dark:text-amber-50/85">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              ) : (
                <div className="glass rounded-3xl p-10 h-full flex flex-col items-center justify-center text-center text-ink-900/40 dark:text-amber-50/40 min-h-[350px]">
                  <ChefHat className="h-10 w-10 text-coral-300 mb-3" />
                  <p className="text-sm font-medium max-w-xs">
                    Provide a recipe name or picture on the left and tap "Generate Full Recipe".
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "chat" && (
          <motion.div
            key="chat-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto glass rounded-3xl overflow-hidden flex flex-col h-[650px] shadow-lg border border-coral-200/20"
          >
            {/* Chatbot Header */}
            <div className="p-4 bg-gradient-to-r from-coral-500/10 to-amber-500/10 border-b border-coral-200/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-coral-500 to-amber-500 flex items-center justify-center shadow-md text-white">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink-900 dark:text-white">FoodieBot</h3>
                  <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping inline-block" />
                    Online & Ready to Eat
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-md rounded-tr-none"
                        : "glass text-ink-900 dark:text-amber-50 rounded-tl-none border border-coral-200/20"
                    }`}
                  >
                    {/* Simplified Markdown bullet point and line break parsing */}
                    {msg.text.split("\n").map((line, j) => {
                      if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
                        return (
                          <div key={j} className="flex gap-1.5 pl-1.5 my-1">
                            <span className="text-coral-500 dark:text-amber-300">•</span>
                            <span>{line.replace(/^[\*\-]\s*/, "")}</span>
                          </div>
                        );
                      }
                      return <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>;
                    })}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl px-4 py-3 text-xs text-ink-900/60 dark:text-amber-50/60 rounded-tl-none flex items-center gap-2 border border-coral-200/20">
                    <Loader size="sm" />
                    <span>FoodieBot is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggestions */}
            {chatHistory.length === 1 && (
              <div className="px-4 py-2 border-t border-coral-200/10 flex flex-wrap gap-2 justify-center">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleSendMessage(e, s)}
                    className="text-[10px] font-semibold px-3 py-1.5 rounded-full glass hover:bg-coral-500/10 text-coral-600 dark:text-amber-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Form Input */}
            <form
              onSubmit={(e) => handleSendMessage(e)}
              className="p-4 bg-gradient-to-r from-coral-500/5 to-amber-500/5 border-t border-coral-200/20 flex gap-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask FoodieBot anything..."
                className="input-field py-2.5 flex-1"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatMessage.trim()}
                className="btn-primary p-3 shadow-md h-11 w-11 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiHub;
