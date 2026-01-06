/**
 * News Controller - Stub Implementation
 */

const News = require('../models/News.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getNews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const news = await News.find({ status: 'published' }).skip(skip).limit(limit).sort('-publishedAt');
  const total = await News.countDocuments({ status: 'published' });

  sendPaginated(res, 200, news, page, limit, total, 'News retrieved successfully');
});

exports.getFeaturedNews = asyncHandler(async (req, res, next) => {
  const news = await News.find({ status: 'published', isFeatured: true }).sort('-publishedAt').limit(5);
  sendSuccess(res, 200, { news }, 'Featured news retrieved successfully');
});

exports.getNewsByCategory = asyncHandler(async (req, res, next) => {
  const news = await News.find({ status: 'published', category: req.params.category }).sort('-publishedAt');
  sendSuccess(res, 200, { news }, 'News retrieved successfully');
});

exports.getNewsById = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id).populate('author');
  if (!news) return next(new ApiError(404, 'News not found'));
  if (req.user) news.incrementViews();
  sendSuccess(res, 200, { news }, 'News retrieved successfully');
});

exports.getNewsBySlug = asyncHandler(async (req, res, next) => {
  const news = await News.findOne({ slug: req.params.slug }).populate('author');
  if (!news) return next(new ApiError(404, 'News not found'));
  if (req.user) news.incrementViews();
  sendSuccess(res, 200, { news }, 'News retrieved successfully');
});

exports.createNews = asyncHandler(async (req, res, next) => {
  req.body.author = req.user.id;
  
  // Upload image to Cloudinary if file provided
  if (req.file) {
    const { uploadNewsImage } = require('../utils/cloudinaryUpload.util');
    req.body.featuredImage = await uploadNewsImage(req.file.buffer);
  }
  
  const news = await News.create(req.body);
  sendSuccess(res, 201, { news }, 'News created successfully');
});

exports.updateNews = asyncHandler(async (req, res, next) => {
  // Upload image to Cloudinary if file provided
  if (req.file) {
    const { uploadNewsImage } = require('../utils/cloudinaryUpload.util');
    req.body.featuredImage = await uploadNewsImage(req.file.buffer);
  }
  
  const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!news) return next(new ApiError(404, 'News not found'));
  sendSuccess(res, 200, { news }, 'News updated successfully');
});

exports.deleteNews = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id);
  if (!news) return next(new ApiError(404, 'News not found'));
  await news.deleteOne();
  sendSuccess(res, 200, null, 'News deleted successfully');
});

exports.addComment = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id);
  if (!news) return next(new ApiError(404, 'News not found'));
  await news.addComment(req.user.id, req.body.comment);
  sendSuccess(res, 200, { news }, 'Comment added successfully');
});

exports.toggleLike = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id);
  if (!news) return next(new ApiError(404, 'News not found'));
  await news.toggleLike();
  sendSuccess(res, 200, { news }, 'Like toggled successfully');
});

exports.publishNews = asyncHandler(async (req, res, next) => {
  const news = await News.findByIdAndUpdate(req.params.id, { status: 'published', publishedAt: new Date() }, { new: true });
  if (!news) return next(new ApiError(404, 'News not found'));
  sendSuccess(res, 200, { news }, 'News published successfully');
});

exports.getNewsByTeam = asyncHandler(async (req, res, next) => {
  const news = await News.find({ status: 'published', relatedTeam: req.params.teamId }).sort('-publishedAt');
  sendSuccess(res, 200, { news }, 'News retrieved successfully');
});

exports.getNewsByPlayer = asyncHandler(async (req, res, next) => {
  const news = await News.find({ status: 'published', relatedPlayer: req.params.playerId }).sort('-publishedAt');
  sendSuccess(res, 200, { news }, 'News retrieved successfully');
});

exports.searchNews = asyncHandler(async (req, res, next) => {
  const news = await News.find({ status: 'published', $text: { $search: req.params.query } }).sort('-publishedAt');
  sendSuccess(res, 200, { news }, 'Search results');
});
