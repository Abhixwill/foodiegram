// The primary feed unit: image, caption, author, restaurant tag,
// like button (with heart-pop animation), and expandable comments.
// Shows an owner-only edit/delete menu when the viewer is the author.

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, MoreHorizontal, Store, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { toggleLikeApi, deletePostApi } from "../../api/post.api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import CommentSection from "./CommentSection";

const PostCard = ({ post, onDeleted, onEdit }) => {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [popKey, setPopKey] = useState(0);

  const isOwner = isAuthenticated && user.id === post.author.id;

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Log in to like posts");
      return;
    }
    // Optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setPopKey((k) => k + 1);

    try {
      const { data } = await toggleLikeApi(post.id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      // Roll back on failure
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error("Couldn't update like");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This can't be undone.")) return;
    try {
      await deletePostApi(post.id);
      toast.success("Post deleted");
      onDeleted?.(post.id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete post");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-3xl overflow-hidden mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3">
          <Avatar src={post.author.avatarUrl} name={post.author.name} size="md" />
          <div>
            <p className="font-semibold text-sm leading-tight">{post.author.username}</p>
            {post.restaurant && (
              <Link
                to={`/restaurants/${post.restaurant.id}`}
                className="flex items-center gap-1 text-xs text-coral-500 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Store className="h-3 w-3" /> {post.restaurant.name}
              </Link>
            )}
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="btn-icon">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 glass-strong rounded-xl overflow-hidden z-10 animate-scale-in origin-top-right">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(post);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-coral-500/10"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="relative bg-black/5">
        <img
          src={post.imageUrl}
          alt={post.caption || "Food post"}
          className="w-full max-h-[520px] object-cover"
          loading="lazy"
          onDoubleClick={handleLike}
        />
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 flex items-center gap-4">
        <motion.button
          key={popKey}
          onClick={handleLike}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1.5"
        >
          <Heart
            className={`h-6 w-6 transition-colors ${
              liked ? "fill-coral-500 text-coral-500 animate-heart-pop" : "text-ink-900/70 dark:text-amber-50/70"
            }`}
          />
          <span className="text-sm font-medium">{likeCount}</span>
        </motion.button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5"
        >
          <MessageCircle className="h-6 w-6 text-ink-900/70 dark:text-amber-50/70" />
          <span className="text-sm font-medium">{commentCount}</span>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pt-2 pb-1">
          <p className="text-sm">
            <span className="font-semibold">{post.author.username}</span>{" "}
            {post.caption}
          </p>
        </div>
      )}

      <div className="px-4 pb-4">
        <button
          onClick={() => setShowComments((v) => !v)}
          className="text-xs text-ink-900/50 dark:text-amber-50/50 hover:underline"
        >
          {showComments ? "Hide comments" : `View all ${commentCount} comments`}
        </button>

        {showComments && (
          <CommentSection postId={post.id} onCommentCountChange={setCommentCount} />
        )}
      </div>
    </motion.article>
  );
};

export default PostCard;
