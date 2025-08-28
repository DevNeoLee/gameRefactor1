/**
 * Game Flow Manager Service
 * Handles game progression, step transitions, and timing logic
 * Manages the complex game flow state machine
 */

const logger = require('../../utils/logger');

class GameFlowManager {
  constructor(io, config) {
    this.io = io;
    this.config = config;
    this.roomsInChatPhase = new Set();
    this.roomManager = null; // Will be injected by GameManager
    
    // Define step types for better flow control
    this.ASYNC_STEPS = ['memorySurvey', 'adviceSurvey', 'nearMissPostSurvey', 'nearMissPreSurvey'];
    this.SYNC_STEPS = [
      'rounds', 'participantsReady', 'roleSelection', 'groupChat', 
      'transitionNotification1', 'transitionNotification2', 
      'transitionNotification3', 'transitionNotification4', 
      'historicText', 'nearMissNotification'
    ];
    
    logger.info('GameFlowManager initialized');
  }

  /**
   * Set room manager reference
   * @param {RoomManager} roomManager - Room manager instance
   */
  setRoomManager(roomManager) {
    this.roomManager = roomManager;
  }

  /**
   * Set game state manager reference
   * @param {GameStateManager} gameStateManager - Game state manager instance
   */
  setGameStateManager(gameStateManager) {
    this.gameStateManager = gameStateManager;
  }

  /**
   * Check if a step is asynchronous
   * @param {string} step - Step name
   * @returns {boolean} True if async step
   */
  isAsyncStep(step) {
    return this.ASYNC_STEPS.includes(step);
  }

  /**
   * Check if a step is synchronous
   * @param {string} step - Step name
   * @returns {boolean} True if sync step
   */
  isSyncStep(step) {
    return this.SYNC_STEPS.includes(step);
  }

  /**
   * Start the game flow for a room
   * @param {Object} room - Room object
   */
  startGameFlow(room) {
    room.currentStep = 'participantsReady';
    logger.info(`Starting game flow for room: ${room.roomName}`);
    
    // Start the game flow after a short delay
    setTimeout(() => {
      this.advanceGameStep(room);
    }, 500);
  }

  /**
   * Advance to the next game step
   * @param {Object} room - Room object
   */
  advanceGameStep(room) {
    logger.debug(`Advancing game step for room: ${room.roomName}, current: ${room.currentStep}`);
    
    // Special handling for nearMissNotification and active rounds
    if (room.currentStep === 'nearMissNotification' || 
        (room.currentStep === 'rounds' && room.inGame)) {
      logger.debug(`Currently in ${room.currentStep} step, not advancing`);
      return;
    }
    
    const gameflow = room.gameFlows;
    const nextStepIndex = room.currentStepIndex + 1;
    
    if (nextStepIndex < gameflow.length) {
      const currentStep = gameflow[room.currentStepIndex];
      const nextStep = gameflow[nextStepIndex];
      
      logger.debug(`Current step: ${currentStep}, Next step: ${nextStep}`);
      
      // Handle async to sync transitions
      if (this.isAsyncStep(currentStep) && this.isSyncStep(nextStep)) {
        const completedCount = room.participants.filter(p => p.asyncStepReady).length;
        
        if (completedCount !== room.participants.length) {
          if (completedCount > 0) {
            room.participants.forEach(p => p.asyncStepReady = false);
            this.io.to(room.roomName).emit('waitingForOthers', {
              step: currentStep,
              nextStep: nextStep,
              completedCount: completedCount,
              totalCount: room.participants.length
            });
            logger.debug('Emitting waitingForOthers, returning');
            return;
          }
          logger.debug('No participants completed yet, staying in current step');
          return;
        }
      }
      
      // Advance to next step
      room.currentStepIndex = nextStepIndex;
      room.currentStep = nextStep;
      logger.info(`Advancing to step: ${nextStep}`);
      
      // Reset asyncStepReady flag for all participants when moving to a new step
      // This ensures clean state for the next async step
      room.participants.forEach(p => p.asyncStepReady = false);
      
      // CRITICAL: Clear ALL timers before starting the next step
      // This prevents timer conflicts when moving between different step types
      this.clearAllTimers(room);
      
      this.io.to(room.roomName).emit('stepChange', nextStep);
      
      // Handle special step logic
      this.handleSpecialStep(room, nextStep);
      
      // Set up auto-advance timer for non-special steps
      if (room.stepTimers[nextStep] && 
          nextStep !== 'nearMissNotification' && 
          nextStep !== 'rounds') {
        setTimeout(() => {
          this.advanceGameStep(room);
        }, room.stepTimers[nextStep]);
      }
      
      // Check if this is the last step
      this.handleLastStep(room);
    }
  }

