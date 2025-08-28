/**
 * Game State Manager Service
 * Handles game state calculations, flood logic, earnings, and result processing
 * Manages the complex business logic for game outcomes
 */

const logger = require('../../utils/logger');

class GameStateManager {
  constructor(io, config) {
    this.io = io;
    this.config = config;
    this.roomManager = null; // Will be injected by GameManager
    
    logger.info('GameStateManager initialized');
  }

  /**
   * Set room manager reference
   * @param {RoomManager} roomManager - Room manager instance
   */
  setRoomManager(roomManager) {
    this.roomManager = roomManager;
  }

  /**
   * Set IO reference
   * @param {Socket.IO} io - Socket.IO instance
   */
  setIo(io) {
    this.io = io;
  }

  /**
   * Set game flow manager reference
   * @param {GameFlowManager} gameFlowManager - Game flow manager instance
   */
  setGameFlowManager(gameFlowManager) {
    this.gameFlowManager = gameFlowManager;
  }

  /**
   * Handle game decision from participant
   * @param {string} roomName - Room name
   * @param {string} villagerId - Villager ID
   * @param {number} choice - Player choice
   * @returns {Object} Result object
   */
  async handleGameDecision(socket, { room_name, villager_id, choice }) {
    try {
      const roomFound = this.roomManager.findRoomByName(room_name);
      if (!roomFound) {
        logger.error(`Room not found: ${room_name}`);
        return;
      }

      const round = roomFound?.currentRound;
      const roundIndex = roomFound.roundIndex;
      const participants = roomFound.participants;

      const participant = participants.find((participant => participant.id == villager_id));
      if (!participant) {
        logger.error(`Participant not found: ${villager_id}`);
        return;
      }

      // 원본 app.js의 getEarningBeforeLoss 함수
      const getEarningBeforeLoss = (choice) => {
        const choiceNumeral = Number(choice)
     
        if (choiceNumeral === 0) {
          return 11;
        } else if (choiceNumeral > 0 && choiceNumeral <= 10) {
          return (10 - choiceNumeral)*3
        } else {
          return 'hmmm';
        }
      }

      // 원본 app.js의 getWaterHeight 함수
      const getWaterHeight = (roundIndex) => {
        const lowVariableWaterLevel = [9, 9, 9, 9, 10, 12, 10, 10, 12, 10, 9, 9];
        const highVariableWaterLevel = [8, 7, 14, 11, 16, 11, 9, 16, 8, 10];
        return roomFound.nm.length > 0 ? highVariableWaterLevel[roundIndex] : highVariableWaterLevel[roundIndex]
      }

      // 원본 app.js의 calculateStockInvested 함수
      const calculateStockInvested = (room, sortedResult, roundIndex) => {
        const totalStockInvested = sortedResult.reduce((acc, value) => Number(value.results[roundIndex]?.choice) + acc, 0)
        room.stockInvested[roundIndex] = totalStockInvested;
        return totalStockInvested;
      }

      // 원본 app.js의 getDepreciatedPreviousLeveeStock 함수
      const getDepreciatedPreviousLeveeStock = (roundIndex) => {
        if (roundIndex < 1) {
          return 75;
        } else if (roundIndex >= 1 && roundIndex < 11) {
          return roomFound.previousLeveeStock[roundIndex - 1] - 25 < 30 ? 30 : roomFound.previousLeveeStock[roundIndex - 1] - 25;
        }
      }

      // 원본 app.js의 getLeveeHeight 함수
      const getLeveeHeight = (currentLeveeStock) => {
        if (currentLeveeStock < 30) {
          return 0;
        } else if (currentLeveeStock < 40) {
          return 2;
        } else if (currentLeveeStock < 50) {
          return 4;
        } else if (currentLeveeStock < 60) {
          return 6;
        } else if (currentLeveeStock < 70) {
          return 8;
        } else if (currentLeveeStock < 80) {
          return 10;
        } else if (currentLeveeStock < 90) {
          return 12;
        } else if (currentLeveeStock < 100) {
          return 14;
        } else if (currentLeveeStock < 110) {
          return 16;
        } else if (currentLeveeStock < 120) {
          return 18;
        } else if (currentLeveeStock >= 120) {
          return 20;
        }
      }

      // 원본 app.js의 getFloodSeverity 함수
      const getFloodSeverity = (severity) => {
        if (severity <= 0) {
          return 0;
        } else if (severity === 1 || severity === 2) {
          return 10;
        } else if (severity === 3 || severity === 4) {
          return 30;
        }else if (severity === 5 || severity === 6) {
          return 50;
        } else if (severity === 7 || severity === 8) {
          return 70;
        } else if (severity === 9 || severity === 10) {
          return 90;
        } else if (severity >= 11 ) {
          return 100;
        } 
      }

      // 원본 app.js의 getFloodLoss 함수
      const getFloodLoss = (roomFound, sortedResult, stockInvested, waterHeight, roundIndex) => {
        const depreciatedPreviousLeveeStock = getDepreciatedPreviousLeveeStock(roundIndex) 
        const currentLeveeStock = depreciatedPreviousLeveeStock + stockInvested;
        const currentLeveeHeight = getLeveeHeight(currentLeveeStock);
        const isFloodLoss = currentLeveeHeight < waterHeight
        const heightComparisionResult =  waterHeight - currentLeveeHeight;
        const floodSeverity = getFloodSeverity(heightComparisionResult)
        return {currentLeveeStock, currentLeveeHeight, floodSeverity};
      }

      const earningBeforeLoss = getEarningBeforeLoss(choice)

      // 원본 app.js의 getEarningsAfterLoss 함수
      const getEarningsAfterLoss = (sortedResult, floodSeverity) => {
        const mappedSortedResult = sortedResult.map((participant, i) => {
          let earningAfterLoss;
          const tokensInvested = 10 - Number(participant.results[roundIndex]?.choice)
          earningAfterLoss = tokensInvested === 10 ? 11 : tokensInvested * 3 * (100 - floodSeverity) / 100
          participant.results[roundIndex].earningAfterLoss = Math.round(earningAfterLoss * 100) / 100;

          return {...participant, totalEarnings: Math.round((participant.totalEarnings + earningAfterLoss) * 100) / 100}
        })
        return mappedSortedResult;
      }

      // 원본 app.js의 sortResult 함수 (필요시 구현)
      const sortResult = (participants, room) => {
        // 원본 app.js의 sortResult 로직을 여기에 구현
        return participants.sort((a, b) => b.totalEarnings - a.totalEarnings);
      }

      participant.results = participant?.results?.map((ele) => ele.roundIndex == roundIndex ? ({...ele, roundIndex, round, choice, earningBeforeLoss}) : ele)
      participant.totalEarnings = participant.totalEarnings + participant.results[roundIndex].totalEarnings;

      // 원본 app.js와 동일하게 resultArrived 이벤트 전송
      this.io.in(room_name).emit('resultArrived', {participants, roundIndex});

      const allFiveEnteredResults = participants.filter(
        participant =>
          participant.results &&
          participant.results[roundIndex] &&
          participant.results[roundIndex].choice !== null &&
          participant.results[roundIndex].choice !== undefined &&
          participant.results[roundIndex].choice !== ''
      );

      if (allFiveEnteredResults.length === 5) {
        const sortedResult = sortResult(allFiveEnteredResults, roomFound);

        // 사람들이 투자한 총 토큰(스탁)  
        const stockInvested = calculateStockInvested(roomFound, sortedResult, roundIndex)
        // 홍수의 높이
        const waterHeight = getWaterHeight(roundIndex);
        // flood loss
        const {currentLeveeStock, currentLeveeHeight, floodSeverity} = getFloodLoss(roomFound, sortedResult, stockInvested, waterHeight, roundIndex)

        roomFound.leveeStocks[roundIndex] = currentLeveeStock;
        roomFound.leveeHeights[roundIndex] = currentLeveeHeight;
        roomFound.waterHeights[roundIndex] = waterHeight;
        roomFound.floodLosses[roundIndex] = floodSeverity;

        // 홍수후 손실된 이익
        const updatedSortedResultWithNewEarnings = getEarningsAfterLoss(sortedResult, floodSeverity) 

        //특정 round 일 경우. 
        if (roundIndex == 9) {
          roomFound.gameCompleted = true;
          roomFound.gameEndTime = new Date();
        } 

        roomFound.gameResults = {roundIndex, round, ...updatedSortedResultWithNewEarnings, floodLoss: floodSeverity}
        roomFound.participants = roomFound.participants.map(participant => {
          const updatedParticipant = updatedSortedResultWithNewEarnings.find(p => p.id === participant.id);
          return updatedParticipant ? { ...participant, ...updatedParticipant } : participant;
        });

        roomFound.previousLeveeStock[roundIndex] = currentLeveeStock;

        //game state save in DB
        await this.roomManager.updateGameToDB(roomFound)

        //game state share to every villagers (원본 app.js와 동일)
        this.io.in(room_name).emit('totalGroupResultArrived', {waterHeight, currentLeveeHeight, currentLeveeStock, floodLoss: floodSeverity, result: updatedSortedResultWithNewEarnings, roundIndex});

        // 원본 app.js와 동일하게 resultDuration 타이머 시작
        this.startResultDurationTimer(roomFound, roundIndex);
        
        // 추가 디버깅: 현재 라운드의 모든 참가자 응답 상태 확인
        const allResponded = roomFound.participants.every(participant => 
          participant.results && 
          participant.results[roundIndex] && 
          participant.results[roundIndex].choice !== null
        );
        logger.info(`All participants responded for round ${roundIndex}: ${allResponded}`);
      }

      logger.info(`Decision processed for participant ${villager_id} in room ${room_name}, choice: ${choice}`);
    } catch (error) {
      logger.error('Error handling game decision:', error);
    }
  }

