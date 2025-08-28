/**
 * Participant Manager Service
 * Handles participant lifecycle, role assignment, reconnection, and participant state
 * Manages all participant-related operations and state transitions
 */

const logger = require('../../utils/logger');
const Session = require('../../model/session');

class ParticipantManager {
  constructor(io, config) {
    this.io = io;
    this.config = config;
    this.roomManager = null; // Will be injected by GameManager
    this.gameFlowManager = null; // GameFlowManager 참조 추가
    
    logger.info('ParticipantManager initialized');
  }

  /**
   * Set room manager reference
   * @param {RoomManager} roomManager - Room manager instance
   */
  setRoomManager(roomManager) {
    this.roomManager = roomManager;
  }

  /**
   * Set GameFlowManager reference
   * @param {GameFlowManager} gameFlowManager - GameFlowManager instance
   */
  setGameFlowManager(gameFlowManager) {
    this.gameFlowManager = gameFlowManager;
  }

  /**
   * Handle participant reconnection
   * @param {Object} socket - Socket instance
   * @param {string} sessionId - Session ID
   * @returns {Object} Result object
   */
  async handleReconnection(socket, sessionId) {
    try {
      if (!this.roomManager) {
        return { success: false, error: 'RoomManager not initialized' };
      }

      // Find the room this session belongs to
      const room = this.roomManager.findRoomBySessionId(sessionId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      // Find the participant
      const participant = room.participants.find(p => p.sessionId === sessionId);
      if (!participant) {
        return { success: false, error: 'Participant not found' };
      }

      // Initialize results array if it doesn't exist
      if (!participant.results) {
        participant.results = Array(10).fill(null).map(() => ({ 
          choice: null, 
          totalWater: 0, 
          totalScore: 0 
        }));
      }
      
      // Update the socket ID but keep all other data
      participant.id = socket.id;
      socket.join(room.roomName);
      
      logger.info(`Participant ${sessionId} reconnected to room ${room.roomName}`);
      
      return {
        success: true,
        roomName: room.roomName,
        data: {
          roomId: room._id,
          roomName: room.roomName,
          size: room.participants.length,
          playersNeeded: this.config.game.maxParticipantsPerRoom - room.participants.length
        },
        participants: room.participants
      };

    } catch (error) {
      logger.error('Error handling reconnection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle participant leaving
   * @param {Object} socket - Socket instance
   * @param {string} roomName - Room name
   * @returns {Object} Result object
   */
  async handleParticipantLeave(socket, roomName) {
    try {
      if (!this.roomManager) {
        return { success: false, error: 'RoomManager not initialized' };
      }

      const room = this.roomManager.findRoomByName(roomName);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      const participantWentOut = room.participants?.find(p => p.id === socket.id);
      const participantsRest = room.participants?.filter(p => p.id !== socket.id);
      
      if (!participantWentOut) {
        return { success: false, error: 'Participant not found' };
      }

      let gameDropped = false;

      // Handle different game states
      if (room.currentStep === 'waiting') {
        // Add back role to available roles list
        if (participantWentOut.role) {
          room.roles = [...room.roles, participantWentOut.role];
        }
        
        // Remove participant from room
        room.participants = participantsRest;
        
        // CRITICAL: Notify remaining participants about updated participant list (원본 app.js와 동일)
        // This ensures waiting room participants know who left
        this.io.to(roomName).emit('updateParticipants', room.participants);
        
        // Leave socket room
        socket.leave(roomName);
        
        // Disconnect the user
        const socketToDisconnect = this.io.sockets.sockets.get(socket.id);
        if (socketToDisconnect) {
          socketToDisconnect.disconnect();
        }

        // Remove room if empty
        if (room.participants.length === 0) {
          this.roomManager.removeRoom(roomName);
        }

      } else if (this.isGameInProgress(room.currentStep)) {
        // Game is in progress, mark as dropped (원본 app.js와 동일)
        gameDropped = true;
        room.gameDropped = true;
        room.gameEndTime = new Date();
        room.participantDropped = participantWentOut;
        
        // Leave socket room (원본 app.js와 동일)
        socket.leave(roomName);
        
        // Update room participants (원본 app.js와 동일)
        room.participants = participantsRest;
        
        // CRITICAL: Update database before sending notifications (원본 app.js와 동일)
        if (this.roomManager) {
          await this.roomManager.updateGameToDB(room);
        }
        
        // CRITICAL: Send gamePrematureOver event (원본 app.js와 동일)
        // This is what the frontend expects, not gameDropped
        this.io.to(roomName).emit('gamePrematureOver', room);
        
        // Disconnect remaining participants (원본 app.js와 동일)
        room.participants.forEach(participant => {
          const socketToKick = this.io.sockets.sockets.get(participant.id);
          if (socketToKick) {
            socketToKick.disconnect();
          }
        });

        // Disconnect the leaving participant (원본 app.js와 동일)
        const socketWhoLeft = this.io.sockets.sockets.get(socket.id);
        if (socketWhoLeft) {
          socketWhoLeft.disconnect();
        }

        // Remove room from list (원본 app.js와 동일)
        // CRITICAL: Remove room immediately after sending notifications, just like original app.js
        this.roomManager.removeRoom(roomName);
      }

      logger.info(`Participant ${participantWentOut.sessionId} left room ${roomName}, gameDropped: ${gameDropped}`);

      return {
        success: true,
        gameDropped,
        room,
        participants: room.participants || []
      };

    } catch (error) {
      logger.error('Error handling participant leave:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if game is in progress
   * @param {string} currentStep - Current game step
   * @returns {boolean} True if game is in progress
   */
  isGameInProgress(currentStep) {
    const inProgressSteps = [
      'participantsReady', 'roleSelection', 'transitionNotification1', 
      'nearMissNotification', 'transitionNotification2', 'nearMissPreSurvey', 
      'rounds', 'transitionNotification3'
    ];
    
    return inProgressSteps.includes(currentStep);
  }

  /**
   * Handle role assignment
   * @param {string} roomName - Room name
   * @returns {Object} Result object
   */
  async handleRoleAssignment(roomName) {
    try {
      if (!this.roomManager) {
        return { success: false, error: 'RoomManager not initialized' };
      }

      const room = this.roomManager.findRoomByName(roomName);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      // Reset roles for next game (following original app.js exactly)
      room.roles = [...this.config.game.roles];

      // Assign roles to participants
      room.participants.forEach(participant => {
        const role = this.getRandomRole(room);
        participant.role = role;
        
        // Emit roleSelected immediately to each participant (following original app.js)
        this.io.to(participant.id).emit('roleSelected', { 
          role, 
          socketId: participant.id, 
          mTurkcode: participant.mTurkcode 
        });
      });
      
      // Create roles object for broadcast (following original app.js)
      const rolesObject = room.participants.reduce((acc, participant) => {
        acc[participant.id] = participant.role;
        return acc;
      }, {});
      
      // Emit rolesAssigned event to all clients in the room immediately (following original app.js)
      this.io.in(room.roomName).emit('rolesAssigned', { roles: rolesObject });
      
      // GAME_FLOWS에 따라 다음 단계로 현재 단계 설정 (following original app.js exactly)
      // This will be handled by GameFlowManager.advanceGameStep(room)
      
      // Update room in database (following original app.js)
      if (this.roomManager) {
        await this.roomManager.updateGameToDB(room);
      }
      
      logger.info(`Roles assigned for room: ${roomName}`, rolesObject);
      
      return {
        success: true,
        room
      };

    } catch (error) {
      logger.error('Error handling role assignment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get random role from available roles
   * @param {Object} room - Room object
   * @returns {string} Role name
   */
  getRandomRole(room) {
    const role = room.roles[Math.floor(Math.random() * room.roles.length)];
    const index = room.roles.indexOf(role);
    room.roles.splice(index, 1);
    return role;
  }

  /**
   * Handle session update
   * @param {string} sessionID - Session ID
   * @param {Object} updateData - Update data
   * @returns {Object} Result object
   */
  async handleSessionUpdate(sessionID, updateData) {
    try {
      await Session.updateOne({ _id: sessionID }, { $set: updateData });
      logger.info(`Session ${sessionID} updated successfully`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error updating session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle villager decision
   * @param {string} villagerId - Villager ID
   * @param {Object} decision - Decision data
   * @returns {Object} Result object
   */
  async handleVillagerDecision(villagerId, decision) {
    try {
      const sessionData = await Session.findOneAndUpdate(
        { villagerId },
        { $set: { decision } },
        { new: true }
      );

      if (sessionData) {
        logger.info(`Villager decision updated for ${villagerId}`);
        return {
          success: true,
          data: sessionData
        };
      } else {
        return { success: false, error: 'Session not found' };
      }
    } catch (error) {
      logger.error('Error updating villager decision:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle participant non-response
   * @param {string} roomName - Room name
   * @param {string} villagerId - Villager ID
   * @returns {Object} Result object
   */
  async handleParticipantNonResponse(roomName, villagerId) {
    try {
      if (!this.roomManager) {
        return { success: false, error: 'RoomManager not initialized' };
      }

      const room = this.roomManager.findRoomByName(roomName);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      const participantNotResponded = room.participants?.find(p => p.id === villagerId);
      if (!participantNotResponded) {
        return { success: false, error: 'Participant not found' };
      }

      // Mark game as dropped
      room.gameDropped = true;
      room.gameEndTime = new Date();
      room.participantNotResponded = participantNotResponded;

      // CRITICAL: Notify all participants about game drop (원본 app.js와 동일)
      this.io.to(roomName).emit('gameDropped', { 
        reason: 'participant_not_responded',
        role: participantNotResponded.role
      });

      // Get sockets in room
      const socketsInRoom = this.io.sockets.adapter.rooms.get(roomName);

      if (socketsInRoom) {
        for (const socketId of socketsInRoom) {
          if (socketId === villagerId) {
            // Send message to non-responding participant
            this.io.to(socketId).emit('youNotResponded', participantNotResponded.role);
          } else {
            // Send message to other participants
            this.io.to(socketId).emit('gameNotRespondedOver', participantNotResponded.role);
          }
        }
      }
      
      // CRITICAL: Notify remaining participants about updated participant list (원본 app.js와 동일)
      // Remove the non-responding participant before notifying others
      room.participants = room.participants.filter(p => p.id !== villagerId);
      this.io.to(roomName).emit('updateParticipants', room.participants);

      // Disconnect all participants
      room.participants.forEach(participant => {
        const socketToKick = this.io.sockets.sockets.get(participant.id);
        if (socketToKick) {
          socketToKick.disconnect();
        }
      });

      // Remove room
      this.roomManager.removeRoom(roomName);

      logger.info(`Game dropped due to non-response from ${villagerId} in room ${roomName}`);

      return {
        success: true,
        role: participantNotResponded.role
      };

    } catch (error) {
      logger.error('Error handling participant non-response:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle socket disconnection
   * @param {Object} socket - Socket instance
   * @returns {Object} Result object
   */
  async handleDisconnection(socket) {
    try {
      if (!this.roomManager) {
        return { success: false, error: 'RoomManager not initialized' };
      }

      // Find the room this socket was in
      const room = this.roomManager.findRoomBySocketId(socket.id);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      const participant = room.participants.find(p => p.id === socket.id);
      if (!participant) {
        return { success: false, error: 'Participant not found' };
      }

      let gameDropped = false;

      // Update room state
      if (room.participants.length === 0) {
        this.roomManager.removeRoom(room.roomName);
      } else {
        // If game is in progress, mark it as dropped
        if (room.inGame) {
          gameDropped = true;
          room.gameDropped = true;
          room.gameEndTime = new Date();
          room.dropReason = 'participant_disconnected';
          
          // CRITICAL: Notify remaining participants about game drop (원본 app.js와 동일)
          this.io.to(room.roomName).emit('gameDropped', { 
            reason: 'participant_disconnected',
            role: participant.role
          });
        }            

        // CRITICAL: Remove participant from room BEFORE notifying others
        room.participants = room.participants.filter(p => p.id !== socket.id);
        
        // CRITICAL: Notify remaining participants about updated participant list (원본 app.js와 동일)
        // This ensures all other room members know who left and can update their UI
        this.io.to(room.roomName).emit('updateParticipants', room.participants);
      }

      logger.info(`Participant ${participant.sessionId} disconnected from room ${room.roomName}`);

      return {
        success: true,
        room,
        participant,
        gameDropped
      };

    } catch (error) {
      logger.error('Error handling disconnection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle new room creation or joining (원본 app.js와 동일)
   * @param {Object} socket - Socket instance
   * @param {Object} data - Room data
   * @returns {void}
   */
  async handleCreateOrJoinRoom(socket, { sessionId, generation, variation, ktf, nm }) {
    try {
      if (!sessionId) {
        socket.emit('error', { message: 'No session ID provided' });
        return;
      }

      logger.info(`User ${sessionId} attempting to create or join room`);

      // Check if user is already in a room
      const existingRoom = this.roomManager.findRoomBySessionId(sessionId);

      if (existingRoom) {
        socket.join(existingRoom.roomName);
        socket.emit('joinedRoom', {
          roomId: existingRoom._id,
          roomName: existingRoom.roomName,
          size: existingRoom.participants.length,
          playersNeeded: this.config.game.maxParticipantsPerRoom - existingRoom.participants.length
        });
        logger.info(`User ${sessionId} joined existing room: ${existingRoom.roomName}`);
        return;
      }

      // Add to waiting queue if not already there
      if (!this.roomManager.isUserInWaitingQueue(socket.id)) {
        this.roomManager.addToWaitingQueue(socket, sessionId, { generation, variation, ktf, nm });
        logger.info(`User ${sessionId} added to waiting queue`);
        
        // Process waiting users with a delay (원본 app.js와 동일)
        setTimeout(() => {
          this.roomManager.processWaitingUsers();
        }, 1000);
      }

      // When room is full, start the game flow (원본 app.js와 동일)
      if (existingRoom?.participants.length === this.config.game.maxParticipantsPerRoom) {
        existingRoom.currentStep = 'participantsReady';
        // Start the game flow after a short delay
        setTimeout(() => {
          if (this.gameFlowManager) {
            this.gameFlowManager.advanceGameStep(existingRoom);
          }
        }, 500);
      }
    } catch (error) {
      logger.error('Error handling createOrJoinRoom:', error);
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        sessionId,
        socketId: socket.id
      });
      socket.emit('error', { message: 'Internal server error' });
    }
  }

  /**
   * Get total participants count
   * @returns {number} Total participants count
   */
  getTotalParticipants() {
    if (!this.roomManager) {
      return 0;
    }
    
    // Calculate total participants from all rooms
    return this.roomManager.rooms.reduce((total, room) => {
      return total + (room.participants?.length || 0);
    }, 0);
  }

  /**
   * Get participant statistics
   * @param {Object} room - Room object
   * @returns {Object} Participant statistics
   */
  getParticipantStats(room) {
    if (!room || !room.participants) {
      return {
        total: 0,
        withRoles: 0,
        responded: 0,
        active: 0
      };
    }

    const participants = room.participants;
    const roundIndex = room.roundIndex || 0;

    return {
      total: participants.length,
      withRoles: participants.filter(p => p.role).length,
      responded: participants.filter(p => 
        p.results?.[roundIndex]?.choice !== null
      ).length,
      active: participants.filter(p => p.id).length
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    logger.info('ParticipantManager cleanup completed');
  }
}

module.exports = ParticipantManager;
