/**
 * Validation Utility
 * Common validation functions
 */

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {String} phone - Phone number to validate
 * @returns {Boolean} - True if valid
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL format
 * @param {String} url - URL to validate
 * @returns {Boolean} - True if valid
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate date is in the past
 * @param {Date} date - Date to validate
 * @returns {Boolean} - True if date is in the past
 */
const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Validate date is in the future
 * @param {Date} date - Date to validate
 * @returns {Boolean} - True if date is in the future
 */
const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

/**
 * Validate MongoDB ObjectId format
 * @param {String} id - ID to validate
 * @returns {Boolean} - True if valid ObjectId
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Sanitize string input (remove HTML tags)
 * @param {String} str - String to sanitize
 * @returns {String} - Sanitized string
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validate password strength
 * Must contain at least 6 characters
 * @param {String} password - Password to validate
 * @returns {Object} - { isValid: Boolean, message: String }
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long',
    };
  }
  
  return {
    isValid: true,
    message: 'Password is valid',
  };
};

/**
 * Validate score format (must be non-negative integer)
 * @param {Number} score - Score to validate
 * @returns {Boolean} - True if valid
 */
const isValidScore = (score) => {
  return Number.isInteger(score) && score >= 0;
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isPastDate,
  isFutureDate,
  isValidObjectId,
  sanitizeString,
  validatePassword,
  isValidScore,
};