  /**
   * Start a new round - copied directly from original app.js
   * @param {Object} room - Room object
   */
  startRound(room) {
    try {
      logger.info(`Starting round ${room.roundIndex} for room: ${room.roomName} - clearing all existing timers`);
      
      // CRITICAL: Use the comprehensive timer cleanup method to ensure ALL timers are cleared
      // This prevents cumulative timer conflicts that build up over multiple rounds
      this.clearAllTimersForRound(room);

      // Update room currentStep based on round index (원본 app.js와 동일)
      if (room.roundIndex === 10) {
        room.now = 76;
      } else if (room.roundIndex === 2) {
        room.now = 34;
      } else if (room.roundIndex === 0) {
        room.now = 22;
      }

      // Emit round start event to all clients (원본 app.js와 동일)
      logger.info(`Emitting roundStart for room ${room.roomName}, round ${room.roundIndex}, duration: ${room.roundDuration}, inGame: ${room.inGame}`);
      
      this.io.in(room.roomName).emit('roundStart', {
        roundIndex: room.roundIndex,
        roundDuration: room.roundDuration,
        now: room.now,
        currentRound: room.currentRound
      });

      if (room.inGame) {
        // Start the round timer (원본 app.js와 동일)
        logger.info(`Starting round timer for room ${room.roomName}, round ${room.roundIndex}, duration: ${room.roundDuration}`);
        
        // CRITICAL: Ensure roundDuration is set correctly and reset any inherited state
        room.roundDuration = 60; // Always reset to 60 for each new round
        logger.info(`Reset roundDuration to 60 for room ${room.roomName}, round ${room.roundIndex}`);
        
        // Additional safety: ensure no timer conflicts from previous rounds
        if (room.roundTimer) {
          logger.warn(`Found existing roundTimer for room ${room.roomName}, clearing before starting new one`);
          clearInterval(room.roundTimer);
          room.roundTimer = null;
        }
        
        room.roundTimer = setInterval(() => {
          // CRITICAL: Multiple safety checks to prevent timer conflicts
          if (!room.roundTimer) {
            logger.warn(`Round timer interval still running but roundTimer is null for room ${room.roomName}, clearing interval`);
            clearInterval(room.roundTimer);
            return;
          }
          
          // Additional safety: check if this round is still valid
          if (room.currentStep !== 'rounds' || !room.inGame) {
            logger.warn(`Round timer running but room state changed for room ${room.roomName}, clearing timer`);
            clearInterval(room.roundTimer);
            room.roundTimer = null;
            return;
          }
          
          // CRITICAL: Prevent round timer from running during nearMissNotification step
          // This is the root cause of timer conflicts for LLVN treatment type
          if (room.currentStep === 'nearMissNotification') {
            logger.warn(`Round timer running during nearMissNotification step for room ${room.roomName}, clearing timer`);
            clearInterval(room.roundTimer);
            room.roundTimer = null;
            return;
          }
          
          room.roundDuration -= 1;
          
          // Safely check if all participants have made their choices
          const everyArrived = room.participants?.every((participant) => {
            if (!participant.results || !participant.results[room.roundIndex]) {
              return false;
            }
            return participant.results[room.roundIndex].choice !== null;
          });
          
          // Emit round timer update
          this.io.in(room.roomName).emit('roundDuration', room.roundDuration);
          
          logger.debug(`Round timer tick: ${room.roundDuration}s remaining, all arrived: ${everyArrived}, participants: ${room.participants?.length}, roundIndex: ${room.roundIndex}`);
      
          if (everyArrived) {
            logger.info(`All participants arrived for room ${room.roomName}, round ${room.roundIndex}, starting result phase`);
            
            // CRITICAL: Clear round timer immediately when all participants arrive
            if (room.roundTimer) {
              clearInterval(room.roundTimer);
              room.roundTimer = null;
              logger.info(`Round timer cleared for room ${room.roomName}, round ${room.roundIndex} - all participants arrived`);
            }
            
            // CRITICAL: Set flag to prevent duplicate result phase start
            room.resultPhaseStarted = true;
            
            // Start result phase
            this.startToCountResultForAll(room);
          } else if (room.roundDuration === 0 && !room.resultPhaseStarted) {
            logger.info(`Round timer expired for room ${room.roomName}, round ${room.roundIndex}, starting result phase`);
            
            // CRITICAL: Clear round timer when timer expires
            if (room.roundTimer) {
              clearInterval(room.roundTimer);
              room.roundTimer = null;
              logger.info(`Round timer cleared for room ${room.roomName}, round ${room.roundIndex} - timer expired`);
            }
            
            // CRITICAL: Set flag to prevent duplicate result phase start
            room.resultPhaseStarted = true;
            
            // Start result phase
            this.startToCountResultForAll(room);
          }
        }, 1000);
      } else {
        logger.warn(`Room ${room.roomName} is not in game, skipping round timer start`);
      }

      logger.info(`Round ${room.roundIndex} started for room: ${room.roomName}`);
    } catch (error) {
      logger.error('Error starting round:', error);
    }
  }

