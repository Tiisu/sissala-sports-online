/**
 * Player Routes
 * Handles player management operations
 */

const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

/**
 * @route   GET /api/players
 * @desc    Get all players
 * @access  Public
 */
router.get('/', playerController.getPlayers);

/**
 * @route   GET /api/players/search
 * @desc    Search players by name, position, team
 * @access  Public
 */
router.get('/search', playerController.searchPlayers);

/**
 * @route   GET /api/players/:id
 * @desc    Get single player by ID
 * @access  Public
 */
router.get('/:id', playerController.getPlayer);

/**
 * @route   GET /api/players/slug/:slug
 * @desc    Get player by slug
 * @access  Public
 */
router.get('/slug/:slug', playerController.getPlayerBySlug);

/**
 * @route   POST /api/players
 * @desc    Create new player
 * @access  Private/Admin/Manager
 */
router.post(
  '/',
  protect,
  authorize('admin', 'manager'),
  uploadSingle('playerPhoto'),
  playerController.createPlayer
);

/**
 * @route   PUT /api/players/:id
 * @desc    Update player
 * @access  Private/Admin/Manager
 */
router.put(
  '/:id',
  protect,
  authorize('admin', 'manager'),
  uploadSingle('playerPhoto'),
  playerController.updatePlayer
);

/**
 * @route   DELETE /api/players/:id
 * @desc    Delete player
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), playerController.deletePlayer);

/**
 * @route   GET /api/players/:id/statistics
 * @desc    Get player statistics
 * @access  Public
 */
router.get('/:id/statistics', playerController.getPlayerStatistics);

/**
 * @route   GET /api/players/:id/career
 * @desc    Get player career history
 * @access  Public
 */
router.get('/:id/career', playerController.getPlayerCareer);

/**
 * @route   GET /api/players/:id/matches
 * @desc    Get player match history
 * @access  Public
 */
router.get('/:id/matches', playerController.getPlayerMatches);

/**
 * @route   PUT /api/players/:id/statistics
 * @desc    Update player statistics after match
 * @access  Private/Admin
 */
router.put(
  '/:id/statistics',
  protect,
  authorize('admin'),
  playerController.updatePlayerStatistics
);

/**
 * @route   PUT /api/players/:id/transfer
 * @desc    Transfer player to another team
 * @access  Private/Admin/Manager
 */
router.put(
  '/:id/transfer',
  protect,
  authorize('admin', 'manager'),
  playerController.transferPlayer
);

/**
 * @route   PUT /api/players/:id/injury
 * @desc    Update player injury status
 * @access  Private/Admin/Manager
 */
router.put(
  '/:id/injury',
  protect,
  authorize('admin', 'manager'),
  playerController.updateInjuryStatus
);

/**
 * @route   GET /api/players/position/:position
 * @desc    Get players by position
 * @access  Public
 */
router.get('/position/:position', playerController.getPlayersByPosition);

/**
 * @route   GET /api/players/team/:teamId
 * @desc    Get players by team
 * @access  Public
 */
router.get('/team/:teamId', playerController.getPlayersByTeam);

module.exports = router;
