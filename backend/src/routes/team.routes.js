/**
 * Team Routes
 * Handles team management operations
 */

const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadSingle, uploadFields } = require('../middleware/upload.middleware');

/**
 * @route   GET /api/teams
 * @desc    Get all teams
 * @access  Public
 */
router.get('/', teamController.getTeams);

/**
 * @route   GET /api/teams/:id
 * @desc    Get single team by ID
 * @access  Public
 */
router.get('/:id', teamController.getTeam);

/**
 * @route   GET /api/teams/slug/:slug
 * @desc    Get team by slug
 * @access  Public
 */
router.get('/slug/:slug', teamController.getTeamBySlug);

/**
 * @route   POST /api/teams
 * @desc    Create new team
 * @access  Private/Admin/Manager
 */
router.post(
  '/',
  protect,
  authorize('admin', 'manager'),
  uploadFields([
    { name: 'teamLogo', maxCount: 1 },
    { name: 'teamPhoto', maxCount: 1 }
  ]),
  teamController.createTeam
);

/**
 * @route   PUT /api/teams/:id
 * @desc    Update team
 * @access  Private/Admin/Manager
 */
router.put(
  '/:id',
  protect,
  authorize('admin', 'manager'),
  uploadFields([
    { name: 'teamLogo', maxCount: 1 },
    { name: 'teamPhoto', maxCount: 1 }
  ]),
  teamController.updateTeam
);

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete team
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), teamController.deleteTeam);

/**
 * @route   GET /api/teams/:id/squad
 * @desc    Get team squad (all players)
 * @access  Public
 */
router.get('/:id/squad', teamController.getTeamSquad);

/**
 * @route   GET /api/teams/:id/matches
 * @desc    Get all team matches
 * @access  Public
 */
router.get('/:id/matches', teamController.getTeamMatches);

/**
 * @route   GET /api/teams/:id/statistics
 * @desc    Get team statistics
 * @access  Public
 */
router.get('/:id/statistics', teamController.getTeamStatistics);

/**
 * @route   GET /api/teams/:id/form
 * @desc    Get team form (recent results)
 * @access  Public
 */
router.get('/:id/form', teamController.getTeamForm);

/**
 * @route   PUT /api/teams/:id/statistics
 * @desc    Update team statistics after match
 * @access  Private/Admin
 */
router.put(
  '/:id/statistics',
  protect,
  authorize('admin'),
  teamController.updateTeamStatistics
);

/**
 * @route   PUT /api/teams/:id/reset-statistics
 * @desc    Reset team statistics (for new season)
 * @access  Private/Admin
 */
router.put(
  '/:id/reset-statistics',
  protect,
  authorize('admin'),
  teamController.resetTeamStatistics
);

module.exports = router;