  /**
   * Clear ALL timers for a round to prevent cumulative conflicts
   * This is specifically for round transitions and must be comprehensive
   */
  clearAllTimersForRound(room) {
    try {
      logger.info(`CRITICAL: Clearing ALL timers for round ${room.roundIndex} in room ${room.roomName}`);
      
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

      // CRITICAL: Reset timer-related state variables to prevent conflicts
      if (room.roundDuration !== undefined) {
        room.roundDuration = 60; // Reset to default
        logger.debug(`Reset roundDuration to 60 for room ${room.roomName}`);
      }

      if (room.resultDuration !== undefined) {
        room.resultDuration = 20; // Reset to default
        logger.debug(`Reset resultDuration to 20 for room ${room.roomName}`);
      }
      
      // CRITICAL: Reset result phase flag for new round
      room.resultPhaseStarted = false;
      logger.debug(`Reset resultPhaseStarted to false for room ${room.roomName}, round ${room.roundIndex}`);

      // Force garbage collection of any remaining timer references
      if (global.gc) {
        global.gc();
        logger.debug(`Forced garbage collection for room ${room.roomName}`);
      }

      logger.info(`ALL timers cleared for round ${room.roundIndex} in room ${room.roomName}`);
    } catch (error) {
      logger.error(`Error clearing timers for round ${room.roundIndex} in room ${room.roomName}:`, error);
    }
  }

