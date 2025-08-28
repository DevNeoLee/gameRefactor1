/**
 * Round Manager Service
 * Handles round lifecycle, timers, and game progression within rounds
 * Manages the complex round timing and state transitions
 */

const logger = require('../utils/logger');

class RoundManager {
  constructor(io, config) {
    this.io = io;
    this.config = config;
    logger.info('RoundManager initialized');
  }

  /**
   * Start a new round
   * @param {Object} room - Room object
   */
  startRound(room) {
    logger.info(`Starting round ${room.roundIndex} for room: ${room.roomName}`);
    
    // Clear all existing timers
    this.clearAllTimers(room);

    // Update room currentStep based on round index
    this.updateRoomTimeState(room);

    // Emit round start event to all clients
    this.io.in(room.roomName).emit('roundStart', {
      roundIndex: room.roundIndex,
      roundDuration: room.roundDuration,
      now: room.now,
      currentRound: room.currentRound
    });

    if (room.inGame) {
      // Start the round timer
      this.startRoundTimer(room);
    }
  }

  /**
   * Clear all timers for a room
   * @param {Object} room - Room object
   */
  clearAllTimers(room) {
    const timers = [
      'resultTimer', 'roundTimer', 'waitingTimeout', 'roleTimeout',
      'resultTransitonTimeout', 'chatTimer', 'gameStopTimer'
    ];

    timers.forEach(timerName => {
      if (room[timerName]) {
        if (room[timerName].clearInterval) {
          clearInterval(room[timerName]);
        } else if (room[timerName].clearTimeout) {
          clearTimeout(room[timerName]);
        }
        room[timerName] = null;
      }
    });

    logger.debug(`Cleared all timers for room: ${room.roomName}`);
  }

  /**
   * Update room time state based on round index
   * @param {Object} room - Room object
   */
  updateRoomTimeState(room) {
    if (room.roundIndex === 10) {
      room.now = 76;
    } else if (room.roundIndex === 2) {
      room.now = 34;
    } else if (room.roundIndex === 0) {
      room.now = 22;
    }
    
    logger.debug(`Updated room time state: round ${room.roundIndex}, now: ${room.now}`);
  }

  /**
   * Start the round timer
   * @param {Object} room - Room object
   */
  startRoundTimer(room) {
    room.roundTimer = setInterval(() => {
      room.roundDuration -= 1;
      
      // Safely check if all participants have made their choices
      const everyArrived = this.checkAllParticipantsResponded(room);
      
      // Emit round timer update
      this.io.in(room.roomName).emit('roundDuration', room.roundDuration);
      
      if (everyArrived) {
        logger.debug(`All participants responded for round ${room.roundIndex}, ending round early`);
        this.clearInterval(room.roundTimer);
        room.roundTimer = null;
        this.startResultCounting(room);
      } else if (room.roundDuration === 0) {
        logger.debug(`Round ${room.roundIndex} time expired, ending round`);
        this.clearInterval(room.roundTimer);
        room.roundTimer = null;
        this.startResultCounting(room);
      }
    }, 1000);
  }

  /**
   * Check if all participants have responded
   * @param {Object} room - Room object
   * @returns {boolean} True if all participants responded
   */
  checkAllParticipantsResponded(room) {
    return room.participants?.every((participant) => {
      if (!participant.results || !participant.results[room.roundIndex]) {
        return false;
      }
      return participant.results[room.roundIndex].choice !== null;
    });
  }

  /**
   * Start counting results for all participants
   * @param {Object} room - Room object
   */
  startResultCounting(room) {
    logger.info(`Starting result counting for round ${room.roundIndex} in room: ${room.roomName}`);
    
    // Special handling for final round (round 10)
    if (room.roundIndex === 10) {
      this.handleFinalRound(room);
    } else {
      this.handleRegularRound(room);
    }
  }

  /**
   * Handle final round result counting
   * @param {Object} room - Room object
   */
  handleFinalRound(room) {
    room.resultDuration = 20;
    let finalResultTable = false;

    room.resultTimer = setInterval(() => {
      room.resultDuration -= 1;
      this.io.in(room.roomName).emit('resultDuration', room.resultDuration);
      
      // Show final result table at 2 seconds remaining
      if (room.resultDuration === 2 && !finalResultTable) {
        this.io.in(room.roomName).emit('finalResultTable', room);
        room.resultDuration = 20;
        finalResultTable = true;
      }

      if (room.resultDuration === 1) {
        this.endRound(room);
      }
      
      if (room.resultDuration === 0) {
        this.io.in(room.roomName).emit('finalResultTableEnd', room);
      }
    }, 1000);
  }

  /**
   * Handle regular round result counting
   * @param {Object} room - Room object
   */
  handleRegularRound(room) {
    room.resultTimer = setInterval(() => {
      room.resultDuration -= 1;
      this.io.in(room.roomName).emit('resultDuration', room.resultDuration);
      
      if (room.resultDuration === 0) {
        this.io.in(room.roomName).emit('finalResultTableEnd', room);
        this.endRound(room);
      }
    }, 1000);
  }

  /**
   * End the current round
   * @param {Object} room - Room object
   */
  endRound(room) {
    logger.info(`Ending round ${room.roundIndex} for room: ${room.roomName}`);
    
    // Clear result timer
    if (room.resultTimer) {
      clearInterval(room.resultTimer);
      room.resultTimer = null;
    }

    // Clear other timers
    this.clearTransitionTimers(room);
    
    // Reset result duration
    room.resultDuration = 20;
    
    // Notify all clients that round ended
    this.io.in(room.roomName).emit('roundEnded', room);

    // Check if water is depleted
    if (room.previousWater < 15) {
      this.handleWaterDepletion(room);
    } else {
      this.handleRoundCompletion(room);
    }
  }

