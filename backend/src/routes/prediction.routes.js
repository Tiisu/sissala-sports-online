/**
 * Prediction Routes
 * Handles match predictions by users
 */

const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/predictions
 * @desc    Get all predictions (for current user)
 * @access  Private
 */
router.get('/', protect, predictionController.getPredictions);

/**
 * @route   GET /api/predictions/match/:matchId
 * @desc    Get all predictions for a match
 * @access  Public
 */
router.get('/match/:matchId', predictionController.getPredictionsByMatch);

/**
 * @route   GET /api/predictions/user/:userId
 * @desc    Get predictions by user
 * @access  Public
 */
router.get('/user/:userId', predictionController.getPredictionsByUser);

/**
 * @route   GET /api/predictions/:id
 * @desc    Get single prediction by ID
 * @access  Private
 */
router.get('/:id', protect, predictionController.getPredictionById);

/**
 * @route   POST /api/predictions
 * @desc    Create new prediction
 * @access  Private
 */
router.post('/', protect, predictionController.createPrediction);

/**
 * @route   PUT /api/predictions/:id
 * @desc    Update prediction (before match starts)
 * @access  Private
 */
router.put('/:id', protect, predictionController.updatePrediction);

/**
 * @route   DELETE /api/predictions/:id
 * @desc    Delete prediction (before match starts)
 * @access  Private
 */
router.delete('/:id', protect, predictionController.deletePrediction);

/**
 * @route   GET /api/predictions/leaderboard/season/:seasonId
 * @desc    Get prediction leaderboard for a season
 * @access  Public
 */
router.get('/leaderboard/season/:seasonId', predictionController.getLeaderboard);

/**
 * @route   GET /api/predictions/user/:userId/stats
 * @desc    Get user prediction statistics
 * @access  Public
 */
router.get('/user/:userId/stats', predictionController.getUserPredictionStats);

/**
 * @route   GET /api/predictions/match/:matchId/my-prediction
 * @desc    Get current user's prediction for a match
 * @access  Private
 */
router.get('/match/:matchId/my-prediction', protect, predictionController.getMyPrediction);

module.exports = router;
