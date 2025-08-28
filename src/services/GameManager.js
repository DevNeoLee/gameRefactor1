/**
 * Game Manager Service
 * Centralizes all game-related business logic and state management
 * Follows the Single Responsibility Principle and provides a clean API
 */

const logger = require('../../utils/logger');
const RoomManager = require('./RoomManager');
const GameFlowManager = require('./GameFlowManager');
const ParticipantManager = require('./ParticipantManager');
const GameStateManager = require('./GameStateManager');

class GameManager {
  constructor(io, config) {
    this.io = io;
    this.config = config;
    
    // Initialize sub-managers
    this.roomManager = new RoomManager(io, config);
    this.gameFlowManager = new GameFlowManager(io, config);
    this.gameStateManager = new GameStateManager(io, config);
    this.participantManager = new ParticipantManager(io, config);
    
    // Inject room manager references to other services
    this.gameFlowManager.setRoomManager(this.roomManager);
    this.gameStateManager.setRoomManager(this.roomManager);
    this.participantManager.setRoomManager(this.roomManager);
    
    // Inject GameFlowManager reference to ParticipantManager
    this.participantManager.setGameFlowManager(this.gameFlowManager);
    
    // Inject io reference to GameStateManager
    this.gameStateManager.setIo(this.io);
    
    // Inject GameFlowManager reference to RoomManager (for original app.js logic)
    this.roomManager.setGameFlowManager(this.gameFlowManager);
    
    // Inject GameStateManager reference to GameFlowManager (for original app.js logic)
    this.gameFlowManager.setGameStateManager(this.gameStateManager);
    
    // Inject GameFlowManager reference to GameStateManager (for original app.js logic)
    this.gameStateManager.setGameFlowManager(this.gameFlowManager);
    
    // Setup Socket.IO event handlers
    this.setupSocketHandlers();
    
    logger.info('GameManager initialized successfully');
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      // Event handlers identical to original app.js
      
      // Handle reconnection attempts (identical to original app.js)
      socket.on('reconnectToRoom', (data) => {
        this.participantManager.handleReconnection(socket, data);
      });

      // Handle new room creation or joining (identical to original app.js)
      socket.on('createOrJoinRoom', (data) => {
        this.participantManager.handleCreateOrJoinRoom(socket, data);
      });

      // Handle participant leaving (identical to original app.js)
      socket.on('participantLeft', (data) => {
        this.participantManager.handleParticipantLeave(socket, data);
      });

      // Handle game decisions (identical to original app.js)
      socket.on('decisionNotice', (data) => {
        this.gameStateManager.handleGameDecision(socket, data);
      });

      // Handle async step completion (identical to original app.js)
      socket.on('asyncStepComplete', (data) => {
        this.gameFlowManager.handleAsyncStepComplete(data.roomName, data.participantId, data.step);
      });

      // Handle chat messages (identical to original app.js)
      socket.on('chatMessage', (data) => {
        this.gameFlowManager.handleChatMessage(socket, data);
      });

      // Handle role assignment (identical to original app.js)
      socket.on('assignRoles', (data) => {
        this.participantManager.handleRoleAssignment(socket, data);
      });

      // Handle chat phase (identical to original app.js)
      socket.on('startChatPhase', (data) => {
        this.gameFlowManager.handleChatPhase(socket, data);
      });

      // Handle session updates (identical to original app.js)
      socket.on('sessionUpdate', (data) => {
        this.participantManager.handleSessionUpdate(socket, data);
      });

      // Handle villager decisions (identical to original app.js)
      socket.on('villager-decision', (data) => {
        this.gameStateManager.handleVillagerDecision(socket, data);
      });

      // Handle participant non-response (identical to original app.js)
      socket.on('participantNotResponded', (data) => {
        this.gameFlowManager.handleParticipantNonResponse(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', this.handleDisconnection.bind(this, socket));
    });
  }

  /**
   * Handle user reconnection to existing room
   */
  async handleReconnection(socket, { sessionId, socketId }) {
    try {
      if (!sessionId) {
        socket.emit('error', { message: 'No session ID provided' });
        return;
      }

      const result = await this.participantManager.handleReconnection(socket, sessionId);
      if (result.success) {
        socket.emit('reconnected', result.data);
        this.io.to(result.roomName).emit('updateParticipants', result.participants);
      } else {
        // If reconnection fails, treat as new connection
        this.roomManager.addToWaitingQueue(socket, sessionId);
      }
    } catch (error) {
      logger.error('Error handling reconnection:', error);
      socket.emit('error', { message: 'Reconnection failed' });
    }
  }

  /**
   * Handle room creation or joining
   */
  async handleRoomCreation(socket, { sessionId, generation, variation, ktf, nm }) {
    try {
      if (!sessionId) {
        socket.emit('error', { message: 'No session ID provided' });
        return;
      }

      const result = await this.roomManager.handleRoomCreation(socket, { sessionId, generation, variation, ktf, nm });
      
      if (result.success) {
        socket.emit('joinedRoom', result.data);
        
        // CRITICAL: Notify other participants about new participant joining (identical to original app.js)
        this.io.to(result.roomName).emit('updateParticipants', result.participants);
        
        // Start game flow if room is full
        if (result.room && result.room.participants.length === this.config.game.maxParticipantsPerRoom) {
          this.gameFlowManager.startGameFlow(result.room);
        }
      }
    } catch (error) {
      logger.error('Error handling room creation:', error);
      socket.emit('error', { message: 'Failed to create or join room' });
    }
  }

  /**
   * Handle participant leaving
   */
  async handleParticipantLeave(socket, roomName) {
    try {
      // CRITICAL: ParticipantManager now handles ALL notifications internally
      // No need to duplicate notifications here to prevent conflicts
      const result = await this.participantManager.handleParticipantLeave(socket, roomName);
      
      if (result.success) {
        logger.info(`Participant leave handled successfully for room ${roomName}`);
      } else {
        logger.warn(`Participant leave handling failed for room ${roomName}: ${result.error}`);
      }
    } catch (error) {
      logger.error('Error handling participant leave:', error);
    }
  }

  /**
   * Handle game decision from participant
   */
  async handleGameDecision(socket, { room_name, villager_id, choice }) {
    try {
      const result = await this.gameStateManager.handleGameDecision(room_name, villager_id, choice);
      if (result.success) {
        this.io.in(room_name).emit('resultArrived', result.data);
        
        if (result.allParticipantsResponded) {
          this.io.in(room_name).emit('totalGroupResultArrived', result.gameResult);
        }
      }
    } catch (error) {
      logger.error('Error handling game decision:', error);
    }
  }

  /**
   * Handle async step completion
   */
  async handleAsyncStepComplete(socket, { roomName, participantId, step }) {
    try {
      const result = await this.gameFlowManager.handleAsyncStepComplete(roomName, participantId, step);
      if (result.success) {
        this.io.to(roomName).emit('waitingForOthers', result.data);
        
        if (result.shouldAdvance) {
          this.gameFlowManager.advanceGameStep(result.room);
        }
      }
    } catch (error) {
      logger.error('Error handling async step complete:', error);
    }
  }

  /**
   * Handle chat message
   */
  async handleChatMessage(socket, message) {
    try {
      const result = await this.gameStateManager.handleChatMessage(socket, message);
      if (result.success) {
        socket.to(result.roomName).emit('chatMessage', message);
      }
    } catch (error) {
      logger.error('Error handling chat message:', error);
    }
  }

  /**
   * Handle role assignment
   */
  async handleRoleAssignment(socket, { roomName }) {
    try {
      const result = await this.participantManager.handleRoleAssignment(roomName);
      if (result.success) {
        this.gameFlowManager.advanceGameStep(result.room);
      }
    } catch (error) {
      logger.error('Error handling role assignment:', error);
    }
  }

  /**
   * Handle chat phase
   */
  async handleChatPhase(socket, { roomName }) {
    try {
      const result = await this.gameFlowManager.handleChatPhase(roomName);
      if (result.success) {
        logger.info(`Chat phase started for room: ${roomName}`);
      }
    } catch (error) {
      logger.error('Error handling chat phase:', error);
    }
  }

  /**
   * Handle session update
   */
  async handleSessionUpdate(socket, { sessionID, updateData }) {
    try {
      await this.participantManager.handleSessionUpdate(sessionID, updateData);
      logger.info('Session updated successfully');
    } catch (error) {
      logger.error('Error updating session:', error);
    }
  }

  /**
   * Handle villager decision
   */
  async handleVillagerDecision(socket, { villagerId, decision }) {
    try {
      const result = await this.participantManager.handleVillagerDecision(villagerId, decision);
      if (result.success) {
        socket.emit('choice-updated', result.data);
      }
    } catch (error) {
      logger.error('Error handling villager decision:', error);
    }
  }

  /**
   * Handle participant non-response
   */
  async handleParticipantNonResponse(socket, { room_name, villager_id }) {
    try {
      const result = await this.participantManager.handleParticipantNonResponse(room_name, villager_id);
      if (result.success) {
        this.io.to(villager_id).emit('youNotResponded', result.role);
        this.io.to(room_name).emit('gameNotRespondedOver', result.role);
      }
    } catch (error) {
      logger.error('Error handling participant non-response:', error);
    }
  }

  /**
   * Handle socket disconnection
   */
  async handleDisconnection(socket) {
    try {
      // CRITICAL: ParticipantManager now handles ALL notifications internally
      // No need to duplicate notifications here to prevent conflicts
      const result = await this.participantManager.handleDisconnection(socket);
      
      if (result.success) {
        logger.info(`Disconnection handled successfully for socket ${socket.id}`);
      } else {
        logger.warn(`Disconnection handling failed for socket ${socket.id}: ${result.error}`);
      }
    } catch (error) {
      logger.error('Error handling disconnection:', error);
    }
  }

  /**
   * Handle user connection
   */
  handleUserConnection(socket, data) {
    try {
      logger.info(`User connected: ${socket.id}`);
      this.participantManager.handleUserConnection(socket, data);
    } catch (error) {
      logger.error('Error handling user connection:', error);
    }
  }

  /**
   * Handle user joining room
   */
  handleUserJoinRoom(socket, data) {
    try {
      this.participantManager.handleUserJoinRoom(socket, data);
    } catch (error) {
      logger.error('Error handling user join room:', error);
    }
  }

  /**
   * Handle user leaving room
   */
  handleUserLeaveRoom(socket, data) {
    try {
      this.participantManager.handleUserLeaveRoom(socket, data);
    } catch (error) {
      logger.error('Error handling user leave room:', error);
    }
  }

  /**
   * Handle game action
   */
  handleGameAction(socket, data) {
    try {
      this.gameStateManager.handleGameAction(socket, data);
    } catch (error) {
      logger.error('Error handling game action:', error);
    }
  }

  /**
   * Handle round completion
   */
  handleRoundComplete(socket, data) {
    try {
      this.gameFlowManager.handleRoundComplete(socket, data);
    } catch (error) {
      logger.error('Error handling round complete:', error);
    }
  }

  /**
   * Handle step completion
   */
  handleStepComplete(socket, data) {
    try {
      this.gameFlowManager.handleStepComplete(socket, data);
    } catch (error) {
      logger.error('Error handling step complete:', error);
    }
  }

  /**
   * Handle survey submission
   */
  handleSurveySubmission(socket, data) {
    try {
      this.participantManager.handleSurveySubmission(socket, data);
    } catch (error) {
      logger.error('Error handling survey submission:', error);
    }
  }

  /**
   * Handle room full event - assign roles and start game flow
   * @param {string} roomName - Room name
   */
  async handleRoomFull(roomName) {
    try {
      const room = this.roomManager.findRoomByName(roomName);
      if (!room) {
        logger.error(`Room not found for roomFull: ${roomName}`);
        return;
      }

      logger.info(`Room ${roomName} is full. Assigning roles and starting game flow...`);
      
      // Assign roles first (following original app.js logic)
      const result = await this.participantManager.handleRoleAssignment(roomName);
      if (result.success) {
        logger.info(`Roles assigned successfully for room: ${roomName}`);
        // Role assignment will automatically advance the game step
      }
      
    } catch (error) {
      logger.error('Error handling room full:', error);
    }
  }

  /**
   * Handle roles assigned complete event - call advanceGameStep
   * @param {string} roomName - Room name
   */
  async handleRolesAssignedComplete(roomName) {
    try {
      const room = this.roomManager.findRoomByName(roomName);
      if (!room) {
        logger.error(`Room not found for rolesAssignedComplete: ${roomName}`);
        return;
      }

      logger.info(`Roles assigned complete for room: ${roomName}. Calling advanceGameStep...`);
      
      // Call advanceGameStep as in original app.js
      this.gameFlowManager.advanceGameStep(room);
      
    } catch (error) {
      logger.error('Error handling rolesAssignedComplete:', error);
    }
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    return {
      totalRooms: this.roomManager.getTotalRooms(),
      activeRooms: this.roomManager.getActiveRooms(),
      waitingUsers: this.roomManager.getWaitingUsersCount(),
      totalParticipants: this.participantManager.getTotalParticipants()
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.roomManager.cleanup();
    this.gameFlowManager.cleanup();
    this.participantManager.cleanup();
    this.gameStateManager.cleanup();
    logger.info('GameManager cleanup completed');
  }
}

module.exports = GameManager;
