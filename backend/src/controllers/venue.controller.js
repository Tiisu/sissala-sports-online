/**
 * Venue Controller - Stub Implementation
 */

const Venue = require('../models/Venue.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getVenues = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const venues = await Venue.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await Venue.countDocuments();

  sendPaginated(res, 200, venues, page, limit, total, 'Venues retrieved successfully');
});

exports.getVenue = asyncHandler(async (req, res, next) => {
  const venue = await Venue.findById(req.params.id).populate('homeTeam');
  if (!venue) return next(new ApiError(404, 'Venue not found'));
  sendSuccess(res, 200, { venue }, 'Venue retrieved successfully');
});

exports.getVenueBySlug = asyncHandler(async (req, res, next) => {
  const venue = await Venue.findOne({ slug: req.params.slug }).populate('homeTeam');
  if (!venue) return next(new ApiError(404, 'Venue not found'));
  sendSuccess(res, 200, { venue }, 'Venue retrieved successfully');
});

exports.createVenue = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  if (req.files) req.body.photos = req.files.map(f => f.path);
  const venue = await Venue.create(req.body);
  sendSuccess(res, 201, { venue }, 'Venue created successfully');
});

exports.updateVenue = asyncHandler(async (req, res, next) => {
  if (req.files) req.body.photos = req.files.map(f => f.path);
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!venue) return next(new ApiError(404, 'Venue not found'));
  sendSuccess(res, 200, { venue }, 'Venue updated successfully');
});

exports.deleteVenue = asyncHandler(async (req, res, next) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) return next(new ApiError(404, 'Venue not found'));
  await venue.deleteOne();
  sendSuccess(res, 200, null, 'Venue deleted successfully');
});

exports.getVenueMatches = asyncHandler(async (req, res, next) => {
  const Match = require('../models/Match.model');
  const matches = await Match.find({ venue: req.params.id });
  sendSuccess(res, 200, { matches }, 'Venue matches retrieved successfully');
});

exports.getVenuesByCity = asyncHandler(async (req, res, next) => {
  const venues = await Venue.find({ 'address.city': req.params.city });
  sendSuccess(res, 200, { venues }, 'Venues retrieved successfully');
});
