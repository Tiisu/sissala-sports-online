/**
 * Statistics Routes
 * Handles statistics and analytics operations
 */

const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');

/**
 * @route   GET /api/statistics/league/:leagueId/table
 * @desc    Get league table/standings
 * @access  Public
 */
router.get('/league/:leagueId/table', statisticsController.getLeagueTable);

/**
 * @route   GET /api/statistics/season/:seasonId/table
 * @desc    Get season table/standings
 * @access  Public
 */
router.get('/season/:seasonId/table', statisticsController.getSeasonTable);

/**
 * @route   GET /api/statistics/season/:seasonId/top-scorers
 * @desc    Get top scorers in a season
 * @access  Public
 */
router.get('/season/:seasonId/top-scorers', statisticsController.getTopScorers);

/**
 * @route   GET /api/statistics/season/:seasonId/top-assists
 * @desc    Get top assist providers in a season
 * @access  Public
 */
router.get('/season/:seasonId/top-assists', statisticsController.getTopAssists);

/**
 * @route   GET /api/statistics/season/:seasonId/disciplinary
 * @desc    Get disciplinary records (cards) in a season
 * @access  Public
 */
router.get('/season/:seasonId/disciplinary', statisticsController.getDisciplinaryRecords);

/**
 * @route   GET /api/statistics/team/:teamId/overview
 * @desc    Get team statistics overview
 * @access  Public
 */
router.get('/team/:teamId/overview', statisticsController.getTeamOverview);

/**
 * @route   GET /api/statistics/team/:teamId/head-to-head/:opponentId
 * @desc    Get head-to-head statistics between two teams
 * @access  Public
 */
router.get('/team/:teamId/head-to-head/:opponentId', statisticsController.getHeadToHead);

/**
 * @route   GET /api/statistics/player/:playerId/overview
 * @desc    Get player statistics overview
 * @access  Public
 */
router.get('/player/:playerId/overview', statisticsController.getPlayerOverview);

/**
 * @route   GET /api/statistics/match/:matchId/summary
 * @desc    Get match statistics summary
 * @access  Public
 */
router.get('/match/:matchId/summary', statisticsController.getMatchSummary);

/**
 * @route   GET /api/statistics/season/:seasonId/overview
 * @desc    Get overall season statistics
 * @access  Public
 */
router.get('/season/:seasonId/overview', statisticsController.getSeasonOverview);

/**
 * @route   GET /api/statistics/season/:seasonId/clean-sheets
 * @desc    Get clean sheet statistics (goalkeepers/teams)
 * @access  Public
 */
router.get('/season/:seasonId/clean-sheets', statisticsController.getCleanSheets);

/**
 * @route   GET /api/statistics/season/:seasonId/attendance
 * @desc    Get attendance statistics
 * @access  Public
 */
router.get('/season/:seasonId/attendance', statisticsController.getAttendanceStats);

module.exports = router;
