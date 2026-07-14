// Top navigation bar. Sticky + glassmorphism. Shows different actions
// depending on auth state. Pairs with BottomNav.jsx for mobile.

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, Search, PlusSquare, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";
import Avatar from "../common/Avatar";

const Navbar = ({ onCreateClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/40 dark:border-white/5">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-coral-500 to-amber-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-coral-600 to-amber-600 dark:from-coral-300 dark:to-amber-300 bg-clip-text text-transparent hidden sm:inline">
            FoodieGram
          </span>
        </Link>

        {/* Right side actions (desktop) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/search" className="btn-icon hidden md:inline-flex">
            <Search className="h-5 w-5 text-ink-900/70 dark:text-amber-50/70" />
          </Link>

          {isAuthenticated && (
            <button
              onClick={onCreateClick}
              className="btn-icon hidden md:inline-flex"
              aria-label="Create post"
            >
              <PlusSquare className="h-5 w-5 text-ink-900/70 dark:text-amber-50/70" />
            </button>
          )}

          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="ml-1 rounded-full ring-2 ring-transparent hover:ring-coral-300 transition-all"
              >
                <Avatar src={user.avatarUrl} name={user.name} size="sm" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-strong rounded-2xl overflow-hidden animate-scale-in origin-top-right">
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-coral-500/10 transition-colors"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary ml-1 !py-2 !px-4 text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
