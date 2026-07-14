# FoodieGram — Frontend (React + Vite + Tailwind)

A warm, glassmorphism-styled food-sharing UI inspired by Instagram + Zomato.

## Folder Structure

```
foodiegram-client/
├── src/
│   ├── api/                # Axios calls, grouped by resource
│   ├── components/
│   │   ├── common/         # Button, Input, Avatar, Loader, ThemeToggle
│   │   ├── layout/         # Navbar, BottomNav
│   │   ├── post/           # PostCard, CreatePostModal, CommentSection
│   │   └── restaurant/     # RestaurantCard
│   ├── context/             # AuthContext, ThemeContext
│   ├── pages/               # Route-level pages
│   ├── routes/               # ProtectedRoute
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css            # Tailwind + glassmorphism utility classes
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Make sure `VITE_API_URL` points to your running backend (default `http://localhost:5000/api`).

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   App available at `http://localhost:5173`

## Design Notes

- **Theme**: warm coral/amber palette (`tailwind.config.js` → `colors.coral`, `colors.amber`), with a near-black `ink` palette for dark mode.
- **Glassmorphism**: `.glass` and `.glass-strong` utility classes in `index.css` (semi-transparent background + `backdrop-blur` + soft shadow).
- **Dark/Light mode**: `ThemeContext` toggles a `dark` class on `<body>`; Tailwind's `darkMode: 'class'` strategy picks it up. Persisted to `localStorage`.
- **Animations**: Framer Motion for page/element transitions; custom `heart-pop` keyframe for the like button.
- **Responsive**: desktop gets a top navbar with inline actions; mobile (`< md`) gets a fixed bottom tab bar (`BottomNav.jsx`), Instagram-style.

## Pages

| Route                    | Description                          |
|---------------------------|---------------------------------------|
| `/`                        | Feed (paginated posts)                |
| `/login`, `/signup`        | Auth                                   |
| `/search`                  | Search users + restaurants (debounced)|
| `/restaurants`             | Restaurant list + add new             |
| `/restaurants/:id`         | Restaurant details + tagged posts     |
| `/profile/:username`       | Profile with bio edit + post grid     |
