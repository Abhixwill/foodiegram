// Reusable text input with an optional label and error message,
// styled to match the glassmorphism theme.

import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, className = "", ...rest }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-1.5 text-sm font-medium text-ink-900/80 dark:text-amber-50/80">
            {label}
          </label>
        )}
        <input ref={ref} className={`input-field ${className}`} {...rest} />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
