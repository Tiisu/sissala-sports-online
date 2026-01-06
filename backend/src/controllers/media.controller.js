/**
 * Media Controller - Stub Implementation
 */

const Media = require('../models/Media.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getMedia = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const media = await Media.find({ status: 'approved' }).skip(skip).limit(limit).sort('-createdAt');
  const total = await Media.countDocuments({ status: 'approved' });

  sendPaginated(res, 200, media, page, limit, total, 'Media retrieved successfully');
});

exports.getPhotos = asyncHandler(async (req, res, next) => {
  const photos = await Media.find({ type: 'photo', status: 'approved' }).sort('-createdAt').limit(20);
  sendSuccess(res, 200, { photos }, 'Photos retrieved successfully');
});

exports.getVideos = asyncHandler(async (req, res, next) => {
  const videos = await Media.find({ type: 'video', status: 'approved' }).sort('-createdAt').limit(20);
  sendSuccess(res, 200, { videos }, 'Videos retrieved successfully');
});

exports.getGalleries = asyncHandler(async (req, res, next) => {
  const galleries = await Media.find({ type: 'gallery', status: 'approved' }).sort('-createdAt').limit(20);
  sendSuccess(res, 200, { galleries }, 'Galleries retrieved successfully');
});

exports.getFeaturedMedia = asyncHandler(async (req, res, next) => {
  const media = await Media.find({ status: 'approved', isFeatured: true }).sort('-createdAt').limit(10);
  sendSuccess(res, 200, { media }, 'Featured media retrieved successfully');
});

exports.getMediaByCategory = asyncHandler(async (req, res, next) => {
  const media = await Media.find({ status: 'approved', category: req.params.category }).sort('-createdAt');
  sendSuccess(res, 200, { media }, 'Media retrieved successfully');
});

exports.getMediaById = asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  if (!media) return next(new ApiError(404, 'Media not found'));
  media.incrementViews();
  sendSuccess(res, 200, { media }, 'Media retrieved successfully');
});

exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'Please upload a file'));
  
  // Upload photo to Cloudinary
  const { uploadMediaFile } = require('../utils/cloudinaryUpload.util');
  const cloudinaryUrl = await uploadMediaFile(req.file.buffer, 'photo');
  
  req.body.uploadedBy = req.user.id;
  req.body.type = 'photo';
  req.body.fileUrl = cloudinaryUrl;
  req.body.fileSize = req.file.size;
  req.body.mimeType = req.file.mimetype;
  
  const media = await Media.create(req.body);
  sendSuccess(res, 201, { media }, 'Photo uploaded successfully');
});

exports.uploadVideo = asyncHandler(async (req, res, next) => {
  req.body.uploadedBy = req.user.id;
  req.body.type = 'video';
  if (req.file) {
    req.body.fileUrl = req.file.path;
    req.body.fileSize = req.file.size;
    req.body.mimeType = req.file.mimetype;
  }
  const media = await Media.create(req.body);
  sendSuccess(res, 201, { media }, 'Video uploaded successfully');
});

exports.createGallery = asyncHandler(async (req, res, next) => {
  req.body.uploadedBy = req.user.id;
  req.body.type = 'gallery';
  if (req.files) {
    req.body.photos = req.files.map((f, i) => ({ url: f.path, order: i + 1 }));
  }
  const media = await Media.create(req.body);
  sendSuccess(res, 201, { media }, 'Gallery created successfully');
});

exports.updateMedia = asyncHandler(async (req, res, next) => {
  const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!media) return next(new ApiError(404, 'Media not found'));
  sendSuccess(res, 200, { media }, 'Media updated successfully');
});

exports.deleteMedia = asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  if (!media) return next(new ApiError(404, 'Media not found'));
  await media.deleteOne();
  sendSuccess(res, 200, null, 'Media deleted successfully');
});

exports.toggleLike = asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  if (!media) return next(new ApiError(404, 'Media not found'));
  await media.toggleLike();
  sendSuccess(res, 200, { media }, 'Like toggled successfully');
});

exports.approveMedia = asyncHandler(async (req, res, next) => {
  const media = await Media.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!media) return next(new ApiError(404, 'Media not found'));
  sendSuccess(res, 200, { media }, 'Media approved successfully');
});

exports.addPhotoToGallery = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'Please upload a file'));
  const media = await Media.findById(req.params.id);
  if (!media) return next(new ApiError(404, 'Gallery not found'));
  await media.addPhoto(req.file.path, req.body.caption);
  sendSuccess(res, 200, { media }, 'Photo added to gallery successfully');
});

exports.getMediaByMatch = asyncHandler(async (req, res, next) => {
  const media = await Media.find({ status: 'approved', relatedMatch: req.params.matchId }).sort('-createdAt');
  sendSuccess(res, 200, { media }, 'Media retrieved successfully');
});

exports.getMediaByTeam = asyncHandler(async (req, res, next) => {
  const media = await Media.find({ status: 'approved', relatedTeam: req.params.teamId }).sort('-createdAt');
  sendSuccess(res, 200, { media }, 'Media retrieved successfully');
});
