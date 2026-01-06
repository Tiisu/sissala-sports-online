/**
 * Authentication Controller
 * Handles user authentication operations
 */

const User = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendError } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return next(new ApiError(400, 'Please provide name, email, and password'));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, 'User with this email already exists'));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate token
  const token = user.generateAuthToken();

  // Remove password from response
  user.password = undefined;

  sendSuccess(res, 201, { user, token }, 'User registered successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide email and password'));
  }

  // Find user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new ApiError(401, 'Your account has been deactivated'));
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = user.generateAuthToken();

  // Remove password from response
  user.password = undefined;

  sendSuccess(res, 200, { user, token }, 'Login successful');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('favoriteTeam');

  sendSuccess(res, 200, { user }, 'User retrieved successfully');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, bio, favoriteTeam } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (phone) fieldsToUpdate.phone = phone;
  if (bio) fieldsToUpdate.bio = bio;
  if (favoriteTeam) fieldsToUpdate.favoriteTeam = favoriteTeam;

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, { user }, 'Profile updated successfully');
});

/**
 * @desc    Update user password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    return next(new ApiError(400, 'Please provide current and new password'));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isPasswordMatch = await user.comparePassword(currentPassword);
  if (!isPasswordMatch) {
    return next(new ApiError(401, 'Current password is incorrect'));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = user.generateAuthToken();

  sendSuccess(res, 200, { token }, 'Password updated successfully');
});

/**
 * @desc    Forgot password - send reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, 'Please provide an email'));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(404, 'No user found with that email'));
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // In production, send email with reset token
  // For now, just return the token (remove this in production!)
  sendSuccess(
    res,
    200,
    { resetToken },
    'Password reset token generated. Check your email.'
  );
});

/**
 * @desc    Reset password using token
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new ApiError(400, 'Please provide a new password'));
  }

  // Hash token and find user
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, 'Invalid or expired reset token'));
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new token
  const token = user.generateAuthToken();

  sendSuccess(res, 200, { token }, 'Password reset successful');
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // In a JWT-based system, logout is handled client-side by removing the token
  // Here we just send a success response
  sendSuccess(res, 200, null, 'Logout successful');
});
