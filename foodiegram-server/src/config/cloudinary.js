// Cloudinary configuration + multer storage engine.
// Used by upload.middleware.js to stream uploaded images directly to Cloudinary.

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine for food post images
const postImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "foodiegram/posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

// Storage engine for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "foodiegram/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
  },
});

// Storage engine for restaurant cover images
const restaurantImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "foodiegram/restaurants",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, height: 900, crop: "limit" }],
  },
});

module.exports = {
  cloudinary,
  postImageStorage,
  avatarStorage,
  restaurantImageStorage,
};
