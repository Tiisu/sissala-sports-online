/**
 * League Controller - Stub Implementation
 */

const League = require('../models/League.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getLeagues = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const leagues = await League.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await League.countDocuments();

  sendPaginated(res, 200, leagues, page, limit, total, 'Leagues retrieved successfully');
});

exports.getLeague = asyncHandler(async (req, res, next) => {
  const league = await League.findById(req.params.id);
  if (!league) return next(new ApiError(404, 'League not found'));
  sendSuccess(res, 200, { league }, 'League retrieved successfully');
});

exports.getLeagueBySlug = asyncHandler(async (req, res, next) => {
  const league = await League.findOne({ slug: req.params.slug });
  if (!league) return next(new ApiError(404, 'League not found'));
  sendSuccess(res, 200, { league }, 'League retrieved successfully');
});

exports.createLeague = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  if (req.file) req.body.logo = req.file.path;
  const league = await League.create(req.body);
  sendSuccess(res, 201, { league }, 'League created successfully');
});

exports.updateLeague = asyncHandler(async (req, res, next) => {
  if (req.file) req.body.logo = req.file.path;
  const league = await League.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!league) return next(new ApiError(404, 'League not found'));
  sendSuccess(res, 200, { league }, 'League updated successfully');
});

exports.deleteLeague = asyncHandler(async (req, res, next) => {
  const league = await League.findById(req.params.id);
  if (!league) return next(new ApiError(404, 'League not found'));
  await league.deleteOne();
  sendSuccess(res, 200, null, 'League deleted successfully');
});

exports.getLeagueTeams = asyncHandler(async (req, res, next) => {
  const Team = require('../models/Team.model');
  const teams = await Team.find({ league: req.params.id });
  sendSuccess(res, 200, { teams }, 'League teams retrieved successfully');
});

exports.getLeagueSeasons = asyncHandler(async (req, res, next) => {
  const Season = require('../models/Season.model');
  const seasons = await Season.find({ league: req.params.id });
  sendSuccess(res, 200, { seasons }, 'League seasons retrieved successfully');
});

exports.getLeagueStandings = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { standings: [] }, 'League standings (placeholder)');
});
