/**
 * Cloudinary Upload Utility
 * Helper functions for uploading files to Cloudinary
 */

const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder
 * @param {String} resourceType - 'image' or 'video' or 'auto'
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        transformation: resourceType === 'image' ? [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ] : []
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload to Cloudinary'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Upload team logo to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadTeamLogo = async (fileBuffer) => {
  return await uploadToCloudinary(fileBuffer, 'sissala-league/teams/logos', 'image');
};

/**
 * Upload team photo to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadTeamPhoto = async (fileBuffer) => {
  return await uploadToCloudinary(fileBuffer, 'sissala-league/teams/photos', 'image');
};

/**
 * Upload player photo to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadPlayerPhoto = async (fileBuffer) => {
  return await uploadToCloudinary(fileBuffer, 'sissala-league/players', 'image');
};

/**
 * Upload news image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadNewsImage = async (fileBuffer) => {
  return await uploadToCloudinary(fileBuffer, 'sissala-league/news', 'image');
};

/**
 * Upload venue photo to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadVenuePhoto = async (fileBuffer) => {
  return await uploadToCloudinary(fileBuffer, 'sissala-league/venues', 'image');
};

/**
 * Upload media file (photo or video) to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} mediaType - 'photo' or 'video'
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadMediaFile = async (fileBuffer, mediaType = 'photo') => {
  const resourceType = mediaType === 'video' ? 'video' : 'image';
  const folder = `sissala-league/media/${mediaType}s`;
  return await uploadToCloudinary(fileBuffer, folder, resourceType);
};

module.exports = {
  uploadToCloudinary,
  uploadTeamLogo,
  uploadTeamPhoto,
  uploadPlayerPhoto,
  uploadNewsImage,
  uploadVenuePhoto,
  uploadMediaFile
};
