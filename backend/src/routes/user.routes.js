/**
 * User Routes
 * Admin routes for managing users
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', authorize('admin'), userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private/Admin
 */
router.get('/:id', authorize('admin'), userController.getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin only)
 * @access  Private/Admin
 */
router.put('/:id', authorize('admin'), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authorize('admin'), userController.deleteUser);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (admin only)
 * @access  Private/Admin
 */
router.put('/:id/role', authorize('admin'), userController.updateUserRole);

/**
 * @route   PUT /api/users/:id/activate
 * @desc    Activate/deactivate user (admin only)
 * @access  Private/Admin
 */
router.put('/:id/activate', authorize('admin'), userController.toggleUserStatus);

module.exports = router;