  /**
   * Start counting result for all participants - copied from original app.js
   * @param {Object} room - Room object
   */
  startToCountResultForAll(room) {
    try {
      logger.info(`startToCountResultForAll called for room ${room.roomName}, round ${room.roundIndex}`);
      
      // CRITICAL: Prevent duplicate calls for the same round
      if (room.resultTimer) {
        logger.warn(`Result timer already exists for room ${room.roomName}, round ${room.roundIndex}, skipping duplicate call`);
        return;
      }
      
      // CRITICAL: Clear round timer (원본 app.js와 동일)
      if (room.roundTimer) {
        clearInterval(room.roundTimer);
        room.roundTimer = null;
        logger.info(`Cleared roundTimer in startToCountResultForAll for room ${room.roomName}`);
      }
      
      // Additional safety: ensure roundDuration is reset to prevent conflicts
      if (room.roundDuration !== undefined) {
        room.roundDuration = 0;
        logger.debug(`Reset roundDuration to 0 for room ${room.roomName} to prevent timer conflicts`);
      }
      
      // CRITICAL: Emit event to frontend to stop showing round timer
      // This ensures the frontend knows the round phase is over
      this.io.in(room.roomName).emit('roundPhaseEnded', {
        roundIndex: room.roundIndex,
        message: 'Round phase ended, showing results'
      });

      // CRITICAL: Set resultDuration and start timer (원본 app.js와 동일)
      room.resultDuration = 20;
      logger.info(`Starting result timer for room ${room.roomName}, round ${room.roundIndex}, duration: ${room.resultDuration}`);
      
      // CRITICAL: Emit initial resultDuration to frontend
      this.io.in(room.roomName).emit('resultDuration', room.resultDuration);
      
      room.resultTimer = setInterval(() => {
        // CRITICAL: Prevent result timer from running during nearMissNotification step
        if (room.currentStep === 'nearMissNotification') {
          logger.warn(`Result timer running during nearMissNotification step for room ${room.roomName}, clearing timer`);
          clearInterval(room.resultTimer);
          room.resultTimer = null;
          return;
        }
        
        room.resultDuration -= 1;
        logger.info(`Result timer tick for room ${room.roomName}, round ${room.roundIndex}: ${room.resultDuration} seconds remaining`);
        
        // CRITICAL: Emit resultDuration to frontend for countdown
        this.io.in(room.roomName).emit('resultDuration', room.resultDuration);
      
        if (room.resultDuration == 0) {
          logger.info(`Result timer expired for room ${room.roomName}, round ${room.roundIndex}, calling endRound`);
          this.io.in(room.roomName).emit('finalResultTableEnd', room);
          this.endRound(room);
        }
      }, 1000);
      
      logger.info(`Started counting result for room: ${room.roomName}, round: ${room.roundIndex}, duration: ${room.resultDuration}`);
    } catch (error) {
      logger.error('Error starting result count:', error);
    }
  }

