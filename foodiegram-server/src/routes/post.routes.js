const express = require("express");
const router = express.Router();

const {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/post.controller");

const { protect, optionalAuth } = require("../middleware/auth.middleware");
const { uploadPostImage } = require("../middleware/upload.middleware");

// Posts
router.get("/", optionalAuth, getFeed);
router.post("/", protect, uploadPostImage.single("image"), createPost);
router.get("/:id", optionalAuth, getPostById);
router.put("/:id", protect, uploadPostImage.single("image"), updatePost);
router.delete("/:id", protect, deletePost);

// Likes
router.post("/:id/like", protect, toggleLike);

// Comments
router.get("/:id/comments", getComments);
router.post("/:id/comments", protect, addComment);
router.delete("/:postId/comments/:commentId", protect, deleteComment);

module.exports = router;
