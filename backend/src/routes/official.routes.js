/**
 * Official Routes
 * Handles match officials (referees) management
 */

const express = require('express');
const router = express.Router();
const officialController = require('../controllers/official.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

/**
 * @route   GET /api/officials
 * @desc    Get all officials
 * @access  Public
 */
router.get('/', officialController.getOfficials);

/**
 * @route   GET /api/officials/available
 * @desc    Get available officials
 * @access  Private/Admin
 */
router.get('/available', protect, authorize('admin'), officialController.getAvailableOfficials);

/**
 * @route   GET /api/officials/:id
 * @desc    Get single official by ID
 * @access  Public
 */
router.get('/:id', officialController.getOfficial);

/**
 * @route   GET /api/officials/slug/:slug
 * @desc    Get official by slug
 * @access  Public
 */
router.get('/slug/:slug', officialController.getOfficialBySlug);

/**
 * @route   POST /api/officials
 * @desc    Create new official
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingle('photo'),
  officialController.createOfficial
);

/**
 * @route   PUT /api/officials/:id
 * @desc    Update official
 * @access  Private/Admin
 */
router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadSingle('photo'),
  officialController.updateOfficial
);

/**
 * @route   DELETE /api/officials/:id
 * @desc    Delete official
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), officialController.deleteOfficial);

/**
 * @route   GET /api/officials/:id/matches
 * @desc    Get all matches officiated by an official
 * @access  Public
 */
router.get('/:id/matches', officialController.getOfficialMatches);

/**
 * @route   GET /api/officials/:id/statistics
 * @desc    Get official statistics
 * @access  Public
 */
router.get('/:id/statistics', officialController.getOfficialStatistics);

/**
 * @route   PUT /api/officials/:id/statistics
 * @desc    Update official statistics after match
 * @access  Private/Admin
 */
router.put(
  '/:id/statistics',
  protect,
  authorize('admin'),
  officialController.updateOfficialStatistics
);

/**
 * @route   PUT /api/officials/:id/availability
 * @desc    Update official availability
 * @access  Private/Admin
 */
router.put(
  '/:id/availability',
  protect,
  authorize('admin'),
  officialController.updateAvailability
);

module.exports = router;