  // 원본 app.js의 resultDuration 타이머 로직을 그대로 구현
  startResultDurationTimer(room, roundIndex) {
    // 이 메서드는 startToCountResultForAll과 중복되므로 제거하고 startToCountResultForAll 사용
    this.startToCountResultForAll(room);
  }

  // 원본 app.js의 endRound 함수 로직을 그대로 구현
  endRound(room) {
    try {
      logger.info(`endRound called for room ${room.roomName}, round ${room.roundIndex} - cleaning up timers`);
      
      // 기존 타이머들 정리
      if (room.resultTimer) {
        clearInterval(room.resultTimer);
        room.resultTimer = null;
        logger.debug(`Cleared resultTimer for room ${room.roomName}`);
      }

      if (room.resultTransitonTimeout) {
        clearTimeout(room.resultTransitonTimeout);
        room.resultTransitonTimeout = null;
      }

      if (room.waitingRoomTimer) {
        clearInterval(room.waitingRoomTimer);
        room.waitingRoomTimer = null;
      }

      if (room.waitingTimeout) {
        clearTimeout(room.waitingTimeout);
        room.waitingTimeout = null;
      }

      if (room.roleTimeout) {
        clearTimeout(room.roleTimeout);
        room.roleTimeout = null;
      }

      if (room.roundTimer) {
        clearInterval(room.roundTimer);
        room.roundTimer = null;
        logger.debug(`Cleared roundTimer in endRound for room ${room.roomName}`);
      }

      // Additional cleanup (원본 app.js와 동일)
      if (room.gameStopTimer) {
        clearInterval(room.gameStopTimer);
        room.gameStopTimer = null;
        logger.debug(`Cleared gameStopTimer in endRound for room ${room.roomName}`);
      }

      // resultDuration 재설정 (원본 app.js와 동일)
      room.resultDuration = 20;
      logger.debug(`Reset resultDuration to 20 for room ${room.roomName}`);

      // 라운드가 끝났음을 모든 방에 알림
      this.io.in(room.roomName).emit('roundEnded', room);

      // 다음 라운드 준비 (원본 app.js와 동일)
      if (room.inGame) {
        // 마지막 라운드 일때(FirstPart/SecondPart) 
        if (room.roundIndex == 9) {
          logger.info(`Final round completed for room ${room.roomName}, advancing to next game step`);
          room.gameCompleted = true;
          room.inGame = false;
          
          // Call advanceGameStep to move to next step in game flow
          if (this.gameFlowManager) {
            this.gameFlowManager.advanceGameStep(room);
          } else {
            logger.warn('GameFlowManager not available for advancing game step');
          }
        } else {
          // 다음라운드가 계속 진행되는 라운드일때
          logger.info(`Preparing next round for room ${room.roomName}, current round: ${room.roundIndex}`);
          room.resultTransitonTimeout = setTimeout(() => {
            room.roundIndex += 1;
            room.roundDuration = 60; // Reset the round duration
            room.now = 22 + (room.roundIndex * 6);
            room.currentRound = this.config.game.rounds[room.roundIndex];
            logger.info(`Starting next round ${room.roundIndex} for room ${room.roomName}`);
            this.startRound(room); // 원본 app.js와 동일하게 startRound 호출
          }, 500);
        }
      }

      logger.info(`Round ended for room ${room.roomName}, round ${room.roundIndex}`);
    } catch (error) {
      logger.error('Error ending round:', error);
    }
  }

