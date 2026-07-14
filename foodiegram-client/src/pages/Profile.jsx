import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Pencil, Grid3x3, Heart, MessageCircle } from "lucide-react";
import { getProfileApi } from "../api/user.api";
import { updateProfileApi } from "../api/user.api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateLocalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const loadProfile = () => {
    setLoading(true);
    getProfileApi(username)
      .then(({ data }) => {
        setProfile(data.user);
        setForm({ name: data.user.name, bio: data.user.bio || "" });
      })
      .catch(() => toast.error("User not found"))
      .finally(() => setLoading(false));
  };

  useEffect(loadProfile, [username]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfileApi({
        name: form.name,
        bio: form.bio,
        avatar: avatarFile,
      });
      updateLocalUser(data.user);
      setProfile((prev) => ({ ...prev, ...data.user }));
      toast.success("Profile updated");
      setEditing(false);
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen label="Loading profile..." />;
  if (!profile) return null;

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 mb-6"
      >
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <label className="cursor-pointer">
                <Avatar
                  src={avatarPreview || profile.avatarUrl}
                  name={profile.name}
                  size="xl"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-coral-500 text-center mt-1">Change photo</p>
              </label>
            </div>
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-900/80 dark:text-amber-50/80">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="input-field resize-none"
                placeholder="Tell people about your taste..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar src={profile.avatarUrl} name={profile.name} size="xl" />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    className="!py-1.5 !px-3 text-xs mx-auto sm:mx-0"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit Profile
                  </Button>
                )}
              </div>
              <p className="text-coral-500 text-sm">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-sm text-ink-900/70 dark:text-amber-50/70">
                  {profile.bio}
                </p>
              )}
              <p className="mt-3 text-sm">
                <span className="font-semibold">{profile._count?.posts ?? profile.posts?.length ?? 0}</span>{" "}
                <span className="text-ink-900/50 dark:text-amber-50/50">posts</span>
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex items-center gap-2 mb-3 text-ink-900/60 dark:text-amber-50/60">
        <Grid3x3 className="h-4 w-4" />
        <span className="text-sm font-semibold uppercase tracking-wide">Posts</span>
      </div>

      {profile.posts?.length === 0 ? (
        <p className="text-center text-ink-900/40 dark:text-amber-50/40 py-10">
          No posts yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {profile.posts?.map((post) => (
            <div
              key={post.id}
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
                  <Heart className="h-4 w-4 fill-white" /> {post._count?.likes ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 fill-white" /> {post._count?.comments ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
