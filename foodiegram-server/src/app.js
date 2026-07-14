// Express application setup: middleware, routes, and error handling.
// Kept separate from server.js so it can be imported in tests without
// actually starting a listening server.

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes");
const restaurantRoutes = require("./routes/restaurant.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "FoodieGram API is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
