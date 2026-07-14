// Root component: sets up routing, the sticky navbar / bottom nav,
// and hosts the CreatePostModal so it can be triggered from anywhere.

import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/layout/Navbar";
import BottomNav from "./components/layout/BottomNav";
import CreatePostModal from "./components/post/CreatePostModal";
import ProtectedRoute from "./routes/ProtectedRoute";

import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Restaurants from "./pages/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { loading } = useAuth();
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  const openCreateModal = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handlePostSaved = () => {
    // Bumping this key forces the Feed page to refetch from page 1
    setFeedRefreshKey((k) => k + 1);
  };

  // Wait for the auth check (validating any stored token) before
  // rendering routes, so ProtectedRoute doesn't briefly redirect
  // a logged-in user to /login on page refresh.
  if (loading) return null;

  return (
    <div className="min-h-screen">
      <Navbar onCreateClick={openCreateModal} />

      <main className="pb-20 md:pb-0">
        <Routes>
          <Route
            path="/"
            element={<Feed onEditPost={openEditModal} refreshKey={feedRefreshKey} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/search" element={<Search />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Feed onEditPost={openEditModal} refreshKey={feedRefreshKey} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <BottomNav onCreateClick={openCreateModal} />

      <CreatePostModal
        open={modalOpen}
        editingPost={editingPost}
        onClose={() => setModalOpen(false)}
        onSaved={handlePostSaved}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          className: "glass-strong !rounded-2xl !text-sm",
          style: {
            background: theme === "dark" ? "#251a17" : "#ffffff",
            color: theme === "dark" ? "#fffaeb" : "#1a1210",
          },
        }}
      />
    </div>
  );
}

export default App;
