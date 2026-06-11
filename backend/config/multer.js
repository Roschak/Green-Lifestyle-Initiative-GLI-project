// backend/config/multer.js
const multer = require('multer');

// Check if Cloudinary is configured
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let upload;

if (hasCloudinary) {
  try {
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const cloudinary = require('cloudinary').v2;

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log('Cloudinary configured');

    // Storage untuk multer
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'gli_actions',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }]
      }
    });

    upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        console.log('File received:', file.originalname, file.mimetype);
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only images are allowed'), false);
        }
      }
    });
  } catch (err) {
    console.error('Cloudinary error:', err.message);
    console.log('Falling back to memory storage');
    upload = multer({ storage: multer.memoryStorage() });
  }
} else {
  console.log('Cloudinary not configured, using memory storage for uploads');

  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only images are allowed'), false);
      }
    }
  });
}

module.exports = upload;