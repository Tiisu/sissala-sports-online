/**
 * News Routes
 * Handles news articles and announcements
 */

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

/**
 * @route   GET /api/news
 * @desc    Get all news articles
 * @access  Public
 */
router.get('/', newsController.getNews);

/**
 * @route   GET /api/news/featured
 * @desc    Get featured news articles
 * @access  Public
 */
router.get('/featured', newsController.getFeaturedNews);

/**
 * @route   GET /api/news/category/:category
 * @desc    Get news by category
 * @access  Public
 */
router.get('/category/:category', newsController.getNewsByCategory);

/**
 * @route   GET /api/news/:id
 * @desc    Get single news article by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, newsController.getNewsById);

/**
 * @route   GET /api/news/slug/:slug
 * @desc    Get news by slug
 * @access  Public
 */
router.get('/slug/:slug', optionalAuth, newsController.getNewsBySlug);

/**
 * @route   POST /api/news
 * @desc    Create new news article
 * @access  Private/Admin/Editor
 */
router.post(
  '/',
  protect,
  authorize('admin', 'editor'),
  uploadSingle('newsImage'),
  newsController.createNews
);

/**
 * @route   PUT /api/news/:id
 * @desc    Update news article
 * @access  Private/Admin/Editor
 */
router.put(
  '/:id',
  protect,
  authorize('admin', 'editor'),
  uploadSingle('newsImage'),
  newsController.updateNews
);

/**
 * @route   DELETE /api/news/:id
 * @desc    Delete news article
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), newsController.deleteNews);

/**
 * @route   POST /api/news/:id/comment
 * @desc    Add comment to news article
 * @access  Private
 */
router.post('/:id/comment', protect, newsController.addComment);

/**
 * @route   PUT /api/news/:id/like
 * @desc    Toggle like on news article
 * @access  Private
 */
router.put('/:id/like', protect, newsController.toggleLike);

/**
 * @route   PUT /api/news/:id/publish
 * @desc    Publish news article
 * @access  Private/Admin/Editor
 */
router.put('/:id/publish', protect, authorize('admin', 'editor'), newsController.publishNews);

/**
 * @route   GET /api/news/team/:teamId
 * @desc    Get news related to a team
 * @access  Public
 */
router.get('/team/:teamId', newsController.getNewsByTeam);

/**
 * @route   GET /api/news/player/:playerId
 * @desc    Get news related to a player
 * @access  Public
 */
router.get('/player/:playerId', newsController.getNewsByPlayer);

/**
 * @route   GET /api/news/search/:query
 * @desc    Search news articles
 * @access  Public
 */
router.get('/search/:query', newsController.searchNews);

module.exports = router;
