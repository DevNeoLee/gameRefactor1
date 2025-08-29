const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * MongoDB connection configuration 
 * Includes connection options, error handling, and retry logic
 */
const mongoDB = async () => {
  // MongoDB connection options following best practices
  const connectionOptions = {
    maxPoolSize: 10, // Maximum number of connections in the pool
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000, // Socket timeout
    autoIndex: false, // Disable automatic index creation in production
    retryWrites: true, // Enable retryable writes
    w: 'majority', // Write concern for data durability
    readPreference: 'primary' // Read from primary node
  };

  let dbUri; // Declare dbUri in function scope
  
  try {
    // Get database URI from environment configuration
    dbUri = require('../config/keys');
    
    if (!dbUri) {
      throw new Error('Database URI is not configured');
    }

    // Establish connection with retry logic
    const connection = await mongoose.connect(dbUri, connectionOptions);
    
    // Log successful connection
    logger.info('Database connection established successfully', {
      host: connection.connection.host,
      port: connection.connection.port,
      name: connection.connection.name,
      readyState: connection.connection.readyState
    });

    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', {
        error: err.message,
        stack: err.stack
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown:', err);
        process.exit(1);
      }
    });

    return connection;

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', {
      error: error.message,
      stack: error.stack,
      uri: dbUri ? 'configured' : 'not configured'
    });
    
    // Re-throw error for proper error handling upstream
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

/**
 * Get current database connection status
 * @returns {Object} Connection status information
 */
const getConnectionStatus = () => {
  const connection = mongoose.connection;
  return {
    readyState: connection.readyState,
    host: connection.host,
    port: connection.port,
    name: connection.name,
    isConnected: connection.readyState === 1
  };
};

/**
 * Close database connection gracefully
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('Database connection closed successfully');
    }
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  mongoDB,
  getConnectionStatus,
  closeConnection
};