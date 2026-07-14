import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`btn-icon relative overflow-hidden ${className}`}
    >
      <span className="relative z-10">
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-amber-300" />
        ) : (
          <Moon className="h-5 w-5 text-coral-600" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