  /**
   * Handle special step logic
   * @param {Object} room - Room object
   * @param {string} step - Step name
   */
  handleSpecialStep(room, step) {
    switch (step) {
      case 'rounds':
        this.startGame(room);
        break;
        
      case 'groupChat':
        this.startChatPhase(room);
        break;
        
      case 'nearMissNotification':
        // Clear all timers before starting nearMissNotification to prevent conflicts
        this.clearAllTimers(room);
        this.handleNearMissNotification(room);
        break;
        
      case 'participantsReady':
      case 'roleSelection':
      case 'transitionNotification1':
      case 'transitionNotification2':
      case 'transitionNotification3':
      case 'transitionNotification4':
      case 'historicText':
        if (this.isSyncStep(step)) {
          this.startStepTimer(room, step);
        }
        break;
        
      default:
        if (this.isSyncStep(step)) {
          this.startStepTimer(room, step);
        }
        break;
    }
  }

  /**
   * Handle near miss notification step
   * @param {Object} room - Room object
   */
  handleNearMissNotification(room) {
    // CRITICAL: Clear ALL round-related timers when entering nearMissNotification
    // This prevents timer conflicts between nearMissNotification and rounds
    logger.info(`CRITICAL: Entering nearMissNotification step for room ${room.roomName}, clearing ALL round timers`);
    
    // Clear all timers that could conflict with nearMissNotification
    if (room.roundTimer) {
      clearInterval(room.roundTimer);
      room.roundTimer = null;
      logger.debug(`Cleared roundTimer for nearMissNotification step in room ${room.roomName}`);
    }
    
    if (room.resultTimer) {
      clearInterval(room.resultTimer);
      room.resultTimer = null;
      logger.debug(`Cleared resultTimer for nearMissNotification step in room ${room.roomName}`);
    }
    
    // Reset round-related state to prevent conflicts
    if (room.roundDuration !== undefined) {
      room.roundDuration = 0; // Force round timer to stop
      logger.debug(`Reset roundDuration to 0 for nearMissNotification step in room ${room.roomName}`);
    }
    
    if (room.resultDuration !== undefined) {
      room.resultDuration = 0; // Force result timer to stop
      logger.debug(`Reset resultDuration to 0 for nearMissNotification step in room ${room.roomName}`);
    }
    
    // Wait different times based on nm value before starting timer
    // HLRN or LLRN: 40 seconds, HLVN or LLVN: 50 seconds
    const delayTime = (room.nm === 'HLVN' || room.nm === 'LLVN') ? 55000 : 40000;
    const delaySeconds = delayTime / 1000;
    
    logger.info(`Entering nearMissNotification step, waiting ${delaySeconds} seconds before starting timer (nm: ${room.nm})`);
    
    setTimeout(() => {
      logger.debug('Starting timer for nearMissNotification step');
      this.startStepTimer(room, 'nearMissNotification');
    }, delayTime);
  }

  /**
   * Handle last step in game flow
   * @param {Object} room - Room object
   */
  handleLastStep(room) {
    const isLastStep = room.currentStepIndex === room.gameFlows.length - 1;
    if (isLastStep && (!room.nm || room.nm === undefined)) {
      room.participants.forEach(p => {
        this.io.to(p.id).emit('goToSurvey');
      });
      logger.info(`Last step reached for room: ${room.roomName}, redirecting to survey`);
    }
  }

