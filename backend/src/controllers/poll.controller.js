/**
 * Poll Controller - Stub Implementation
 */

const Poll = require('../models/Poll.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getPolls = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const polls = await Poll.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await Poll.countDocuments();

  sendPaginated(res, 200, polls, page, limit, total, 'Polls retrieved successfully');
});

exports.getActivePolls = asyncHandler(async (req, res, next) => {
  const polls = await Poll.find({ status: 'active', endDate: { $gte: new Date() } }).sort('-createdAt');
  sendSuccess(res, 200, { polls }, 'Active polls retrieved successfully');
});

exports.getPollsByCategory = asyncHandler(async (req, res, next) => {
  const polls = await Poll.find({ category: req.params.category }).sort('-createdAt');
  sendSuccess(res, 200, { polls }, 'Polls retrieved successfully');
});

exports.getPollById = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return next(new ApiError(404, 'Poll not found'));
  const hasVoted = req.user ? poll.hasUserVoted(req.user.id) : false;
  sendSuccess(res, 200, { poll, hasVoted }, 'Poll retrieved successfully');
});

exports.getPollBySlug = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findOne({ slug: req.params.slug });
  if (!poll) return next(new ApiError(404, 'Poll not found'));
  const hasVoted = req.user ? poll.hasUserVoted(req.user.id) : false;
  sendSuccess(res, 200, { poll, hasVoted }, 'Poll retrieved successfully');
});

exports.createPoll = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const poll = await Poll.create(req.body);
  sendSuccess(res, 201, { poll }, 'Poll created successfully');
});

exports.updatePoll = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!poll) return next(new ApiError(404, 'Poll not found'));
  sendSuccess(res, 200, { poll }, 'Poll updated successfully');
});

exports.deletePoll = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return next(new ApiError(404, 'Poll not found'));
  await poll.deleteOne();
  sendSuccess(res, 200, null, 'Poll deleted successfully');
});

exports.vote = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return next(new ApiError(404, 'Poll not found'));
  
  try {
    await poll.vote(req.body.optionId, req.user.id);
    sendSuccess(res, 200, { poll }, 'Vote submitted successfully');
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
});

exports.getResults = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return next(new ApiError(404, 'Poll not found'));
  const results = poll.getResults();
  sendSuccess(res, 200, { results }, 'Poll results retrieved successfully');
});

exports.updateStatus = asyncHandler(async (req, res, next) => {
  const poll = await Poll.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!poll) return next(new ApiError(404, 'Poll not found'));
  sendSuccess(res, 200, { poll }, 'Poll status updated successfully');
});

exports.getPollsByMatch = asyncHandler(async (req, res, next) => {
  const polls = await Poll.find({ relatedMatch: req.params.matchId }).sort('-createdAt');
  sendSuccess(res, 200, { polls }, 'Polls retrieved successfully');
});
