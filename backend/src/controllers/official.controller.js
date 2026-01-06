/**
 * Official Controller - Stub Implementation
 */

const Official = require('../models/Official.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getOfficials = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const officials = await Official.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await Official.countDocuments();

  sendPaginated(res, 200, officials, page, limit, total, 'Officials retrieved successfully');
});

exports.getAvailableOfficials = asyncHandler(async (req, res, next) => {
  const officials = await Official.find({ isActive: true, isAvailable: true });
  sendSuccess(res, 200, { officials }, 'Available officials retrieved successfully');
});

exports.getOfficial = asyncHandler(async (req, res, next) => {
  const official = await Official.findById(req.params.id);
  if (!official) return next(new ApiError(404, 'Official not found'));
  sendSuccess(res, 200, { official }, 'Official retrieved successfully');
});

exports.getOfficialBySlug = asyncHandler(async (req, res, next) => {
  const official = await Official.findOne({ slug: req.params.slug });
  if (!official) return next(new ApiError(404, 'Official not found'));
  sendSuccess(res, 200, { official }, 'Official retrieved successfully');
});

exports.createOfficial = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  if (req.file) req.body.photo = req.file.path;
  const official = await Official.create(req.body);
  sendSuccess(res, 201, { official }, 'Official created successfully');
});

exports.updateOfficial = asyncHandler(async (req, res, next) => {
  if (req.file) req.body.photo = req.file.path;
  const official = await Official.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!official) return next(new ApiError(404, 'Official not found'));
  sendSuccess(res, 200, { official }, 'Official updated successfully');
});

exports.deleteOfficial = asyncHandler(async (req, res, next) => {
  const official = await Official.findById(req.params.id);
  if (!official) return next(new ApiError(404, 'Official not found'));
  await official.deleteOne();
  sendSuccess(res, 200, null, 'Official deleted successfully');
});

exports.getOfficialMatches = asyncHandler(async (req, res, next) => {
  const Match = require('../models/Match.model');
  const matches = await Match.find({ referee: req.params.id });
  sendSuccess(res, 200, { matches }, 'Official matches retrieved successfully');
});

exports.getOfficialStatistics = asyncHandler(async (req, res, next) => {
  const official = await Official.findById(req.params.id);
  if (!official) return next(new ApiError(404, 'Official not found'));
  sendSuccess(res, 200, { statistics: official.statistics }, 'Official statistics retrieved successfully');
});

exports.updateOfficialStatistics = asyncHandler(async (req, res, next) => {
  const official = await Official.findById(req.params.id);
  if (!official) return next(new ApiError(404, 'Official not found'));
  official.updateStatistics(req.body.yellowCards, req.body.redCards, req.body.penalties);
  await official.save();
  sendSuccess(res, 200, { official }, 'Official statistics updated successfully');
});

exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const official = await Official.findByIdAndUpdate(req.params.id, { isAvailable: req.body.isAvailable }, { new: true });
  if (!official) return next(new ApiError(404, 'Official not found'));
  sendSuccess(res, 200, { official }, 'Official availability updated successfully');
});
