// Entry point: loads env vars, verifies the DB connection, then starts
// the HTTP server.

require("dotenv").config();
const app = require("./app");
const prisma = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Simple query to confirm Prisma can reach PostgreSQL before we boot
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL via Prisma");

    app.listen(PORT, () => {
      console.log(`🚀 FoodieGram API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
