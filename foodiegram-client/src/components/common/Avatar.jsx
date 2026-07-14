// Displays a user's avatar image, or a gradient initials badge if
// no avatarUrl is set.

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const Avatar = ({ src, name = "?", size = "md", className = "" }) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover border-2 border-white/70 dark:border-white/10 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-coral-500 to-amber-500 border-2 border-white/70 dark:border-white/10 shadow-sm ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
