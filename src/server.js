/**
 * Main server entry point
 * Responsible for initializing the Express server and connecting all middleware
 */

const express = require('express');
const http = require('http');
const path = require('path');

// Import configuration and utilities
const { getConfig } = require('../config/environment');
const logger = require('../utils/logger');
const mongoDB = require('../utils/mongoDB');

// Import middleware
const { setupMiddleware } = require('./middleware');
const { setupRoutes } = require('./routes');
const { setupSocketIO } = require('./socket');

// Import game manager
const GameManager = require('./services/GameManager');

const app = express();
const server = http.createServer(app);
const config = getConfig();

// Initialize database connection
mongoDB();

// Setup middleware (CORS, Helmet, body parsing, etc.)
setupMiddleware(app, config);

// Setup API routes
setupRoutes(app);

// Setup Socket.IO with game manager
const io = setupSocketIO(server, config);
const gameManager = new GameManager(io, config);

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
server.listen(config.port, () => {
  logger.info(`🚀 Server is listening at port: ${config.port} 🚀`);
  console.log(`Server is running on the port ${config.port}, from express server`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, gameManager };
