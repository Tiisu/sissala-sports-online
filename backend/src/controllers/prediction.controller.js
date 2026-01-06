/**
 * Prediction Controller - Stub Implementation
 */

const Prediction = require('../models/Prediction.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getPredictions = asyncHandler(async (req, res, next) => {
  const predictions = await Prediction.find({ user: req.user.id }).populate('match').sort('-createdAt');
  sendSuccess(res, 200, { predictions }, 'Predictions retrieved successfully');
});

exports.getPredictionsByMatch = asyncHandler(async (req, res, next) => {
  const predictions = await Prediction.find({ match: req.params.matchId }).populate('user', 'name');
  sendSuccess(res, 200, { predictions }, 'Predictions retrieved successfully');
});

exports.getPredictionsByUser = asyncHandler(async (req, res, next) => {
  const predictions = await Prediction.find({ user: req.params.userId }).populate('match').sort('-createdAt');
  sendSuccess(res, 200, { predictions }, 'Predictions retrieved successfully');
});

exports.getPredictionById = asyncHandler(async (req, res, next) => {
  const prediction = await Prediction.findById(req.params.id).populate('match user');
  if (!prediction) return next(new ApiError(404, 'Prediction not found'));
  if (prediction.user._id.toString() !== req.user.id) {
    return next(new ApiError(403, 'Not authorized to view this prediction'));
  }
  sendSuccess(res, 200, { prediction }, 'Prediction retrieved successfully');
});

exports.createPrediction = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const prediction = await Prediction.create(req.body);
  sendSuccess(res, 201, { prediction }, 'Prediction created successfully');
});

exports.updatePrediction = asyncHandler(async (req, res, next) => {
  const prediction = await Prediction.findById(req.params.id);
  if (!prediction) return next(new ApiError(404, 'Prediction not found'));
  if (prediction.user.toString() !== req.user.id) {
    return next(new ApiError(403, 'Not authorized to update this prediction'));
  }
  const updatedPrediction = await Prediction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  sendSuccess(res, 200, { prediction: updatedPrediction }, 'Prediction updated successfully');
});

exports.deletePrediction = asyncHandler(async (req, res, next) => {
  const prediction = await Prediction.findById(req.params.id);
  if (!prediction) return next(new ApiError(404, 'Prediction not found'));
  if (prediction.user.toString() !== req.user.id) {
    return next(new ApiError(403, 'Not authorized to delete this prediction'));
  }
  await prediction.deleteOne();
  sendSuccess(res, 200, null, 'Prediction deleted successfully');
});

exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const leaderboard = await Prediction.aggregate([
    { $match: { status: { $ne: 'pending' } } },
    { $group: { _id: '$user', totalPoints: { $sum: '$pointsEarned' } } },
    { $sort: { totalPoints: -1 } },
    { $limit: 50 }
  ]);
  sendSuccess(res, 200, { leaderboard }, 'Leaderboard retrieved successfully');
});

exports.getUserPredictionStats = asyncHandler(async (req, res, next) => {
  const stats = await Prediction.aggregate([
    { $match: { user: req.params.userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$pointsEarned' }
      }
    }
  ]);
  sendSuccess(res, 200, { stats }, 'User prediction stats retrieved successfully');
});

exports.getMyPrediction = asyncHandler(async (req, res, next) => {
  const prediction = await Prediction.findOne({ match: req.params.matchId, user: req.user.id });
  sendSuccess(res, 200, { prediction }, 'Prediction retrieved successfully');
});
