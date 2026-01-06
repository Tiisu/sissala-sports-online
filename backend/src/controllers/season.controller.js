/**
 * Season Controller - Stub Implementation
 */

const Season = require('../models/Season.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getSeasons = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const seasons = await Season.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await Season.countDocuments();

  sendPaginated(res, 200, seasons, page, limit, total, 'Seasons retrieved successfully');
});

exports.getActiveSeasons = asyncHandler(async (req, res, next) => {
  const seasons = await Season.find({ status: 'active' });
  sendSuccess(res, 200, { seasons }, 'Active seasons retrieved successfully');
});

exports.getSeason = asyncHandler(async (req, res, next) => {
  const season = await Season.findById(req.params.id);
  if (!season) return next(new ApiError(404, 'Season not found'));
  sendSuccess(res, 200, { season }, 'Season retrieved successfully');
});

exports.getSeasonBySlug = asyncHandler(async (req, res, next) => {
  const season = await Season.findOne({ slug: req.params.slug });
  if (!season) return next(new ApiError(404, 'Season not found'));
  sendSuccess(res, 200, { season }, 'Season retrieved successfully');
});

exports.createSeason = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const season = await Season.create(req.body);
  sendSuccess(res, 201, { season }, 'Season created successfully');
});

exports.updateSeason = asyncHandler(async (req, res, next) => {
  const season = await Season.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!season) return next(new ApiError(404, 'Season not found'));
  sendSuccess(res, 200, { season }, 'Season updated successfully');
});

exports.deleteSeason = asyncHandler(async (req, res, next) => {
  const season = await Season.findById(req.params.id);
  if (!season) return next(new ApiError(404, 'Season not found'));
  await season.deleteOne();
  sendSuccess(res, 200, null, 'Season deleted successfully');
});

exports.getSeasonMatches = asyncHandler(async (req, res, next) => {
  const Match = require('../models/Match.model');
  const matches = await Match.find({ season: req.params.id });
  sendSuccess(res, 200, { matches }, 'Season matches retrieved successfully');
});

exports.getSeasonStandings = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { standings: [] }, 'Season standings (placeholder)');
});

exports.getTopScorers = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { topScorers: [] }, 'Top scorers (placeholder)');
});

exports.getSeasonStatistics = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { statistics: {} }, 'Season statistics (placeholder)');
});

exports.updateSeasonStatus = asyncHandler(async (req, res, next) => {
  const season = await Season.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!season) return next(new ApiError(404, 'Season not found'));
  sendSuccess(res, 200, { season }, 'Season status updated successfully');
});
