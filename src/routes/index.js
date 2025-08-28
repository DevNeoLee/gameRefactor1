/**
 * Routes configuration
 * Centralizes all Express route setup for better maintainability
 */

const sessionRouter = require('../../router/sessionRouter');
const gameRouter = require('../../router/gameRouter');

/**
 * Setup all routes for the Express application
 * @param {Express} app - Express application instance
 */
const setupRoutes = (app) => {
  // API routes
  app.use('/api/session', sessionRouter);
  app.use('/api/game', gameRouter);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  
  // API documentation endpoint (placeholder for future Swagger implementation)
  app.get('/api/docs', (req, res) => {
    res.json({
      message: 'API documentation coming soon',
      endpoints: [
        { path: '/api/session', description: 'Session management endpoints' },
        { path: '/api/game', description: 'Game management endpoints' },
        { path: '/health', description: 'Health check endpoint' }
      ]
    });
  });
};

module.exports = { setupRoutes };
