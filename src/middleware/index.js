/**
 * Middleware configuration
 * Centralizes all Express middleware setup for better maintainability
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('../../utils/logger');

/**
 * Setup all middleware for the Express application
 * @param {Express} app - Express application instance
 * @param {Object} config - Application configuration
 */
const setupMiddleware = (app, config) => {
  // CORS configuration
  app.use(cors(config.cors));
  
  // Security middleware
  app.use(helmet(config.security.helmet));
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  
  // Custom security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  
  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });
};

module.exports = { setupMiddleware };
