/**
 * Forum Routes
 * Handles forum discussions and topics
 */

const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/forums
 * @desc    Get all forum topics
 * @access  Public
 */
router.get('/', forumController.getForums);

/**
 * @route   GET /api/forums/category/:category
 * @desc    Get forum topics by category
 * @access  Public
 */
router.get('/category/:category', forumController.getForumsByCategory);

/**
 * @route   GET /api/forums/popular
 * @desc    Get popular forum topics (most views/replies)
 * @access  Public
 */
router.get('/popular', forumController.getPopularForums);

/**
 * @route   GET /api/forums/:id
 * @desc    Get single forum topic by ID
 * @access  Public
 */
router.get('/:id', forumController.getForumById);

/**
 * @route   GET /api/forums/slug/:slug
 * @desc    Get forum topic by slug
 * @access  Public
 */
router.get('/slug/:slug', forumController.getForumBySlug);

/**
 * @route   POST /api/forums
 * @desc    Create new forum topic
 * @access  Private
 */
router.post('/', protect, forumController.createForum);

/**
 * @route   PUT /api/forums/:id
 * @desc    Update forum topic
 * @access  Private (Owner or Admin)
 */
router.put('/:id', protect, forumController.updateForum);

/**
 * @route   DELETE /api/forums/:id
 * @desc    Delete forum topic
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', protect, forumController.deleteForum);

/**
 * @route   POST /api/forums/:id/reply
 * @desc    Add reply to forum topic
 * @access  Private
 */
router.post('/:id/reply', protect, forumController.addReply);

/**
 * @route   PUT /api/forums/:id/like
 * @desc    Toggle like on forum topic
 * @access  Private
 */
router.put('/:id/like', protect, forumController.toggleLike);

/**
 * @route   PUT /api/forums/:id/lock
 * @desc    Lock/unlock forum topic
 * @access  Private/Admin
 */
router.put('/:id/lock', protect, authorize('admin'), forumController.toggleLock);

/**
 * @route   PUT /api/forums/:id/status
 * @desc    Update forum topic status (open/closed/pinned)
 * @access  Private/Admin
 */
router.put('/:id/status', protect, authorize('admin'), forumController.updateStatus);

/**
 * @route   GET /api/forums/user/:userId
 * @desc    Get forum topics by user
 * @access  Public
 */
router.get('/user/:userId', forumController.getForumsByUser);

/**
 * @route   GET /api/forums/search/:query
 * @desc    Search forum topics
 * @access  Public
 */
router.get('/search/:query', forumController.searchForums);

module.exports = router;
