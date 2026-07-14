// Seeds the database with sample users, restaurants, and posts so you
// can explore the app without manually creating data.
// Run with: npm run seed

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      username: "alice_eats",
      email: "alice@example.com",
      password: hashedPassword,
      bio: "Foodie exploring one plate at a time 🍜",
      avatarUrl: "",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Martinez",
      username: "bob_bites",
      email: "bob@example.com",
      password: hashedPassword,
      bio: "Street food hunter 🌮",
      avatarUrl: "",
    },
  });

  const tandoor = await prisma.restaurant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Tandoor Nights",
      description: "Authentic North Indian tandoor and curries.",
      address: "MG Road, Bengaluru",
      cuisine: "North Indian",
      coverImageUrl: "",
      ownerId: alice.id,
    },
  });

  await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      caption: "Best butter chicken in town! 🔥",
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
      authorId: alice.id,
      restaurantId: tandoor.id,
    },
  });

  await prisma.post.upsert({
    where: { id: 2 },
    update: {},
    create: {
      caption: "Street tacos on a Friday night 🌮🌶️",
      imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b",
      authorId: bob.id,
    },
  });

  console.log("✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
