/**
 * Match Routes
 * Handles match management and live updates
 */

const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/matches
 * @desc    Get all matches
 * @access  Public
 */
router.get('/', matchController.getMatches);

/**
 * @route   GET /api/matches/upcoming
 * @desc    Get upcoming matches
 * @access  Public
 */
router.get('/upcoming', matchController.getUpcomingMatches);

/**
 * @route   GET /api/matches/live
 * @desc    Get live matches
 * @access  Public
 */
router.get('/live', matchController.getLiveMatches);

/**
 * @route   GET /api/matches/recent
 * @desc    Get recent finished matches
 * @access  Public
 */
router.get('/recent', matchController.getRecentMatches);

/**
 * @route   GET /api/matches/:id
 * @desc    Get single match by ID
 * @access  Public
 */
router.get('/:id', matchController.getMatch);

/**
 * @route   POST /api/matches
 * @desc    Create new match
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), matchController.createMatch);

/**
 * @route   PUT /api/matches/:id
 * @desc    Update match
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), matchController.updateMatch);

/**
 * @route   DELETE /api/matches/:id
 * @desc    Delete match
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), matchController.deleteMatch);

/**
 * @route   PUT /api/matches/:id/lineup
 * @desc    Update match lineup
 * @access  Private/Admin/Manager
 */
router.put(
  '/:id/lineup',
  protect,
  authorize('admin', 'manager'),
  matchController.updateLineup
);

/**
 * @route   PUT /api/matches/:id/start
 * @desc    Start match (set status to live)
 * @access  Private/Admin
 */
router.put('/:id/start', protect, authorize('admin'), matchController.startMatch);

/**
 * @route   PUT /api/matches/:id/halftime
 * @desc    Set match to halftime
 * @access  Private/Admin
 */
router.put('/:id/halftime', protect, authorize('admin'), matchController.setHalftime);

/**
 * @route   PUT /api/matches/:id/finish
 * @desc    Finish match
 * @access  Private/Admin
 */
router.put('/:id/finish', protect, authorize('admin'), matchController.finishMatch);

/**
 * @route   POST /api/matches/:id/events/goal
 * @desc    Add goal event to match
 * @access  Private/Admin
 */
router.post(
  '/:id/events/goal',
  protect,
  authorize('admin'),
  matchController.addGoalEvent
);

/**
 * @route   POST /api/matches/:id/events/card
 * @desc    Add card event to match
 * @access  Private/Admin
 */
router.post(
  '/:id/events/card',
  protect,
  authorize('admin'),
  matchController.addCardEvent
);

/**
 * @route   POST /api/matches/:id/events/substitution
 * @desc    Add substitution event to match
 * @access  Private/Admin
 */
router.post(
  '/:id/events/substitution',
  protect,
  authorize('admin'),
  matchController.addSubstitutionEvent
);

/**
 * @route   PUT /api/matches/:id/statistics
 * @desc    Update match statistics
 * @access  Private/Admin
 */
router.put(
  '/:id/statistics',
  protect,
  authorize('admin'),
  matchController.updateStatistics
);

/**
 * @route   GET /api/matches/:id/events
 * @desc    Get all match events
 * @access  Public
 */
router.get('/:id/events', matchController.getMatchEvents);

/**
 * @route   GET /api/matches/team/:teamId
 * @desc    Get matches by team
 * @access  Public
 */
router.get('/team/:teamId', matchController.getMatchesByTeam);

/**
 * @route   GET /api/matches/date/:date
 * @desc    Get matches by date
 * @access  Public
 */
router.get('/date/:date', matchController.getMatchesByDate);

module.exports = router;
