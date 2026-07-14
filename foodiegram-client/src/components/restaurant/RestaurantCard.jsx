import { Link } from "react-router-dom";
import { MapPin, UtensilsCrossed } from "lucide-react";

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="glass rounded-2xl overflow-hidden block hover:-translate-y-1 transition-transform duration-200"
    >
      <div className="h-36 bg-gradient-to-br from-coral-200 to-amber-200 dark:from-coral-800 dark:to-amber-800 flex items-center justify-center overflow-hidden">
        {restaurant.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="h-10 w-10 text-white/80" />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold truncate">{restaurant.name}</h3>
        {restaurant.cuisine && (
          <p className="text-xs text-coral-500 mb-1">{restaurant.cuisine}</p>
        )}
        {restaurant.address && (
          <p className="text-xs text-ink-900/50 dark:text-amber-50/50 flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" /> {restaurant.address}
          </p>
        )}
        {restaurant._count && (
          <p className="text-xs text-ink-900/40 dark:text-amber-50/40 mt-1">
            {restaurant._count.posts} post{restaurant._count.posts !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
};

export default RestaurantCard;
