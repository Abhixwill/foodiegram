// Handles food post CRUD, likes, and comments.

const asyncHandler = require("express-async-handler");
const prisma = require("../config/db");
const { success, failure } = require("../utils/apiResponse");

// Shared "include" shape so every post response looks the same
const postInclude = (viewerId) => ({
  author: {
    select: { id: true, name: true, username: true, avatarUrl: true },
  },
  restaurant: {
    select: { id: true, name: true, cuisine: true, coverImageUrl: true },
  },
  _count: { select: { likes: true, comments: true } },
  likes: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
});

// Reshapes a raw Prisma post into the API response shape
const formatPost = (post, viewerId) => ({
  id: post.id,
  caption: post.caption,
  imageUrl: post.imageUrl,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  author: post.author,
  restaurant: post.restaurant,
  likeCount: post._count.likes,
  commentCount: post._count.comments,
  likedByMe: viewerId ? post.likes.length > 0 : false,
});

// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { caption, restaurantId } = req.body;

  if (!req.file) {
    return failure(res, 400, "A food image is required");
  }

  const post = await prisma.post.create({
    data: {
      caption: caption || "",
      imageUrl: req.file.path, // Cloudinary secure URL
      authorId: req.user.id,
      restaurantId: restaurantId ? Number(restaurantId) : null,
    },
    include: postInclude(req.user.id),
  });

  return success(res, 201, "Post created", { post: formatPost(post, req.user.id) });
});

// @route   GET /api/posts?page=1&limit=10
// @access  Public (optional auth for likedByMe)
const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;
  const viewerId = req.user?.id;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: postInclude(viewerId),
    }),
    prisma.post.count(),
  ]);

  return success(res, 200, "Feed fetched", {
    posts: posts.map((p) => formatPost(p, viewerId)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// @route   GET /api/posts/:id
// @access  Public (optional auth)
const getPostById = asyncHandler(async (req, res) => {
  const viewerId = req.user?.id;
  const post = await prisma.post.findUnique({
    where: { id: Number(req.params.id) },
    include: postInclude(viewerId),
  });

  if (!post) return failure(res, 404, "Post not found");

  return success(res, 200, "Post fetched", { post: formatPost(post, viewerId) });
});

// @route   PUT /api/posts/:id
// @access  Private (author only)
const updatePost = asyncHandler(async (req, res) => {
  const postId = Number(req.params.id);
  const existing = await prisma.post.findUnique({ where: { id: postId } });

  if (!existing) return failure(res, 404, "Post not found");
  if (existing.authorId !== req.user.id) {
    return failure(res, 403, "You can only edit your own posts");
  }

  const data = {};
  if (req.body.caption !== undefined) data.caption = req.body.caption;
  if (req.body.restaurantId !== undefined) {
    data.restaurantId = req.body.restaurantId ? Number(req.body.restaurantId) : null;
  }
  if (req.file) data.imageUrl = req.file.path; // replaced image

  const updated = await prisma.post.update({
    where: { id: postId },
    data,
    include: postInclude(req.user.id),
  });

  return success(res, 200, "Post updated", { post: formatPost(updated, req.user.id) });
});

// @route   DELETE /api/posts/:id
// @access  Private (author only)
const deletePost = asyncHandler(async (req, res) => {
  const postId = Number(req.params.id);
  const existing = await prisma.post.findUnique({ where: { id: postId } });

  if (!existing) return failure(res, 404, "Post not found");
  if (existing.authorId !== req.user.id) {
    return failure(res, 403, "You can only delete your own posts");
  }

  await prisma.post.delete({ where: { id: postId } });
  return success(res, 200, "Post deleted");
});

// @route   POST /api/posts/:id/like
// @access  Private
// Toggles like/unlike for the current user on a post.
const toggleLike = asyncHandler(async (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return failure(res, 404, "Post not found");

  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  let liked;
  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    liked = false;
  } else {
    await prisma.like.create({ data: { userId, postId } });
    liked = true;
  }

  const likeCount = await prisma.like.count({ where: { postId } });

  return success(res, 200, liked ? "Post liked" : "Post unliked", { liked, likeCount });
});

// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const postId = Number(req.params.id);
  const { text } = req.body;

  if (!text || !text.trim()) {
    return failure(res, 400, "Comment text is required");
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return failure(res, 404, "Post not found");

  const comment = await prisma.comment.create({
    data: { text: text.trim(), authorId: req.user.id, postId },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });

  return success(res, 201, "Comment added", { comment });
});

// @route   GET /api/posts/:id/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const postId = Number(req.params.id);
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });
  return success(res, 200, "Comments fetched", { comments });
});

// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private (comment author only)
const deleteComment = asyncHandler(async (req, res) => {
  const commentId = Number(req.params.commentId);
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment) return failure(res, 404, "Comment not found");
  if (comment.authorId !== req.user.id) {
    return failure(res, 403, "You can only delete your own comments");
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return success(res, 200, "Comment deleted");
});

module.exports = {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
};
