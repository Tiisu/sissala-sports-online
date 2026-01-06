/**
 * Venue Routes
 * Handles venue/stadium management operations
 */

const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venue.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

/**
 * @route   GET /api/venues
 * @desc    Get all venues
 * @access  Public
 */
router.get('/', venueController.getVenues);

/**
 * @route   GET /api/venues/:id
 * @desc    Get single venue by ID
 * @access  Public
 */
router.get('/:id', venueController.getVenue);

/**
 * @route   GET /api/venues/slug/:slug
 * @desc    Get venue by slug
 * @access  Public
 */
router.get('/slug/:slug', venueController.getVenueBySlug);

/**
 * @route   POST /api/venues
 * @desc    Create new venue
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadMultiple('venuePhoto', 5),
  venueController.createVenue
);

/**
 * @route   PUT /api/venues/:id
 * @desc    Update venue
 * @access  Private/Admin
 */
router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadMultiple('venuePhoto', 5),
  venueController.updateVenue
);

/**
 * @route   DELETE /api/venues/:id
 * @desc    Delete venue
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), venueController.deleteVenue);

/**
 * @route   GET /api/venues/:id/matches
 * @desc    Get all matches at a venue
 * @access  Public
 */
router.get('/:id/matches', venueController.getVenueMatches);

/**
 * @route   GET /api/venues/city/:city
 * @desc    Get venues by city
 * @access  Public
 */
router.get('/city/:city', venueController.getVenuesByCity);

module.exports = router;
