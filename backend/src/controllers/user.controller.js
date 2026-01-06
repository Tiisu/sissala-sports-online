/**
 * User Controller
 * Handles user management operations (Admin only)
 */

const User = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { ApiError } = require('../middleware/error.middleware');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.isActive) query.isActive = req.query.isActive === 'true';

  // Get users
  const users = await User.find(query)
    .populate('favoriteTeam')
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');

  const total = await User.countDocuments(query);

  sendPaginated(res, 200, users, page, limit, total, 'Users retrieved successfully');
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('favoriteTeam');

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  sendSuccess(res, 200, { user }, 'User retrieved successfully');
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, phone, bio, favoriteTeam } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, bio, favoriteTeam },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  sendSuccess(res, 200, { user }, 'User updated successfully');
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user.id) {
    return next(new ApiError(400, 'You cannot delete your own account'));
  }

  await user.deleteOne();

  sendSuccess(res, 200, null, 'User deleted successfully');
});

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role || !['user', 'editor', 'manager', 'admin'].includes(role)) {
    return next(new ApiError(400, 'Please provide a valid role'));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  sendSuccess(res, 200, { user }, 'User role updated successfully');
});

/**
 * @desc    Toggle user active status
 * @route   PUT /api/users/:id/activate
 * @access  Private/Admin
 */
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user.id) {
    return next(new ApiError(400, 'You cannot deactivate your own account'));
  }

  user.isActive = !user.isActive;
  await user.save();

  sendSuccess(
    res,
    200,
    { user },
    `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  );
});
