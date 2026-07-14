// Multer instances for each type of image upload, each backed by its
// own Cloudinary storage engine (see config/cloudinary.js).

const multer = require("multer");
const {
  postImageStorage,
  avatarStorage,
  restaurantImageStorage,
} = require("../config/cloudinary");

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadPostImage = multer({
  storage: postImageStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const uploadRestaurantImage = multer({
  storage: restaurantImageStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { uploadPostImage, uploadAvatar, uploadRestaurantImage };
