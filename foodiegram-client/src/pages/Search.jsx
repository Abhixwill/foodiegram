import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Store as StoreIcon, Users as UsersIcon } from "lucide-react";
import { searchUsersApi } from "../api/user.api";
import { searchRestaurantsApi } from "../api/restaurant.api";
import Avatar from "../components/common/Avatar";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import Loader from "../components/common/Loader";

const TABS = { USERS: "users", RESTAURANTS: "restaurants" };

const Search = () => {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState(TABS.USERS);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search — waits 350ms after typing stops before hitting the API
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setRestaurants([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      Promise.all([searchUsersApi(query), searchRestaurantsApi(query)])
        .then(([usersRes, restaurantsRes]) => {
          setUsers(usersRes.data.users);
          setRestaurants(restaurantsRes.data.restaurants);
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="page-container">
      <div className="relative mb-5">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-900/40 dark:text-amber-50/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for people or restaurants..."
          className="input-field pl-10"
          autoFocus
        />
      </div>

      {query.trim() && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab(TABS.USERS)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === TABS.USERS ? "bg-gradient-to-r from-coral-500 to-amber-500 text-white" : "glass"
            }`}
          >
            <UsersIcon className="h-3.5 w-3.5" /> People ({users.length})
          </button>
          <button
            onClick={() => setTab(TABS.RESTAURANTS)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === TABS.RESTAURANTS ? "bg-gradient-to-r from-coral-500 to-amber-500 text-white" : "glass"
            }`}
          >
            <StoreIcon className="h-3.5 w-3.5" /> Restaurants ({restaurants.length})
          </button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : !query.trim() ? (
        <p className="text-center text-ink-900/40 dark:text-amber-50/40 py-16">
          Start typing to find people or restaurants.
        </p>
      ) : tab === TABS.USERS ? (
        users.length === 0 ? (
          <p className="text-center text-ink-900/40 dark:text-amber-50/40 py-10">
            No people found for "{query}"
          </p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                className="glass rounded-2xl p-3 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
              >
                <Avatar src={u.avatarUrl} name={u.name} />
                <div>
                  <p className="font-semibold text-sm">{u.name}</p>
                  <p className="text-xs text-coral-500">@{u.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : restaurants.length === 0 ? (
        <p className="text-center text-ink-900/40 dark:text-amber-50/40 py-10">
          No restaurants found for "{query}"
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
