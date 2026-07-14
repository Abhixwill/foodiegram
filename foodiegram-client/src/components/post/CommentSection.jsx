// Inline comment thread: lists comments, lets the logged-in user add
// one, and lets a comment's author delete it.

import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getCommentsApi, addCommentApi, deleteCommentApi } from "../../api/post.api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import Loader from "../common/Loader";

const CommentSection = ({ postId, onCommentCountChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCommentsApi(postId)
      .then(({ data }) => {
        if (mounted) setComments(data.comments);
      })
      .catch(() => toast.error("Couldn't load comments"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await addCommentApi(postId, text.trim());
      const updated = [...comments, data.comment];
      setComments(updated);
      onCommentCountChange?.(updated.length);
      setText("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteCommentApi(postId, commentId);
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      onCommentCountChange?.(updated.length);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete comment");
    }
  };

  return (
    <div className="border-t border-white/40 dark:border-white/10 pt-3 mt-3">
      {loading ? (
        <Loader />
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-900/50 dark:text-amber-50/50 py-2">
          No comments yet. Be the first to say something!
        </p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 group">
              <Avatar src={c.author.avatarUrl} name={c.author.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{c.author.username}</span>{" "}
                  <span className="text-ink-900/80 dark:text-amber-50/80">
                    {c.text}
                  </span>
                </p>
              </div>
              {user?.id === c.author.id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-900/30 hover:text-red-500"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="input-field !py-2 flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="btn-icon text-coral-500 disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
