// Fixed bottom tab bar shown only on small screens (mobile-first UX,
// similar to Instagram's mobile app).

import { NavLink } from "react-router-dom";
import { Home, Search, PlusSquare, Store, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const tabClass = ({ isActive }) =>
  `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
    isActive ? "text-coral-500" : "text-ink-900/50 dark:text-amber-50/50"
  }`;

const BottomNav = ({ onCreateClick }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/40 dark:border-white/5 flex items-stretch">
      <NavLink to="/" end className={tabClass}>
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-medium">Feed</span>
      </NavLink>

      <NavLink to="/search" className={tabClass}>
        <Search className="h-5 w-5" />
        <span className="text-[10px] font-medium">Search</span>
      </NavLink>

      {isAuthenticated && (
        <button
          onClick={onCreateClick}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-ink-900/50 dark:text-amber-50/50"
        >
          <PlusSquare className="h-5 w-5" />
          <span className="text-[10px] font-medium">Post</span>
        </button>
      )}

      <NavLink to="/restaurants" className={tabClass}>
        <Store className="h-5 w-5" />
        <span className="text-[10px] font-medium">Places</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? `/profile/${user.username}` : "/login"}
        className={tabClass}
      >
        <User className="h-5 w-5" />
        <span className="text-[10px] font-medium">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
