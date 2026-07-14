// Reusable button with primary/secondary/ghost variants and a loading state.

import { Loader2 } from "lucide-react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-coral-600 dark:text-amber-200 hover:bg-coral-500/10 transition-colors duration-200",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-200 disabled:opacity-50",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
