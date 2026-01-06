/**
 * Team Controller - Stub Implementation
 */

const Team = require('../models/Team.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

exports.getTeams = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const teams = await Team.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await Team.countDocuments();

  sendPaginated(res, 200, teams, page, limit, total, 'Teams retrieved successfully');
});

exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) return next(new ApiError(404, 'Team not found'));
  sendSuccess(res, 200, { team }, 'Team retrieved successfully');
});

exports.getTeamBySlug = asyncHandler(async (req, res, next) => {
  const team = await Team.findOne({ slug: req.params.slug });
  if (!team) return next(new ApiError(404, 'Team not found'));
  sendSuccess(res, 200, { team }, 'Team retrieved successfully');
});

exports.createTeam = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  
  // Parse JSON fields if they're strings (from FormData)
  if (typeof req.body.manager === 'string') {
    req.body.manager = JSON.parse(req.body.manager);
  }
  if (typeof req.body.address === 'string') {
    req.body.address = JSON.parse(req.body.address);
  }
  
  // Remove file fields from body if they're empty objects or invalid
  if (req.body.teamPhoto && typeof req.body.teamPhoto === 'object' && Object.keys(req.body.teamPhoto).length === 0) {
    delete req.body.teamPhoto;
  }
  if (req.body.teamLogo && typeof req.body.teamLogo === 'object' && Object.keys(req.body.teamLogo).length === 0) {
    delete req.body.teamLogo;
  }
  if (req.body.logo && typeof req.body.logo === 'object' && Object.keys(req.body.logo).length === 0) {
    delete req.body.logo;
  }
  
  // Upload files to Cloudinary if provided
  if (req.files) {
    const { uploadTeamLogo, uploadTeamPhoto } = require('../utils/cloudinaryUpload.util');
    
    if (req.files.teamLogo && req.files.teamLogo[0]) {
      req.body.logo = await uploadTeamLogo(req.files.teamLogo[0].buffer);
    }
    
    if (req.files.teamPhoto && req.files.teamPhoto[0]) {
      req.body.teamPhoto = await uploadTeamPhoto(req.files.teamPhoto[0].buffer);
    }
  }
  
  const team = await Team.create(req.body);
  sendSuccess(res, 201, { team }, 'Team created successfully');
});

exports.updateTeam = asyncHandler(async (req, res, next) => {
  console.log('Update Team - req.body:', req.body);
  console.log('Update Team - req.files:', req.files);
  
  // Parse JSON fields if they're strings (from FormData)
  if (typeof req.body.manager === 'string') {
    req.body.manager = JSON.parse(req.body.manager);
  }
  if (typeof req.body.address === 'string') {
    req.body.address = JSON.parse(req.body.address);
  }
  
  // Remove file fields from body if they're empty objects or invalid
  if (req.body.teamPhoto && typeof req.body.teamPhoto === 'object' && Object.keys(req.body.teamPhoto).length === 0) {
    delete req.body.teamPhoto;
  }
  if (req.body.teamLogo && typeof req.body.teamLogo === 'object' && Object.keys(req.body.teamLogo).length === 0) {
    delete req.body.teamLogo;
  }
  if (req.body.logo && typeof req.body.logo === 'object' && Object.keys(req.body.logo).length === 0) {
    delete req.body.logo;
  }
  
  // Upload files to Cloudinary if provided
  if (req.files) {
    const { uploadTeamLogo, uploadTeamPhoto } = require('../utils/cloudinaryUpload.util');
    
    if (req.files.teamLogo && req.files.teamLogo[0]) {
      req.body.logo = await uploadTeamLogo(req.files.teamLogo[0].buffer);
    }
    
    if (req.files.teamPhoto && req.files.teamPhoto[0]) {
      req.body.teamPhoto = await uploadTeamPhoto(req.files.teamPhoto[0].buffer);
    }
  }
  
  console.log('Final req.body before update:', req.body);
  
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!team) return next(new ApiError(404, 'Team not found'));
  sendSuccess(res, 200, { team }, 'Team updated successfully');
});

exports.deleteTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) return next(new ApiError(404, 'Team not found'));
  await team.deleteOne();
  sendSuccess(res, 200, null, 'Team deleted successfully');
});

exports.getTeamSquad = asyncHandler(async (req, res, next) => {
  const Player = require('../models/Player.model');
  const squad = await Player.find({ currentTeam: req.params.id });
  sendSuccess(res, 200, { squad }, 'Team squad retrieved successfully');
});

exports.getTeamMatches = asyncHandler(async (req, res, next) => {
  const Match = require('../models/Match.model');
  const matches = await Match.find({ $or: [{ homeTeam: req.params.id }, { awayTeam: req.params.id }] });
  sendSuccess(res, 200, { matches }, 'Team matches retrieved successfully');
});

exports.getTeamStatistics = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) return next(new ApiError(404, 'Team not found'));
  sendSuccess(res, 200, { statistics: team.statistics }, 'Team statistics retrieved successfully');
});

exports.getTeamForm = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) return next(new ApiError(404, 'Team not found'));
  sendSuccess(res, 200, { form: team.currentForm }, 'Team form retrieved successfully');
});

exports.updateTeamStatistics = asyncHandler(async (req, res, next) => {
  const team = await Team.findByIdAndUpdate(req.params.id, { statistics: req.body }, { new: true });
  if (!team) return next(new ApiError(404, 'Team not found'));
  sendSuccess(res, 200, { team }, 'Team statistics updated successfully');
});

exports.resetTeamStatistics = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) return next(new ApiError(404, 'Team not found'));
  team.resetStatistics();
  await team.save();
  sendSuccess(res, 200, { team }, 'Team statistics reset successfully');
});
