/**
 * Input validation middleware and utility functions
 * Input validation logic to enhance security of the game application
 */

const { StatusCodes } = require('http-status-codes');
const log = require('./logger'); // Add logger import

/**
 * Basic input validation middleware
 * @param {Object} schema - Joi schema or validation function
 * @returns {Function} Express middleware function
 */
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body, query, and parameters
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params
      };

      // Direct validation if schema is a function
      if (typeof schema === 'function') {
        const validationResult = schema(dataToValidate);
        if (!validationResult.isValid) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Input data is invalid.',
            errors: validationResult.errors
          });
        }
      }

      next();
    } catch (error) {
      log.error('Error occurred during input validation:', { error: error.message });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Server error occurred.'
      });
    }
  };
};

/**
 * Game creation input validation
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
const validateGameCreation = (data) => {
  const errors = [];
  const { generation, variation, ktf, nm } = data.body;

  // Required field validation
  if (!generation || !variation || !ktf) {
    errors.push('generation, variation, ktf are required fields.');
  }

  // Type validation
  if (generation && typeof generation !== 'number') {
    errors.push('generation must be a number.');
  }

  if (ktf && typeof ktf !== 'number') {
    errors.push('ktf must be a number.');
  }

  if (variation && typeof variation !== 'string') {
    errors.push('variation must be a string.');
  }

  // Value range validation
  if (generation && (generation < 1 || generation > 6)) {
    errors.push('generation must be between 1-6.');
  }

  if (ktf && (ktf < 1 || ktf > 2)) {
    errors.push('ktf must be between 1-2.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Game update input validation
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
const validateGameUpdate = (data) => {
  const errors = [];
  const { _id, ...updateData } = data.body;

  if (!_id) {
    errors.push('Game ID is required.');
  }

  // MongoDB ObjectId format validation (simple validation)
  if (_id && typeof _id !== 'string') {
    errors.push('Game ID must be a string.');
  }

  if (_id && _id.length !== 24) {
    errors.push('Game ID format is invalid.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Session query input validation
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
const validateSessionQuery = (data) => {
  const errors = [];
  const { year, month, day } = data.query;

  if (!year || !month || !day) {
    errors.push('year, month, day parameters are all required.');
  }

  // Date value validation
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
    errors.push('year must be a valid year between 2020-2030.');
  }

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    errors.push('month must be a valid month between 1-12.');
  }

  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
    errors.push('day must be a valid day between 1-31.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Input sanitization to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Request body sanitization middleware
 */
const sanitizeRequestBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  validateInput,
  validateGameCreation,
  validateGameUpdate,
  validateSessionQuery,
  sanitizeInput,
  sanitizeRequestBody
};
