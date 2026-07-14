import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <UtensilsCrossed className="h-14 w-14 text-coral-300 mb-4" />
    <h1 className="text-3xl font-extrabold mb-2">404</h1>
    <p className="text-ink-900/50 dark:text-amber-50/50 mb-6">
      Looks like this plate is empty. Page not found.
    </p>
    <Link to="/" className="btn-primary">
      Back to Feed
    </Link>
  </div>
);

export default NotFound;
