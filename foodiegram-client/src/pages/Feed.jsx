import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getFeedApi } from "../api/post.api";
import PostCard from "../components/post/PostCard";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import { UtensilsCrossed } from "lucide-react";

const Feed = ({ onEditPost, refreshKey }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = useCallback(async (pageNum) => {
    try {
      const { data } = await getFeedApi(pageNum, 10);
      setTotalPages(data.pagination.totalPages);
      return data.posts;
    } catch (err) {
      toast.error("Couldn't load the feed");
      return [];
    }
  }, []);

  // Initial load + reload whenever a post is created elsewhere (refreshKey)
  useEffect(() => {
    setLoading(true);
    loadFeed(1).then((newPosts) => {
      setPosts(newPosts);
      setPage(1);
      setLoading(false);
    });
  }, [loadFeed, refreshKey]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const newPosts = await loadFeed(nextPage);
    setPosts((prev) => [...prev, ...newPosts]);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading) return <Loader fullScreen label="Loading the feed..." />;

  if (posts.length === 0) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center py-20">
        <UtensilsCrossed className="h-12 w-12 text-coral-300 mb-4" />
        <h2 className="text-xl font-bold mb-1">No posts yet</h2>
        <p className="text-ink-900/50 dark:text-amber-50/50">
          Be the first to share a dish with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDeleted={handleDeleted}
          onEdit={onEditPost}
        />
      ))}

      {page < totalPages && (
        <div className="flex justify-center mt-2">
          <Button variant="secondary" loading={loadingMore} onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default Feed;
