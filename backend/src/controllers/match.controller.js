/**
 * Match Controller - Stub Implementation
 */

const Match = require('../models/Match.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getMatches = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const matches = await Match.find()
    .populate('homeTeam', 'name logo')
    .populate('awayTeam', 'name logo')
    .populate('venue', 'name city')
    .populate('season', 'name')
    .populate('league', 'name')
    .skip(skip)
    .limit(limit)
    .sort('-matchDate');
  const total = await Match.countDocuments();

  sendPaginated(res, 200, matches, page, limit, total, 'Matches retrieved successfully');
});

exports.getUpcomingMatches = asyncHandler(async (req, res, next) => {
  const matches = await Match.find({ status: 'scheduled', matchDate: { $gte: new Date() } })
    .populate('homeTeam', 'name logo')
    .populate('awayTeam', 'name logo')
    .populate('venue', 'name city')
    .sort('matchDate')
    .limit(10);
  sendSuccess(res, 200, { matches }, 'Upcoming matches retrieved successfully');
});

exports.getLiveMatches = asyncHandler(async (req, res, next) => {
  const matches = await Match.find({ status: { $in: ['live', 'halftime'] } })
    .populate('homeTeam', 'name logo')
    .populate('awayTeam', 'name logo')
    .populate('venue', 'name city');
  sendSuccess(res, 200, { matches }, 'Live matches retrieved successfully');
});

exports.getRecentMatches = asyncHandler(async (req, res, next) => {
  const matches = await Match.find({ status: 'finished' })
    .populate('homeTeam', 'name logo')
    .populate('awayTeam', 'name logo')
    .populate('venue', 'name city')
    .sort('-matchDate')
    .limit(10);
  sendSuccess(res, 200, { matches }, 'Recent matches retrieved successfully');
});

exports.getMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id)
    .populate('homeTeam', 'name logo')
    .populate('awayTeam', 'name logo')
    .populate('venue', 'name city capacity')
    .populate('season', 'name')
    .populate('league', 'name');
  if (!match) return next(new ApiError(404, 'Match not found'));
  sendSuccess(res, 200, { match }, 'Match retrieved successfully');
});

exports.createMatch = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const match = await Match.create(req.body);
  sendSuccess(res, 201, { match }, 'Match created successfully');
});

exports.updateMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!match) return next(new ApiError(404, 'Match not found'));
  sendSuccess(res, 200, { match }, 'Match updated successfully');
});

exports.deleteMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ApiError(404, 'Match not found'));
  await match.deleteOne();
  sendSuccess(res, 200, null, 'Match deleted successfully');
});

exports.updateLineup = asyncHandler(async (req, res, next) => {
  const match = await Match.findByIdAndUpdate(req.params.id, { lineups: req.body.lineups }, { new: true });
  if (!match) return next(new ApiError(404, 'Match not found'));
  sendSuccess(res, 200, { match }, 'Lineup updated successfully');
});

exports.startMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ApiError(404, 'Match not found'));
  match.startMatch();
  await match.save();
  sendSuccess(res, 200, { match }, 'Match started successfully');
});

exports.setHalftime = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ApiError(404, 'Match not found'));
  match.setHalftime();
  await match.save();
  sendSuccess(res, 200, { match }, 'Halftime set successfully');
});

exports.finishMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ApiError(404, 'Match not found'));
  match.finishMatch();
  await match.save();
  sendSuccess(res, 200, { match }, 'Match finished successfully');
});

exports.addGoalEvent = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ApiError(404, 'Match not found'));
  match.addGoal(req.body.team, req.body.player, req.body.minute, req.body.assistedBy);
  await match.save();
  sendSuccess(res, 200, { match }, 'Goal added successfully');
});

exports.addCardEvent = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ApiError(404, 'Match not found'));
  match.addCard(req.body.team, req.body.player, req.body.minute, req.body.cardType);
  await match.save();
  sendSuccess(res, 200, { match }, 'Card added successfully');
});

exports.addSubstitutionEvent = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ApiError(404, 'Match not found'));
  match.addSubstitution(req.body.team, req.body.playerOut, req.body.playerIn, req.body.minute);
  await match.save();
  sendSuccess(res, 200, { match }, 'Substitution added successfully');
});

exports.updateStatistics = asyncHandler(async (req, res, next) => {
  const match = await Match.findByIdAndUpdate(req.params.id, { statistics: req.body }, { new: true });
  if (!match) return next(new ApiError(404, 'Match not found'));
  sendSuccess(res, 200, { match }, 'Match statistics updated successfully');
});

exports.getMatchEvents = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ApiError(404, 'Match not found'));
  sendSuccess(res, 200, { events: match.events }, 'Match events retrieved successfully');
});

exports.getMatchesByTeam = asyncHandler(async (req, res, next) => {
  const matches = await Match.find({ $or: [{ homeTeam: req.params.teamId }, { awayTeam: req.params.teamId }] })
    .populate('homeTeam', 'name logo')
    .populate('awayTeam', 'name logo')
    .populate('venue', 'name city')
    .sort('-matchDate');
  sendSuccess(res, 200, { matches }, 'Matches retrieved successfully');
});

exports.getMatchesByDate = asyncHandler(async (req, res, next) => {
  const date = new Date(req.params.date);
  const matches = await Match.find({ matchDate: { $gte: date, $lt: new Date(date.getTime() + 86400000) } })
    .populate('homeTeam', 'name logo')
    .populate('awayTeam', 'name logo')
    .populate('venue', 'name city');
  sendSuccess(res, 200, { matches }, 'Matches retrieved successfully');
});
