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

// 모든 라우트에 입력 정제 미들웨어 적용
router.use(sanitizeRequestBody);

// Get games occured on the day from query (GET /)
router.get('/', 
  validateInput(validateSessionQuery), // 입력 검증 추가
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

    log.info('게임 조회 완료', { 
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
    log.error('게임 조회 중 오류 발생:', { 
      error: err.message, 
      stack: err.stack,
      query: req.query 
    });
    return res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Create a new game (POST /)
router.post('/', 
  validateInput(validateGameCreation), // 입력 검증 추가
  async (req, res) => {
  try {
    const newGame = new Game({
      ...req.body,
      gameCreatedTime: new Date(),
    });
    
    const savedGame = await newGame.save();
    
    log.info('새 게임 생성 완료:', { 
      gameId: savedGame._id,
      generation: savedGame.generation,
      variation: savedGame.variation,
      ktf: savedGame.ktf
    });
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: savedGame,
      message: '게임이 성공적으로 생성되었습니다.'
    });
  } catch (err) {
    log.error('게임 생성 중 오류 발생:', { 
      error: err.message, 
      stack: err.stack,
      body: req.body 
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      message: "게임 생성 중 오류가 발생했습니다.",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Update a game (PUT /)
router.put('/', 
  validateInput(validateGameUpdate), // 입력 검증 추가
  async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(
      req.body._id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updatedGame) {
      log.warn('게임 업데이트 실패: 게임을 찾을 수 없음', { gameId: req.body._id });
      return res.status(StatusCodes.NOT_FOUND).json({ 
        success: false,
        message: "게임을 찾을 수 없습니다." 
      });
    }
    
    log.info("게임 업데이트 완료:", { 
      gameId: updatedGame._id,
      updatedFields: Object.keys(req.body)
    });
    
    res.status(StatusCodes.OK).json({ 
      success: true, 
      data: updatedGame,
      message: '게임이 성공적으로 업데이트되었습니다.'
    });
  } catch (err) {
    log.error('게임 업데이트 중 오류 발생:', { 
      error: err.message, 
      stack: err.stack,
      gameId: req.body._id,
      body: req.body 
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      message: "게임 업데이트 중 오류가 발생했습니다.",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

module.exports = router;
