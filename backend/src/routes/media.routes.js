/**
 * Media Routes
 * Handles photos, videos, and galleries
 */

const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadSingle, uploadMultiple } = require('../middleware/upload.middleware');

/**
 * @route   GET /api/media
 * @desc    Get all media
 * @access  Public
 */
router.get('/', mediaController.getMedia);

/**
 * @route   GET /api/media/photos
 * @desc    Get all photos
 * @access  Public
 */
router.get('/photos', mediaController.getPhotos);

/**
 * @route   GET /api/media/videos
 * @desc    Get all videos
 * @access  Public
 */
router.get('/videos', mediaController.getVideos);

/**
 * @route   GET /api/media/galleries
 * @desc    Get all galleries
 * @access  Public
 */
router.get('/galleries', mediaController.getGalleries);

/**
 * @route   GET /api/media/featured
 * @desc    Get featured media
 * @access  Public
 */
router.get('/featured', mediaController.getFeaturedMedia);

/**
 * @route   GET /api/media/category/:category
 * @desc    Get media by category
 * @access  Public
 */
router.get('/category/:category', mediaController.getMediaByCategory);

/**
 * @route   GET /api/media/:id
 * @desc    Get single media by ID
 * @access  Public
 */
router.get('/:id', mediaController.getMediaById);

/**
 * @route   POST /api/media/photo
 * @desc    Upload a photo
 * @access  Private/Admin/Editor
 */
router.post(
  '/photo',
  protect,
  authorize('admin', 'editor'),
  uploadSingle('mediaFile'),
  mediaController.uploadPhoto
);

/**
 * @route   POST /api/media/video
 * @desc    Upload a video or add video URL
 * @access  Private/Admin/Editor
 */
router.post(
  '/video',
  protect,
  authorize('admin', 'editor'),
  uploadSingle('mediaFile'),
  mediaController.uploadVideo
);

/**
 * @route   POST /api/media/gallery
 * @desc    Create a gallery
 * @access  Private/Admin/Editor
 */
router.post(
  '/gallery',
  protect,
  authorize('admin', 'editor'),
  uploadMultiple('mediaFile', 10),
  mediaController.createGallery
);

/**
 * @route   PUT /api/media/:id
 * @desc    Update media
 * @access  Private/Admin/Editor
 */
router.put('/:id', protect, authorize('admin', 'editor'), mediaController.updateMedia);

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete media
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), mediaController.deleteMedia);

/**
 * @route   PUT /api/media/:id/like
 * @desc    Toggle like on media
 * @access  Private
 */
router.put('/:id/like', protect, mediaController.toggleLike);

/**
 * @route   PUT /api/media/:id/approve
 * @desc    Approve media
 * @access  Private/Admin
 */
router.put('/:id/approve', protect, authorize('admin'), mediaController.approveMedia);

/**
 * @route   POST /api/media/gallery/:id/photo
 * @desc    Add photo to gallery
 * @access  Private/Admin/Editor
 */
router.post(
  '/gallery/:id/photo',
  protect,
  authorize('admin', 'editor'),
  uploadSingle('mediaFile'),
  mediaController.addPhotoToGallery
);

/**
 * @route   GET /api/media/match/:matchId
 * @desc    Get media related to a match
 * @access  Public
 */
router.get('/match/:matchId', mediaController.getMediaByMatch);

/**
 * @route   GET /api/media/team/:teamId
 * @desc    Get media related to a team
 * @access  Public
 */
router.get('/team/:teamId', mediaController.getMediaByTeam);

module.exports = router;
