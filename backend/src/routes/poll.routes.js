/**
 * Poll Routes
 * Handles polls and surveys for fan engagement
 */

const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/polls
 * @desc    Get all polls
 * @access  Public
 */
router.get('/', pollController.getPolls);

/**
 * @route   GET /api/polls/active
 * @desc    Get active polls
 * @access  Public
 */
router.get('/active', pollController.getActivePolls);

/**
 * @route   GET /api/polls/category/:category
 * @desc    Get polls by category
 * @access  Public
 */
router.get('/category/:category', pollController.getPollsByCategory);

/**
 * @route   GET /api/polls/:id
 * @desc    Get single poll by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, pollController.getPollById);

/**
 * @route   GET /api/polls/slug/:slug
 * @desc    Get poll by slug
 * @access  Public
 */
router.get('/slug/:slug', optionalAuth, pollController.getPollBySlug);

/**
 * @route   POST /api/polls
 * @desc    Create new poll
 * @access  Private/Admin/Editor
 */
router.post('/', protect, authorize('admin', 'editor'), pollController.createPoll);

/**
 * @route   PUT /api/polls/:id
 * @desc    Update poll
 * @access  Private/Admin/Editor
 */
router.put('/:id', protect, authorize('admin', 'editor'), pollController.updatePoll);

/**
 * @route   DELETE /api/polls/:id
 * @desc    Delete poll
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), pollController.deletePoll);

/**
 * @route   POST /api/polls/:id/vote
 * @desc    Vote on a poll
 * @access  Private
 */
router.post('/:id/vote', protect, pollController.vote);

/**
 * @route   GET /api/polls/:id/results
 * @desc    Get poll results
 * @access  Public
 */
router.get('/:id/results', pollController.getResults);

/**
 * @route   PUT /api/polls/:id/status
 * @desc    Update poll status (active/ended/draft)
 * @access  Private/Admin/Editor
 */
router.put('/:id/status', protect, authorize('admin', 'editor'), pollController.updateStatus);

/**
 * @route   GET /api/polls/match/:matchId
 * @desc    Get polls related to a match
 * @access  Public
 */
router.get('/match/:matchId', pollController.getPollsByMatch);

module.exports = router;
