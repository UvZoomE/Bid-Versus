const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// 1. Authenticate with Cloudinary using your .env keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Multer to stream directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bid_versus_uploads", // Creates a neat folder in your Cloudinary dashboard
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto", // Automatically detects if it's an image or a raw document (like PDF)
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
