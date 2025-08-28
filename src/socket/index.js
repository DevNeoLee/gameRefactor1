/**
 * Socket.IO configuration
 * Handles Socket.IO server setup and basic connection management
 */

const socketIO = require('socket.io');
const logger = require('../../utils/logger');

/**
 * Setup Socket.IO server with configuration
 * @param {http.Server} server - HTTP server instance
 * @param {Object} config - Application configuration
 * @returns {SocketIO.Server} Configured Socket.IO server instance
 */
const setupSocketIO = (server, config) => {
  const io = socketIO(server, {
    cors: config.cors,
    transports: ['websocket', 'polling'],
    pingTimeout: config.socket.pingTimeout,
    pingInterval: config.socket.pingInterval,
    connectTimeout: config.socket.connectTimeout,
    allowEIO3: config.socket.allowEIO3
  });

  // Global middleware for all connections
  io.use((socket, next) => {
    // Add request timestamp
    socket.requestTime = Date.now();
    next();
  });

  // Connection event handler
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);
    
    // Store connection time for analytics
    socket.connectedAt = new Date();
    
    // Disconnection event handler
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.id}, reason: ${reason}`);
    });
    
    // Error event handler
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Make io available to other modules
  global.io = io;
  
  return io;
};

module.exports = { setupSocketIO };
