import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Store, Plus } from "lucide-react";
import { getRestaurantsApi, createRestaurantApi } from "../api/restaurant.api";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus } from "lucide-react";

const Restaurants = () => {
  const { isAuthenticated } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => {
    setLoading(true);
    getRestaurantsApi()
      .then(({ data }) => setRestaurants(data.restaurants))
      .catch(() => toast.error("Couldn't load restaurants"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="page-container !max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-coral-500" />
          <h1 className="text-xl font-bold">Restaurants</h1>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowAddModal(true)} className="!py-2 !px-4 text-sm">
            <Plus className="h-4 w-4" /> Add Restaurant
          </Button>
        )}
      </div>

      {loading ? (
        <Loader fullScreen />
      ) : restaurants.length === 0 ? (
        <p className="text-center text-ink-900/40 dark:text-amber-50/40 py-16">
          No restaurants added yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}

      <AddRestaurantModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={(r) => {
          setRestaurants((prev) => [r, ...prev]);
          setShowAddModal(false);
        }}
      />
    </div>
  );
};

// Small inline modal for adding a restaurant — kept in this file since
// it's only used here, unlike CreatePostModal which is shared.
const AddRestaurantModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", cuisine: "", address: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await createRestaurantApi({ ...form, image: imageFile });
      toast.success("Restaurant added!");
      onCreated(data.restaurant);
      setForm({ name: "", cuisine: "", address: "", description: "" });
      setImageFile(null);
      setPreview("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't add restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Add a Restaurant</h2>
            <button onClick={onClose} className="btn-icon">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block cursor-pointer">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-40 rounded-2xl border-2 border-dashed border-coral-300 dark:border-white/20 flex flex-col items-center justify-center gap-1 text-coral-400">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-xs font-medium">Cover photo (optional)</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>

            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tandoor Nights"
              required
            />
            <Input
              label="Cuisine"
              value={form.cuisine}
              onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
              placeholder="North Indian"
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="MG Road, Bengaluru"
            />
            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-900/80 dark:text-amber-50/80">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <Button type="submit" loading={submitting} className="w-full">
              Add Restaurant
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Restaurants;
