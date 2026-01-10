/**
 * Player Controller - Stub Implementation
 */

const Player = require('../models/Player.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');
const { cache, cacheKeys } = require('../utils/cache.util');

exports.getPlayers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { teamId } = req.query;
  
  // Generate cache key
  const cacheKey = cacheKeys.playersList(teamId) + `:page:${page}:limit:${limit}`;
  
  // Try to get from cache
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return sendPaginated(res, 200, cachedData.players, page, limit, cachedData.total, 'Players retrieved from cache');
  }

  const players = await Player.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await Player.countDocuments();
  
  // Cache for 30 minutes (1800 seconds)
  await cache.set(cacheKey, { players, total }, 1800);

  sendPaginated(res, 200, players, page, limit, total, 'Players retrieved successfully');
});

exports.searchPlayers = asyncHandler(async (req, res, next) => {
  const query = req.query.q || '';
  const players = await Player.find({
    $or: [
      { firstName: new RegExp(query, 'i') },
      { lastName: new RegExp(query, 'i') }
    ]
  }).limit(20);
  sendSuccess(res, 200, { players }, 'Search results');
});

exports.getPlayer = asyncHandler(async (req, res, next) => {
  const playerId = req.params.id;
  
  // Generate cache key
  const cacheKey = cacheKeys.playerById(playerId);
  
  // Try to get from cache
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return sendSuccess(res, 200, { player: cachedData, fromCache: true }, 'Player retrieved from cache');
  }
  
  const player = await Player.findById(playerId).populate('currentTeam');
  if (!player) return next(new ApiError(404, 'Player not found'));
  
  // Cache for 1 hour (3600 seconds)
  await cache.set(cacheKey, player, 3600);
  
  sendSuccess(res, 200, { player, fromCache: false }, 'Player retrieved successfully');
});

exports.getPlayerBySlug = asyncHandler(async (req, res, next) => {
  const player = await Player.findOne({ slug: req.params.slug }).populate('currentTeam');
  if (!player) return next(new ApiError(404, 'Player not found'));
  sendSuccess(res, 200, { player }, 'Player retrieved successfully');
});

exports.createPlayer = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  
  // Upload photo to Cloudinary if file provided
  if (req.file) {
    const { uploadPlayerPhoto } = require('../utils/cloudinaryUpload.util');
    req.body.photo = await uploadPlayerPhoto(req.file.buffer);
  }
  
  const player = await Player.create(req.body);
  
  // Invalidate caches
  await cache.deletePattern('players:*');
  await cache.deletePattern(`team:${player.currentTeam}:squad`);
  
  sendSuccess(res, 201, { player }, 'Player created successfully');
});

exports.updatePlayer = asyncHandler(async (req, res, next) => {
  // Upload photo to Cloudinary if file provided
  if (req.file) {
    const { uploadPlayerPhoto } = require('../utils/cloudinaryUpload.util');
    req.body.photo = await uploadPlayerPhoto(req.file.buffer);
  }
  
  const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!player) return next(new ApiError(404, 'Player not found'));
  
  // Invalidate caches
  await cache.delete(cacheKeys.playerById(req.params.id));
  await cache.deletePattern('players:*');
  await cache.deletePattern(`team:${player.currentTeam}:squad`);
  await cache.deletePattern('season:*:topscorers');
  
  sendSuccess(res, 200, { player }, 'Player updated successfully');
});

exports.deletePlayer = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id);
  if (!player) return next(new ApiError(404, 'Player not found'));
  
  const teamId = player.currentTeam;
  await player.deleteOne();
  
  // Invalidate caches
  await cache.delete(cacheKeys.playerById(req.params.id));
  await cache.deletePattern('players:*');
  await cache.deletePattern(`team:${teamId}:squad`);
  await cache.deletePattern('season:*');
  
  sendSuccess(res, 200, null, 'Player deleted successfully');
});

exports.getPlayerStatistics = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id);
  if (!player) return next(new ApiError(404, 'Player not found'));
  sendSuccess(res, 200, { statistics: player.statistics }, 'Player statistics retrieved successfully');
});

exports.getPlayerCareer = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id).populate('transferHistory.team');
  if (!player) return next(new ApiError(404, 'Player not found'));
  sendSuccess(res, 200, { career: player.transferHistory }, 'Player career retrieved successfully');
});

exports.getPlayerMatches = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { matches: [] }, 'Player matches (placeholder)');
});

exports.updatePlayerStatistics = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id);
  if (!player) return next(new ApiError(404, 'Player not found'));
  player.updateStatistics(req.body);
  await player.save();
  sendSuccess(res, 200, { player }, 'Player statistics updated successfully');
});

exports.transferPlayer = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id);
  if (!player) return next(new ApiError(404, 'Player not found'));
  player.transferTo(req.body.newTeam, req.body.transferFee);
  await player.save();
  sendSuccess(res, 200, { player }, 'Player transferred successfully');
});

exports.updateInjuryStatus = asyncHandler(async (req, res, next) => {
  const player = await Player.findByIdAndUpdate(req.params.id, {
    isInjured: req.body.isInjured,
    injuryDetails: req.body.injuryDetails,
    expectedReturnDate: req.body.expectedReturnDate
  }, { new: true });
  if (!player) return next(new ApiError(404, 'Player not found'));
  sendSuccess(res, 200, { player }, 'Injury status updated successfully');
});

exports.getPlayersByPosition = asyncHandler(async (req, res, next) => {
  const players = await Player.find({ position: req.params.position });
  sendSuccess(res, 200, { players }, 'Players retrieved successfully');
});

exports.getPlayersByTeam = asyncHandler(async (req, res, next) => {
  const players = await Player.find({ currentTeam: req.params.teamId });
  sendSuccess(res, 200, { players }, 'Players retrieved successfully');
});
