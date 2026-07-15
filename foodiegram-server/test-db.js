// Database connection tester.
// Run this directly from the server folder: `node test-db.js`

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

console.log("🔍 Attempting to connect to PostgreSQL...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined (Hidden for privacy)" : "UNDEFINED ❌");

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Connection to PostgreSQL via Prisma succeeded!");
    
    const userCount = await prisma.user.count();
    console.log(`📊 Current registered user count: ${userCount}`);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
