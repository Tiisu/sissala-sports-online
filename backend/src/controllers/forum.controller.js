/**
 * Forum Controller - Stub Implementation
 */

const Forum = require('../models/Forum.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getForums = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const forums = await Forum.find().skip(skip).limit(limit).sort('-lastActivityAt');
  const total = await Forum.countDocuments();

  sendPaginated(res, 200, forums, page, limit, total, 'Forums retrieved successfully');
});

exports.getForumsByCategory = asyncHandler(async (req, res, next) => {
  const forums = await Forum.find({ category: req.params.category }).sort('-lastActivityAt');
  sendSuccess(res, 200, { forums }, 'Forums retrieved successfully');
});

exports.getPopularForums = asyncHandler(async (req, res, next) => {
  const forums = await Forum.find().sort('-views').limit(10);
  sendSuccess(res, 200, { forums }, 'Popular forums retrieved successfully');
});

exports.getForumById = asyncHandler(async (req, res, next) => {
  const forum = await Forum.findById(req.params.id).populate('author replies.user');
  if (!forum) return next(new ApiError(404, 'Forum not found'));
  forum.incrementViews();
  sendSuccess(res, 200, { forum }, 'Forum retrieved successfully');
});

exports.getForumBySlug = asyncHandler(async (req, res, next) => {
  const forum = await Forum.findOne({ slug: req.params.slug }).populate('author replies.user');
  if (!forum) return next(new ApiError(404, 'Forum not found'));
  forum.incrementViews();
  sendSuccess(res, 200, { forum }, 'Forum retrieved successfully');
});

exports.createForum = asyncHandler(async (req, res, next) => {
  req.body.author = req.user.id;
  const forum = await Forum.create(req.body);
  sendSuccess(res, 201, { forum }, 'Forum created successfully');
});

exports.updateForum = asyncHandler(async (req, res, next) => {
  const forum = await Forum.findById(req.params.id);
  if (!forum) return next(new ApiError(404, 'Forum not found'));
  if (forum.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to update this forum'));
  }
  const updatedForum = await Forum.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  sendSuccess(res, 200, { forum: updatedForum }, 'Forum updated successfully');
});

exports.deleteForum = asyncHandler(async (req, res, next) => {
  const forum = await Forum.findById(req.params.id);
  if (!forum) return next(new ApiError(404, 'Forum not found'));
  if (forum.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to delete this forum'));
  }
  await forum.deleteOne();
  sendSuccess(res, 200, null, 'Forum deleted successfully');
});

exports.addReply = asyncHandler(async (req, res, next) => {
  const forum = await Forum.findById(req.params.id);
  if (!forum) return next(new ApiError(404, 'Forum not found'));
  await forum.addReply(req.user.id, req.body.content);
  sendSuccess(res, 200, { forum }, 'Reply added successfully');
});

exports.toggleLike = asyncHandler(async (req, res, next) => {
  const forum = await Forum.findById(req.params.id);
  if (!forum) return next(new ApiError(404, 'Forum not found'));
  await forum.toggleLike();
  sendSuccess(res, 200, { forum }, 'Like toggled successfully');
});

exports.toggleLock = asyncHandler(async (req, res, next) => {
  const forum = await Forum.findById(req.params.id);
  if (!forum) return next(new ApiError(404, 'Forum not found'));
  await forum.toggleLock();
  sendSuccess(res, 200, { forum }, `Forum ${forum.isLocked ? 'locked' : 'unlocked'} successfully`);
});

exports.updateStatus = asyncHandler(async (req, res, next) => {
  const forum = await Forum.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!forum) return next(new ApiError(404, 'Forum not found'));
  sendSuccess(res, 200, { forum }, 'Forum status updated successfully');
});

exports.getForumsByUser = asyncHandler(async (req, res, next) => {
  const forums = await Forum.find({ author: req.params.userId }).sort('-createdAt');
  sendSuccess(res, 200, { forums }, 'Forums retrieved successfully');
});

exports.searchForums = asyncHandler(async (req, res, next) => {
  const forums = await Forum.find({ $text: { $search: req.params.query } }).sort('-lastActivityAt');
  sendSuccess(res, 200, { forums }, 'Search results');
});