  /**
   * Start step timer for synchronous steps
   * @param {Object} room - Room object
   * @param {string} stepName - Step name
   */
  startStepTimer(room, stepName) {
    logger.debug(`startStepTimer called for step: ${stepName}`);
    
    // Special handling for nearMissNotification and rounds
    if ((stepName === 'nearMissNotification' && room.currentStep !== 'nearMissNotification') ||
        (stepName === 'rounds' && room.currentStep !== 'rounds')) {
      logger.debug(`Not starting timer for ${stepName} because current step is ${room.currentStep}`);
      return;
    }
    
    // Clear any previous timer for this step
    if (room.stepTimerInterval) {
      clearInterval(room.stepTimerInterval);
      room.stepTimerInterval = null;
    }
    
    // Also clear any other timers that might conflict with this step timer
    // CRITICAL: Don't clear ALL timers for nearMissNotification as it needs stepTimerInterval
    if (stepName !== 'rounds' && stepName !== 'nearMissNotification') {
      this.clearAllTimers(room);
    }
    
    // For nearMissNotification, only clear conflicting timers, not stepTimerInterval
    if (stepName === 'nearMissNotification') {
      logger.debug(`Special handling for nearMissNotification: clearing only conflicting timers, preserving stepTimerInterval`);
      
      // Clear only the timers that could conflict with nearMissNotification
      if (room.resultTimer) {
        clearInterval(room.resultTimer);
        room.resultTimer = null;
        logger.debug(`Cleared resultTimer for nearMissNotification step in room ${room.roomName}`);
      }
      
      if (room.roundTimer) {
        clearInterval(room.roundTimer);
        room.roundTimer = null;
        logger.debug(`Cleared roundTimer for nearMissNotification step in room ${room.roomName}`);
      }
      
      if (room.resultDuration !== undefined) {
        room.resultDuration = 0;
        logger.debug(`Reset resultDuration to 0 for nearMissNotification step in room ${room.roomName}`);
      }
      
      if (room.roundDuration !== undefined) {
        room.roundDuration = 0;
        logger.debug(`Reset roundDuration to 0 for nearMissNotification step in room ${room.roomName}`);
      }
    }
    
    let ms = room.stepTimers[stepName];
    let secondsLeft = ms ? Math.floor(ms / 1000) : 0;
    
    logger.info(`Timer setup for ${stepName}: ms=${ms}, secondsLeft=${secondsLeft}`);
    
    if (!secondsLeft || isNaN(secondsLeft)) {
      logger.warn(`Invalid timer duration for ${stepName}, returning`);
      return;
    }

    // Emit initial value
    logger.debug(`Emitting initial timer value for ${stepName}: ${secondsLeft} seconds`);
    this.io.in(room.roomName).emit('stepTimer', { step: stepName, secondsLeft });

    room.stepTimerInterval = setInterval(() => {
      secondsLeft -= 1;
      logger.info(`Timer tick for ${stepName}: ${secondsLeft} seconds remaining`);
      
      this.io.in(room.roomName).emit('stepTimer', { step: stepName, secondsLeft });
      
      if (secondsLeft <= 0) {
        logger.info(`Timer expired for ${stepName}, advancing to next step`);
        clearInterval(room.stepTimerInterval);
        room.stepTimerInterval = null;
        
        // Special handling for nearMissNotification timer expiration
        if (stepName === 'nearMissNotification') {
          this.forceAdvanceNearMiss(room);
        } else {
          // Automatically advance to next step when timer expires
          this.advanceGameStep(room);
        }
      }
    }, 1000);
    
    logger.info(`Step timer started for ${stepName} in room ${room.roomName}, interval ID: ${room.stepTimerInterval}`);
  }