  /**
   * Calculate earnings before loss
   * @param {number} choice - Player choice
   * @returns {number} Earnings before loss
   */
  calculateEarningBeforeLoss(choice) {
    const choiceNumeral = Number(choice);
    
    if (choiceNumeral === 0) {
      return 11;
    } else if (choiceNumeral > 0 && choiceNumeral <= 10) {
      return (10 - choiceNumeral) * 3;
    } else {
      logger.warn(`Invalid choice value: ${choice}`);
      return 0;
    }
  }

  /**
   * Check if all participants have responded
   * @param {Object} room - Room object
   * @param {number} roundIndex - Round index
   * @returns {boolean} True if all participants responded
   */
  checkAllParticipantsResponded(room, roundIndex) {
    return room.participants.every(participant =>
      participant.results &&
      participant.results[roundIndex] &&
      participant.results[roundIndex].choice !== null &&
      participant.results[roundIndex].choice !== undefined &&
      participant.results[roundIndex].choice !== ''
    );
  }

  /**
   * Process round results for all participants
   * @param {Object} room - Room object
   * @param {number} roundIndex - Round index
   * @returns {Object} Game result object
   */
  async processRoundResults(room, roundIndex) {
    logger.info(`Processing round ${roundIndex} results for room: ${room.roomName}`);
    
    // Sort results by role
    const sortedResult = this.sortResultsByRole(room.participants);
    
    // Calculate total stock invested
    const stockInvested = this.calculateTotalStockInvested(sortedResult, roundIndex);
    room.stockInvested[roundIndex] = stockInvested;
    
    // Get water height for this round
    const waterHeight = this.getWaterHeight(roundIndex, room.nm);
    
    // Calculate flood loss
    const floodResult = this.calculateFloodLoss(room, sortedResult, stockInvested, waterHeight, roundIndex);
    
    // Update room state
    room.leveeStocks[roundIndex] = floodResult.currentLeveeStock;
    room.leveeHeights[roundIndex] = floodResult.currentLeveeHeight;
    room.waterHeights[roundIndex] = waterHeight;
    room.floodLosses[roundIndex] = floodResult.floodSeverity;
    
    // Calculate earnings after loss
    const updatedResults = this.calculateEarningsAfterLoss(sortedResult, floodResult.floodSeverity, roundIndex);
    
    // Update participants with new earnings
    room.participants = room.participants.map(participant => {
      const updatedParticipant = updatedResults.find(p => p.id === participant.id);
      return updatedParticipant ? { ...participant, ...updatedParticipant } : participant;
    });
    
    // Check if this is the final round
    if (roundIndex === 9) {
      room.gameCompleted = true;
      room.gameEndTime = new Date();
      logger.info(`Game completed for room: ${room.roomName}`);
    }
    
    // Update previous levee stock
    room.previousLeveeStock[roundIndex] = floodResult.currentLeveeStock;
    
    // Create game result object
    const gameResult = {
      roundIndex,
      round: room.currentRound,
      ...updatedResults,
      floodLoss: floodResult.floodSeverity
    };
    
    room.gameResults = gameResult;
    
    // Save to database using RoomManager
    if (this.roomManager) {
      await this.roomManager.updateGameToDB(room);
    }
    
    return {
      waterHeight,
      currentLeveeHeight: floodResult.currentLeveeHeight,
      currentLeveeStock: floodResult.currentLeveeStock,
      floodLoss: floodResult.floodSeverity,
      result: updatedResults,
      roundIndex
    };
  }

