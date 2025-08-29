const express = require('express');
const Session = require('../model/session');
const { StatusCodes } = require('http-status-codes'); // for better readability

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

    // Query the database for sessions based on Eastern Standard Time
    const sessions = await Session.find({
      sessionStartTime: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    
    console.log('sessions api: ', sessions.length, 'EST date:', `${parsedYear}-${parsedMonth + 1}-${parsedDay}`);
    return res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    // Handle errors
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a new session (POST /)
router.post('/', async (req, res) => {
  try {
    const newSession = new Session({
      ipAddress: req.ip,
      sessionStartTime: new Date(),
      gameStarted: false,
      gameCompleted: false,
      role: "",
      ...req.body, // Spread operator for flexibility
    });
    const savedSession = await newSession.save();
    res.status(StatusCodes.CREATED).json(savedSession);
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error saving session API" });
  }
});

// Update a session by ID (PUT /:id) - More specific update route
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // console.log('Session Router API: req.body: ', req.body);
    const updatedSession = await Session.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedSession) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Session not found, API' });
    }
    console.log('Session Router: API, updatedSession: ');
    res.json(updatedSession);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "Error updating session, API" }); // Informative error message
  }
});

// Delete a session by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL parameter
    
    // Validate ID format (MongoDB ObjectId format)
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format'
      });
    }

    // Find and delete the session
    const deletedSession = await Session.findByIdAndDelete(id);

    if (!deletedSession) {
      console.log('Session deletion failed: Session not found', { sessionId: id });
      return res.status(404).json({ 
        success: false,
        message: "Session not found" 
      });
    }
    
    console.log('Session deletion completed:', { 
      sessionId: deletedSession._id,
      ipAddress: deletedSession.ipAddress,
      sessionStartTime: deletedSession.sessionStartTime
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'Session deleted successfully.',
      deletedSession: {
        id: deletedSession._id,
        ipAddress: deletedSession.ipAddress,
        sessionStartTime: deletedSession.sessionStartTime,
        role: deletedSession.role,
        deletedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Error occurred during session deletion:', { 
      error: err.message, 
      stack: err.stack,
      sessionId: req.params.id
    });
    res.status(500).json({ 
      success: false,
      message: "Error occurred during session deletion.",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

module.exports = router;
