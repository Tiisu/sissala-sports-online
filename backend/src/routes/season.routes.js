/**
 * Season Routes
 * Handles season management operations
 */

const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/season.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/seasons
 * @desc    Get all seasons
 * @access  Public
 */
router.get('/', seasonController.getSeasons);

/**
 * @route   GET /api/seasons/active
 * @desc    Get all active seasons
 * @access  Public
 */
router.get('/active', seasonController.getActiveSeasons);

/**
 * @route   GET /api/seasons/:id
 * @desc    Get single season by ID
 * @access  Public
 */
router.get('/:id', seasonController.getSeason);

/**
 * @route   GET /api/seasons/slug/:slug
 * @desc    Get season by slug
 * @access  Public
 */
router.get('/slug/:slug', seasonController.getSeasonBySlug);

/**
 * @route   POST /api/seasons
 * @desc    Create new season
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), seasonController.createSeason);

/**
 * @route   PUT /api/seasons/:id
 * @desc    Update season
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), seasonController.updateSeason);

/**
 * @route   DELETE /api/seasons/:id
 * @desc    Delete season
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), seasonController.deleteSeason);

/**
 * @route   GET /api/seasons/:id/matches
 * @desc    Get all matches in a season
 * @access  Public
 */
router.get('/:id/matches', seasonController.getSeasonMatches);

/**
 * @route   GET /api/seasons/:id/standings
 * @desc    Get season standings/table
 * @access  Public
 */
router.get('/:id/standings', seasonController.getSeasonStandings);

/**
 * @route   GET /api/seasons/:id/top-scorers
 * @desc    Get top scorers in a season
 * @access  Public
 */
router.get('/:id/top-scorers', seasonController.getTopScorers);

/**
 * @route   GET /api/seasons/:id/statistics
 * @desc    Get season statistics
 * @access  Public
 */
router.get('/:id/statistics', seasonController.getSeasonStatistics);

/**
 * @route   PUT /api/seasons/:id/status
 * @desc    Update season status
 * @access  Private/Admin
 */
router.put('/:id/status', protect, authorize('admin'), seasonController.updateSeasonStatus);

module.exports = router;