  /**
   * Clear transition timers
   * @param {Object} room - Room object
   */
  clearTransitionTimers(room) {
    const transitionTimers = [
      'resultTransitonTimeout', 'waitingRoomTimer', 'waitingTimeout', 'roleTimeout'
    ];

    transitionTimers.forEach(timerName => {
      if (room[timerName]) {
        if (room[timerName].clearTimeout) {
          clearTimeout(room[timerName]);
        }
        room[timerName] = null;
      }
    });
  }

  /**
   * Handle water depletion scenario
   * @param {Object} room - Room object
   */
  handleWaterDepletion(room) {
    if (room.roundIndex < 11) {
      room.isDepletedFirstPart = true;
      this.fixDataForSkippingRounds(room);
      this.startGameStop(room);
    } else if (room.roundIndex < 21) {
      room.isDepletedSecondPart = true;
      this.startGameStop(room);
    } else if (room.roundIndex === 21) {
      this.startGameStop(room);
    }
  }

  /**
   * Handle normal round completion
   * @param {Object} room - Room object
   */
  handleRoundCompletion(room) {
    // Check if this is the last round of a part
    if (room.roundIndex === 9) {
      room.gameCompleted = true;
      room.inGame = false;
      logger.info(`Game completed for room: ${room.roomName}`);
      
      // Emit game completion event
      this.io.in(room.roomName).emit('gameCompleted', room);
    } else {
      // Prepare for next round
      if (room.inGame) {
        room.resultTransitonTimeout = setTimeout(() => {
          this.prepareNextRound(room);
        }, 500);
      } else {
        this.prepareNextRound(room);
      }
    }
  }

  /**
   * Prepare for the next round
   * @param {Object} room - Room object
   */
  prepareNextRound(room) {
    room.roundIndex += 1;
    room.roundDuration = 60; // Reset round duration
    room.now = 22 + (room.roundIndex * 6);
    room.currentRound = this.config.game.rounds[room.roundIndex];
    
    logger.info(`Prepared next round ${room.roundIndex} for room: ${room.roomName}`);
    
    // Start the next round
    this.startRound(room);
  }

  /**
   * Fix data for skipped rounds due to water depletion
   * @param {Object} room - Room object
   */
  fixDataForSkippingRounds(room) {
    logger.info(`Fixing data for skipped rounds in room: ${room.roomName}`);
    
    room.participants?.forEach(participant => {
      const totalWater = participant.results[participant.results.length - 1].totalWater;
      const totalScore = participant.results[participant.results.length - 1].totalScore;
      
      while (participant.results.length < 10) {
        participant.results.push({ 
          totalWater: totalWater, 
          totalScore: totalScore 
        });
      }
    });

    while (room.gameResults.length < 10) {
      room.gameResults.push({
        roundIndex: room.gameResults.length, 
        round: "", 
        updatedSortedResult: room.gameResults[room.gameResults.length - 1].updatedSortedResult, 
        floodLoss: 0
      });
    }
  }

  /**
   * Start game stop sequence
   * @param {Object} room - Room object
   */
  startGameStop(room) {
    logger.info(`Starting game stop for room: ${room.roomName}, round: ${room.roundIndex}`);
    
    // Send depletion message to frontend
    if (room.isDepletedFirstPart && room.roundIndex < 9) {
      this.io.in(room.roomName).emit('depletion', 'first', room.roundIndex);
    } 

    // Show game stop message
    this.io.in(room.roomName).emit('showGameStop', room.roundIndex);

    // Start game stop timer if not final round
    if (room.roundIndex < 10) {
      if (room.roundTimer) {
        clearInterval(room.roundTimer);
        room.roundTimer = null;
      }

      room.gameStopTimer = setInterval(() => {
        if (room.gameStopDuration === 0) {
          this.endGameStopTimer(room);
        } else {
          this.io.in(room.roomName).emit('gameStopDuration', room.gameStopDuration);
          room.gameStopDuration -= 1;
        }
      }, 1000);
    }
  }

  /**
   * End game stop timer
   * @param {Object} room - Room object
   */
  endGameStopTimer(room) {
    if (room.gameStopTimer) {
      clearInterval(room.gameStopTimer);
      room.gameStopTimer = null;
    }

    if (room.roundIndex < 10) {
      room.gameStopDuration = 40;
      this.io.in(room.roomName).emit('endGameStop');
    }
  }

  /**
   * Start survey phase
   * @param {Object} room - Room object
   */
  startSurvey(room) {
    logger.info(`Starting survey for room: ${room.roomName}`);
    
    // Clear all timers
    this.clearAllTimers(room);
    
    // Emit survey start event
    this.io.in(room.roomName).emit('startSurvey');
  }

  /**
   * Clear interval safely
   * @param {Object} timer - Timer object
   */
  clearInterval(timer) {
    if (timer && timer.clearInterval) {
      clearInterval(timer);
    }
  }

  /**
   * Get round statistics
   * @param {Object} room - Room object
   * @returns {Object} Round statistics
   */
  getRoundStats(room) {
    return {
      currentRound: room.roundIndex,
      totalRounds: room.totalRounds,
      roundDuration: room.roundDuration,
      resultDuration: room.resultDuration,
      participantsResponded: room.participants?.filter(p => 
        p.results?.[room.roundIndex]?.choice !== null
      ).length || 0,
      totalParticipants: room.participants?.length || 0
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    logger.info('RoundManager cleanup completed');
  }
}

module.exports = RoundManager;