  /**
   * Sort results by participant role
   * @param {Array} participants - Array of participants
   * @returns {Array} Sorted results
   */
  sortResultsByRole(participants) {
    const sortedResults = [];
    
    participants.forEach(participant => {
      if (participant.role === 'Villager1') {
        sortedResults[0] = participant;
      } else if (participant.role === 'Villager2') {
        sortedResults[1] = participant;
      } else if (participant.role === 'Villager3') {
        sortedResults[2] = participant;
      } else if (participant.role === 'Villager4') {
        sortedResults[3] = participant;
      } else if (participant.role === 'Villager5') {
        sortedResults[4] = participant;
      }
    });
    
    return sortedResults;
  }

  /**
   * Calculate total stock invested by all participants
   * @param {Array} sortedResult - Sorted participant results
   * @param {number} roundIndex - Round index
   * @returns {number} Total stock invested
   */
  calculateTotalStockInvested(sortedResult, roundIndex) {
    return sortedResult.reduce((acc, participant) => {
      const choice = Number(participant.results[roundIndex]?.choice) || 0;
      return acc + choice;
    }, 0);
  }

  /**
   * Get water height for a specific round
   * @param {number} roundIndex - Round index
   * @param {string} nm - Near miss parameter
   * @returns {number} Water height
   */
  getWaterHeight(roundIndex, nm) {
    const lowVariableWaterLevel = [9, 9, 9, 9, 10, 12, 10, 10, 12, 10, 9, 9];
    const highVariableWaterLevel = [8, 7, 14, 11, 16, 11, 9, 16, 8, 10];
    
    return nm && nm.length > 0 ? 
      highVariableWaterLevel[roundIndex] : 
      lowVariableWaterLevel[roundIndex];
  }

  /**
   * Calculate flood loss based on levee height and water height
   * @param {Object} room - Room object
   * @param {Array} sortedResult - Sorted participant results
   * @param {number} stockInvested - Total stock invested
   * @param {number} waterHeight - Water height
   * @param {number} roundIndex - Round index
   * @returns {Object} Flood calculation result
   */
  calculateFloodLoss(room, sortedResult, stockInvested, waterHeight, roundIndex) {
    const depreciatedPreviousLeveeStock = this.getDepreciatedPreviousLeveeStock(room, roundIndex);
    const currentLeveeStock = depreciatedPreviousLeveeStock + stockInvested;
    const currentLeveeHeight = this.getLeveeHeight(currentLeveeStock);
    const isFloodLoss = currentLeveeHeight < waterHeight;
    const heightComparisonResult = waterHeight - currentLeveeHeight;
    const floodSeverity = this.getFloodSeverity(heightComparisonResult);
    
    return {
      currentLeveeStock,
      currentLeveeHeight,
      floodSeverity
    };
  }

