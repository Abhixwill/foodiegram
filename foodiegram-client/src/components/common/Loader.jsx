import { Loader2 } from "lucide-react";

// Full-page or inline loading spinner
const Loader = ({ fullScreen = false, label = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-coral-500" />
        <p className="text-sm text-ink-900/60 dark:text-amber-50/60">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-coral-500" />
    </div>
  );
};

export default Loader;