  /**
   * Force advance from near miss notification
   * @param {Object} room - Room object
   */
  forceAdvanceNearMiss(room) {
    logger.info('nearMissNotification timer expired, forcing advance to next step');
    
    // CRITICAL: Ensure round timers are properly restored after nearMissNotification
    // This prevents timer conflicts when returning to rounds
    if (room.currentStep === 'nearMissNotification') {
      logger.info(`Exiting nearMissNotification step for room ${room.roomName}, preparing for next step`);
      
      // Reset round-related state that was cleared during nearMissNotification
      if (room.roundDuration === 0) {
        room.roundDuration = 60; // Restore default round duration
        logger.debug(`Restored roundDuration to 60 for room ${room.roomName}`);
      }
      
      if (room.resultDuration === 20) {
        room.resultDuration = 20; // Restore default result duration
        logger.debug(`Restored resultDuration to 20 for room ${room.roomName}`);
      }
    }
    
    const gameflow = room.gameFlows;
    const nextStepIndex = room.currentStepIndex + 1;
    
    if (nextStepIndex < gameflow.length) {
      room.currentStepIndex = nextStepIndex;
      room.currentStep = gameflow[nextStepIndex];
      logger.debug(`Forced advance to step: ${room.currentStep}`);
      
      this.io.to(room.roomName).emit('stepChange', room.currentStep);
      
      // Start timer for the next step if it's a sync step
      if (this.isSyncStep(room.currentStep)) {
        this.startStepTimer(room, room.currentStep);
      }
    }
  }

  /**
   * Start chat phase
   * @param {Object} room - Room object
   */
  startChatPhase(room) {
    // Check if room is already in chat phase
    if (this.roomsInChatPhase.has(room.roomName)) {
      return;
    }
    
    logger.info(`Starting chat phase for room: ${room.roomName}`);
    this.roomsInChatPhase.add(room.roomName);
    
    // Clear any existing timers
    if (room.chatTimer) {
      clearInterval(room.chatTimer);
      room.chatTimer = null;
    }
    
    if (room.transitionTimeout) {
      clearTimeout(room.transitionTimeout);
      room.transitionTimeout = null;
    }
    
    room.chatDuration = 60; // 60 seconds chat duration
    
    // Emit initial chat timer
    this.io.in(room.roomName).emit('chatTimer', room.chatDuration);
    
    // Start chat timer
    room.chatTimer = setInterval(() => {
      if (room.chatDuration <= 0) {
        clearInterval(room.chatTimer);
        room.chatTimer = null;
        
        // Remove room from chat phase tracking
        this.roomsInChatPhase.delete(room.roomName);
        
        // Emit chat phase end event
        this.io.in(room.roomName).emit('chatPhaseEnd');
        return;
      }
      
      room.chatDuration -= 1;
      // Emit updated timer to all clients
      this.io.in(room.roomName).emit('chatTimer', room.chatDuration);
    }, 1000);
  }

  /**
   * Handle async step completion
   * @param {string} roomName - Room name
   * @param {string} participantId - Participant ID
   * @param {string} step - Step name
   * @returns {Object} Result object
   */
  async handleAsyncStepComplete(roomName, participantId, step) {
    logger.info(`Async step complete: ${step} for participant ${participantId} in room ${roomName}`);
    
    if (!this.roomManager) {
      logger.error('RoomManager not initialized in handleAsyncStepComplete');
      return { success: false, error: 'RoomManager not initialized' };
    }

    const room = this.roomManager.findRoomByName(roomName);
    if (!room) {
      logger.error(`Room not found: ${roomName} in handleAsyncStepComplete`);
      return { success: false, error: 'Room not found' };
    }
    
    const participant = room.participants.find(p => p.id === participantId);
    if (participant) {
      participant.asyncStepReady = true;
      logger.info(`Marked participant ${participantId} as ready for step ${step}`);
    } else {
      logger.warn(`Participant ${participantId} not found in room ${roomName}`);
    }
    
    const completedCount = room.participants.filter(p => p.asyncStepReady).length;
    const totalCount = room.participants.length;
    
    logger.info(`Async step progress: ${completedCount}/${totalCount} participants completed ${step}`);
    
    // Emit waitingForOthers to all participants in the room
    this.io.to(room.roomName).emit('waitingForOthers', {
      step,
      completedCount,
      totalCount
    });
    
    // Check if this async step is the last step in gameFlows
    const isLastStep = room.currentStepIndex === room.gameFlows.length - 1;
    if (isLastStep) {
      this.io.to(participantId).emit('goToSurvey');
    }
    
    // Only advance to next step if all participants have completed
    const shouldAdvance = completedCount === totalCount;
    
    // 원본 app.js와 동일하게 모든 참가자가 완료되면 다음 단계로 진행
    if (shouldAdvance) {
      logger.info(`All participants completed ${step} for room ${roomName}, advancing to next step`);
      this.advanceGameStep(room);
    }
    
    return {
      success: true,
      shouldAdvance,
      room,
      data: {
        step,
        completedCount,
        totalCount
      }
    };
  }

