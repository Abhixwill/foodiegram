# FoodieGram — Backend (PERN Stack)

Express + PostgreSQL (via Prisma) REST API for the FoodieGram food-sharing app.

## Folder Structure

```
foodiegram-server/
├── prisma/
│   ├── schema.prisma      # Data model (User, Restaurant, Post, Like, Comment)
│   └── seed.js            # Sample data
├── src/
│   ├── config/
│   │   ├── db.js              # Prisma client singleton
│   │   └── cloudinary.js      # Cloudinary + multer storage engines
│   ├── controllers/           # Request handlers (business logic)
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT protect / optionalAuth
│   │   ├── upload.middleware.js  # Multer upload instances
│   │   └── error.middleware.js   # 404 + centralized error handler
│   ├── routes/                # Express routers
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── apiResponse.js
│   ├── app.js              # Express app (middleware + routes)
│   └── server.js           # Entry point
├── .env.example
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `JWT_SECRET` — any long random string
   - `CLOUDINARY_*` — from your Cloudinary dashboard

3. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **(Optional) Seed sample data**
   ```bash
   npm run seed
   ```
   Sample login: `alice@example.com` / `password123`

5. **Run the server**
   ```bash
   npm run dev
   ```
   API available at `http://localhost:5000/api`

## API Overview

| Method | Route                              | Auth | Description                  |
|--------|-------------------------------------|------|-------------------------------|
| POST   | /api/auth/signup                   | -    | Register                      |
| POST   | /api/auth/login                    | -    | Login                         |
| GET    | /api/auth/me                       | ✅   | Get current user              |
| GET    | /api/posts                         | -    | Get feed (paginated)          |
| POST   | /api/posts                         | ✅   | Create post (multipart image) |
| GET    | /api/posts/:id                     | -    | Get single post               |
| PUT    | /api/posts/:id                     | ✅   | Edit post (author only)       |
| DELETE | /api/posts/:id                     | ✅   | Delete post (author only)     |
| POST   | /api/posts/:id/like                | ✅   | Toggle like                   |
| GET    | /api/posts/:id/comments             | -    | Get comments                  |
| POST   | /api/posts/:id/comments             | ✅   | Add comment                   |
| DELETE | /api/posts/:postId/comments/:commentId | ✅ | Delete comment            |
| GET    | /api/users/search?q=                | -    | Search users                  |
| GET    | /api/users/:username                | -    | Get profile + posts           |
| PUT    | /api/users/me                       | ✅   | Update profile / avatar       |
| GET    | /api/restaurants                    | -    | List restaurants              |
| GET    | /api/restaurants/search?q=          | -    | Search restaurants            |
| GET    | /api/restaurants/:id                | -    | Restaurant details + posts    |
| POST   | /api/restaurants                    | ✅   | Create restaurant             |
| PUT    | /api/restaurants/:id                | ✅   | Edit restaurant (owner only)  |
| DELETE | /api/restaurants/:id                | ✅   | Delete restaurant (owner only)|

All protected routes require header: `Authorization: Bearer <token>`
