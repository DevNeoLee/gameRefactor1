const express = require('express');
const Game = require('../model/game'); 
const { StatusCodes } = require('http-status-codes'); // for clear status codes

const router = express.Router();

// Get games occured on the day from query (GET /)
router.get('/', async (req, res) => {
  try {
    const { year, month, day } = req.query;

    // Validate the query parameters
    if (!year || !month || !day) {
      return res.status(400).json({ message: 'Please provide year, month, and day parameters.' });
    }

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

    console.log('games api: ', games.length, 'EST date:', `${parsedYear}-${parsedMonth + 1}-${parsedDay}`);

    // Return the found games
    return res.status(200).json({ success: true, data: games });
  } catch (err) {
    // Handle errors
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a new game (POST /)
router.post('/', async (req, res) => {
  try {
    const newGame = new Game({
      ...req.body,
      gameCreatedTime: new Date(),
    });
    const savedGame = await newGame.save();
    res.status(StatusCodes.CREATED).json(savedGame);
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error creating game" });
  }
});

// Update a game (PUT /)
router.put('/', async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.body._id, req.body, { new: true });

    if (!updatedGame) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Game not found" }); // Clear error message
    }
    console.log("Updated game to MongoDB through API", updatedGame);
    res.status(StatusCodes.OK).json({ success: true, data: updatedGame });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating game" });
  }
});

module.exports = router;
