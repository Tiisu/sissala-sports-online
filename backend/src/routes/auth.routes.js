/**
 * Authentication Routes
 * Handles user registration, login, password reset, etc.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimiter, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', authRateLimiter, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/update-profile', protect, authController.updateProfile);

/**
 * @route   PUT /api/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
router.put('/update-password', protect, authController.updatePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);

/**
 * @route   PUT /api/auth/reset-password/:resetToken
 * @desc    Reset password using token
 * @access  Public
 */
router.put('/reset-password/:resetToken', authController.resetPassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear token on client side)
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

module.exports = router;
