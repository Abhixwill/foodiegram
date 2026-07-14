import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed, Heart, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getRestaurantByIdApi } from "../api/restaurant.api";
import Loader from "../components/common/Loader";

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRestaurantByIdApi(id)
      .then(({ data }) => setRestaurant(data.restaurant))
      .catch(() => toast.error("Restaurant not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen label="Loading restaurant..." />;
  if (!restaurant) return null;

  return (
    <div className="page-container !max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl overflow-hidden mb-6"
      >
        <div className="h-48 sm:h-64 bg-gradient-to-br from-coral-300 to-amber-300 flex items-center justify-center">
          {restaurant.coverImageUrl ? (
            <img
              src={restaurant.coverImageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <UtensilsCrossed className="h-14 w-14 text-white/80" />
          )}
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          {restaurant.cuisine && (
            <p className="text-coral-500 font-medium text-sm mt-1">{restaurant.cuisine}</p>
          )}
          {restaurant.address && (
            <p className="flex items-center gap-1.5 text-sm text-ink-900/60 dark:text-amber-50/60 mt-2">
              <MapPin className="h-4 w-4" /> {restaurant.address}
            </p>
          )}
          {restaurant.description && (
            <p className="text-sm mt-3 text-ink-900/70 dark:text-amber-50/70">
              {restaurant.description}
            </p>
          )}
          {restaurant.owner && (
            <p className="text-xs text-ink-900/40 dark:text-amber-50/40 mt-3">
              Added by{" "}
              <Link to={`/profile/${restaurant.owner.username}`} className="text-coral-500 hover:underline">
                @{restaurant.owner.username}
              </Link>
            </p>
          )}
        </div>
      </motion.div>

      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-900/60 dark:text-amber-50/60 mb-3">
        Posts from this restaurant
      </h2>

      {restaurant.posts.length === 0 ? (
        <p className="text-center text-ink-900/40 dark:text-amber-50/40 py-10">
          No posts tagged here yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {restaurant.posts.map((post) => (
            <Link
              key={post.id}
              to={`/profile/${post.author.username}`}
              className="relative aspect-square rounded-xl overflow-hidden group"
            >
              <img
                src={post.imageUrl}
                alt={post.caption || "Post"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-semibold">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 fill-white" /> {post._count.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 fill-white" /> {post._count.comments}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
