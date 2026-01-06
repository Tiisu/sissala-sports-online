/**
 * File Upload Middleware
 * Handles file uploads using Multer with Cloudinary
 */

const multer = require('multer');
const path = require('path');
const { ApiError } = require('./error.middleware');

/**
 * Configure memory storage for Cloudinary upload
 * Files are stored in memory temporarily before uploading to Cloudinary
 */
const storage = multer.memoryStorage();

/**
 * File filter to allow only specific file types
 */
const fileFilter = (req, file, cb) => {
  // Allowed image extensions
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed video extensions
  const allowedVideoTypes = /mp4|avi|mov|wmv|webm/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if file is an image
  if (
    allowedImageTypes.test(extname.slice(1)) &&
    mimetype.startsWith('image/')
  ) {
    return cb(null, true);
  }

  // Check if file is a video
  if (
    allowedVideoTypes.test(extname.slice(1)) &&
    mimetype.startsWith('video/')
  ) {
    return cb(null, true);
  }

  // Reject file
  cb(
    new ApiError(
      400,
      'Invalid file type. Only images (JPEG, JPG, PNG, GIF, WEBP) and videos (MP4, AVI, MOV, WMV, WEBM) are allowed'
    )
  );
};

/**
 * Configure Multer upload
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

/**
 * Middleware for single file upload
 */
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error (file size, etc.)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ApiError(400, 'File too large. Maximum size is 5MB')
          );
        }
        return next(new ApiError(400, err.message));
      } else if (err) {
        // Other errors
        return next(err);
      }
      next();
    });
  };
};

/**
 * Middleware for multiple files upload
 */
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ApiError(400, 'One or more files are too large. Maximum size is 5MB per file')
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            new ApiError(400, `Too many files. Maximum allowed is ${maxCount}`)
          );
        }
        return next(new ApiError(400, err.message));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

/**
 * Middleware for multiple fields with files
 */
const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ApiError(400, 'One or more files are too large. Maximum size is 5MB per file')
          );
        }
        return next(new ApiError(400, err.message));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
};
