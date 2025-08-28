const express = require('express');
const Game = require('../model/game'); 
const { StatusCodes } = require('http-status-codes'); // for clear status codes
const { 
  validateInput, 
  validateGameCreation, 
  validateGameUpdate,
  validateSessionQuery,
  sanitizeRequestBody 
} = require('../utils/validation');
const log = require('../utils/logger');

const router = express.Router();

// Apply input sanitization middleware to all routes
router.use(sanitizeRequestBody);

// Get games occurred on the day from query (GET /)
router.get('/', 
  validateInput(validateSessionQuery), // Add input validation
  async (req, res) => {
  try {
    const { year, month, day } = req.query;

    // Convert month from string to integer and adjust because months are 0-indexed
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10) - 1; // JavaScript months are 0-indexed
    const parsedDay = parseInt(day, 10);

    // Eastern Standard Time offset (UTC-5 for EST, UTC-4 for EDT)
    // Note: This is a simplified approach. For production, consider using a timezone library like moment-timezone
    const estOffset = -5; // EST is UTC-5
    
    // Create Eastern Standard Time start and end dates
    // Convert EST time to UTC for MongoDB query
    const estStartDate = new Date(parsedYear, parsedMonth, parsedDay, 0, 0, 0, 0);
    const estEndDate = new Date(parsedYear, parsedMonth, parsedDay, 23, 59, 59, 999);
    
    // Convert EST to UTC by adding the offset
    const startDate = new Date(estStartDate.getTime() - (estOffset * 60 * 60 * 1000));
    const endDate = new Date(estEndDate.getTime() - (estOffset * 60 * 60 * 1000));

    // Query the database for games based on Eastern Standard Time
    const games = await Game.find({
      gameCreatedTime: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    log.info('Game query completed', { 
      count: games.length, 
      date: `${parsedYear}-${parsedMonth + 1}-${parsedDay}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Return the found games
    return res.status(200).json({ 
      success: true, 
      data: games,
      count: games.length,
      date: `${parsedYear}-${parsedMonth + 1}-${parsedDay}`
    });
  } catch (err) {
    // Handle errors
    log.error('Error occurred during game query:', { 
      error: err.message, 
      stack: err.stack,
      query: req.query 
    });
    return res.status(500).json({ 
      success: false,
      message: 'Server error occurred.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Create a new game (POST /)
router.post('/', 
  validateInput(validateGameCreation), // Add input validation
  async (req, res) => {
  try {
    const newGame = new Game({
      ...req.body,
      gameCreatedTime: new Date(),
    });
    
    const savedGame = await newGame.save();
    
    log.info('New game creation completed:', { 
      gameId: savedGame._id,
      generation: savedGame.generation,
      variation: savedGame.variation,
      ktf: savedGame.ktf
    });
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: savedGame,
      message: 'Game created successfully.'
    });
  } catch (err) {
    log.error('Error occurred during game creation:', { 
      error: err.message, 
      stack: err.stack,
      body: req.body 
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      message: "Error occurred during game creation.",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Update a game (PUT /)
router.put('/', 
  validateInput(validateGameUpdate), // Add input validation
  async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(
      req.body._id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updatedGame) {
      log.warn('Game update failed: Game not found', { gameId: req.body._id });
      return res.status(StatusCodes.NOT_FOUND).json({ 
        success: false,
        message: "Game not found" 
      });
    }
    
    log.info("Game update completed:", { 
      gameId: updatedGame._id,
      updatedFields: Object.keys(req.body)
    });
    
    res.status(StatusCodes.OK).json({ 
      success: true, 
      data: updatedGame,
      message: 'Game updated successfully.'
    });
  } catch (err) {
    log.error('Error occurred during game update:', { 
      error: err.message, 
      stack: err.stack,
      gameId: req.body._id,
      body: req.body 
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      message: "Error occurred during game update.",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

module.exports = router;