  /**
   * Get depreciated previous levee stock
   * @param {Object} room - Room object
   * @param {number} roundIndex - Round index
   * @returns {number} Depreciated levee stock
   */
  getDepreciatedPreviousLeveeStock(room, roundIndex) {
    if (roundIndex < 1) {
      return 75;
    } else if (roundIndex >= 1 && roundIndex < 11) {
      const previousStock = room.previousLeveeStock[roundIndex - 1] || 75;
      return previousStock - 25 < 30 ? 30 : previousStock - 25;
    }
    return 75; // Default fallback
  }

  /**
   * Get levee height based on stock
   * @param {number} currentLeveeStock - Current levee stock
   * @returns {number} Levee height
   */
  getLeveeHeight(currentLeveeStock) {
    if (currentLeveeStock < 30) return 0;
    if (currentLeveeStock < 40) return 2;
    if (currentLeveeStock < 50) return 4;
    if (currentLeveeStock < 60) return 6;
    if (currentLeveeStock < 70) return 8;
    if (currentLeveeStock < 80) return 10;
    if (currentLeveeStock < 90) return 12;
    if (currentLeveeStock < 100) return 14;
    if (currentLeveeStock < 110) return 16;
    if (currentLeveeStock < 120) return 18;
    return 20; // >= 120
  }

  /**
   * Get flood severity based on height difference
   * @param {number} severity - Height difference
   * @returns {number} Flood severity percentage
   */
  getFloodSeverity(severity) {
    if (severity <= 0) return 0;
    if (severity === 1 || severity === 2) return 10;
    if (severity === 3 || severity === 4) return 30;
    if (severity === 5 || severity === 6) return 50;
    if (severity === 7 || severity === 8) return 70;
    if (severity === 9 || severity === 10) return 90;
    return 100; // >= 11
  }

  /**
   * Calculate earnings after flood loss
   * @param {Array} sortedResult - Sorted participant results
   * @param {number} floodSeverity - Flood severity percentage
   * @param {number} roundIndex - Round index
   * @returns {Array} Updated participant results
   */
  calculateEarningsAfterLoss(sortedResult, floodSeverity, roundIndex) {
    return sortedResult.map(participant => {
      const tokensInvested = 10 - Number(participant.results[roundIndex]?.choice || 0);
      let earningAfterLoss;
      
      if (tokensInvested === 10) {
        earningAfterLoss = 11;
      } else {
        earningAfterLoss = tokensInvested * 3 * (100 - floodSeverity) / 100;
      }
      
      // Update participant's result
      participant.results[roundIndex].earningAfterLoss = Math.round(earningAfterLoss * 100) / 100;
      
      // Update total earnings
      participant.totalEarnings = Math.round((participant.totalEarnings + earningAfterLoss) * 100) / 100;
      
      return participant;
    });
  }

  /**
   * Handle chat message
   * @param {Object} socket - Socket instance
   * @param {Object} message - Chat message
   * @returns {Object} Result object
   */
  async handleChatMessage(socket, message) {
    try {
      if (!this.roomManager) {
        return { success: false, error: 'RoomManager not initialized' };
      }

      const room = this.roomManager.findRoomBySocketId(socket.id);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      // Store message in room's chat history
      if (!room.chatHistory) {
        room.chatHistory = [];
      }
      room.chatHistory.push(message);
      
      // Update room in database using RoomManager
      if (this.roomManager) {
        await this.roomManager.updateGameToDB(room);
      }
      
      return {
        success: true,
        roomName: room.roomName
      };
      
    } catch (error) {
      logger.error('Error handling chat message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get game statistics
   * @param {Object} room - Room object
   * @returns {Object} Game statistics
   */
  getGameStats(room) {
    return {
      currentRound: room.roundIndex,
      totalRounds: room.totalRounds,
      participants: room.participants?.length || 0,
      gameCompleted: room.gameCompleted,
      gameDropped: room.gameDropped,
      currentWater: room.now,
      totalStockInvested: room.stockInvested?.reduce((sum, stock) => sum + (stock || 0), 0) || 0,
      totalFloodLoss: room.floodLosses?.reduce((sum, loss) => sum + (loss || 0), 0) || 0
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    logger.info('GameStateManager cleanup completed');
  }
}

module.exports = GameStateManager;