  /**
   * Start game
   * @param {Object} room - Room object
   */
  startGame(room) {
    room.gameStartTime = new Date();
    room.gameStarted = true;
    room.inGame = true;
    
    logger.info(`Game started for room: ${room.roomName}`);
    
    // Clear all timers before starting the game to ensure clean state
    this.clearAllTimers(room);
    
    // Notify all clients that game is starting
    this.io.in(room.roomName).emit('startGame', room);
    
    // 원본 app.js와 동일하게 startRound 호출하여 첫 번째 라운드 시작
    if (this.gameStateManager) {
      this.gameStateManager.startRound(room);
    } else {
      logger.warn('GameStateManager not available for starting first round');
    }
  }

  /**
   * Clear all timers for a room to prevent conflicts
   * This is critical for stable timer management during step transitions
   */
  clearAllTimers(room) {
    try {
      logger.debug(`Clearing all timers for room ${room.roomName} before step: ${room.currentStep}`);
      
      // Clear all possible timers (원본 app.js와 동일한 순서)
      if (room.resultTimer) {
        clearInterval(room.resultTimer);
        room.resultTimer = null;
        logger.debug(`Cleared resultTimer for room ${room.roomName}`);
      }

      if (room.roundTimer) {
        clearInterval(room.roundTimer);
        room.roundTimer = null;
        logger.debug(`Cleared roundTimer for room ${room.roomName}`);
      }

      if (room.waitingTimeout) {
        clearTimeout(room.waitingTimeout);
        room.waitingTimeout = null;
        logger.debug(`Cleared waitingTimeout for room ${room.roomName}`);
      }

      if (room.roleTimeout) {
        clearTimeout(room.roleTimeout);
        room.roleTimeout = null;
        logger.debug(`Cleared roleTimeout for room ${room.roomName}`);
      }

      if (room.resultTransitonTimeout) {
        clearTimeout(room.resultTransitonTimeout);
        room.resultTransitonTimeout = null;
        logger.debug(`Cleared resultTransitonTimeout for room ${room.roomName}`);
      }

      if (room.chatTimer) {
        clearInterval(room.chatTimer);
        room.chatTimer = null;
        logger.debug(`Cleared chatTimer for room ${room.roomName}`);
      }

      if (room.gameStopTimer) {
        clearInterval(room.gameStopTimer);
        room.gameStopTimer = null;
        logger.debug(`Cleared gameStopTimer for room ${room.roomName}`);
      }

      if (room.stepTimerInterval) {
        clearInterval(room.stepTimerInterval);
        room.stepTimerInterval = null;
        logger.debug(`Cleared stepTimerInterval for room ${room.roomName}`);
      }

      if (room.chatDuration) {
        room.chatDuration = null;
        logger.debug(`Reset chatDuration for room ${room.roomName}`);
      }

      logger.info(`All timers cleared for room ${room.roomName}`);
    } catch (error) {
      logger.error(`Error clearing timers for room ${room.roomName}:`, error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.roomsInChatPhase.clear();
    logger.info('GameFlowManager cleanup completed');
  }
}

module.exports = GameFlowManager;
