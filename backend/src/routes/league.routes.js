/**
 * League Routes
 * Handles league management operations
 */

const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/league.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

/**
 * @route   GET /api/leagues
 * @desc    Get all leagues
 * @access  Public
 */
router.get('/', leagueController.getLeagues);

/**
 * @route   GET /api/leagues/:id
 * @desc    Get single league by ID
 * @access  Public
 */
router.get('/:id', leagueController.getLeague);

/**
 * @route   GET /api/leagues/slug/:slug
 * @desc    Get league by slug
 * @access  Public
 */
router.get('/slug/:slug', leagueController.getLeagueBySlug);

/**
 * @route   POST /api/leagues
 * @desc    Create new league
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingle('logo'),
  leagueController.createLeague
);

/**
 * @route   PUT /api/leagues/:id
 * @desc    Update league
 * @access  Private/Admin
 */
router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadSingle('logo'),
  leagueController.updateLeague
);

/**
 * @route   DELETE /api/leagues/:id
 * @desc    Delete league
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), leagueController.deleteLeague);

/**
 * @route   GET /api/leagues/:id/teams
 * @desc    Get all teams in a league
 * @access  Public
 */
router.get('/:id/teams', leagueController.getLeagueTeams);

/**
 * @route   GET /api/leagues/:id/seasons
 * @desc    Get all seasons in a league
 * @access  Public
 */
router.get('/:id/seasons', leagueController.getLeagueSeasons);

/**
 * @route   GET /api/leagues/:id/standings
 * @desc    Get league standings (current season)
 * @access  Public
 */
router.get('/:id/standings', leagueController.getLeagueStandings);

module.exports = router;
