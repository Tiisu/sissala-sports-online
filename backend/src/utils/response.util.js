/**
 * Response Utility
 * Standardized API response formats
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @param {String} message - Success message
 */
const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} errors - Validation errors (optional)
 */
const sendError = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Array} data - Array of data
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @param {String} message - Success message
 */
const sendPaginated = (res, statusCode = 200, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
