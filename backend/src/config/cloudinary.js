/**
 * Cloudinary Configuration
 * Cloud-based image and video management service
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Cloudinary credentials not found in environment variables');
} else {
  console.log('✅ Cloudinary configured successfully');
}

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Path to the file
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result with URL
 */
const uploadImage = async (filePath, folder = 'sissala-league') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Upload video to Cloudinary
 * @param {String} filePath - Path to the video file
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result with URL
 */
const uploadVideo = async (filePath, folder = 'sissala-league/videos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'video',
      transformation: [
        { quality: 'auto:good' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video to Cloudinary');
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Public ID of the file to delete
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

/**
 * Get optimized image URL
 * @param {String} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {String} - Optimized image URL
 */
const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto'
  } = options;
  
  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: format }
    ]
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  deleteFile,
  getOptimizedImageUrl
};
