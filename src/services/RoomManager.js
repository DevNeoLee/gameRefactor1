/**
 * Room Manager Service
 * Handles room creation, management, and lifecycle operations
 * Manages the waiting queue and room assignment logic
 */

const logger = require('../../utils/logger');
const Game = require('../../model/game');

class RoomManager {
  constructor(io, config) {
    this.io = io;
    this.config = config;
    this.rooms = [];
    this.isCreatingRoom = false;
    this.waitingUsers = [];
    this.gameFlowManager = null; // GameFlowManager 참조를 저장할 변수
    
    logger.info('RoomManager initialized');
  }

  // GameFlowManager 참조를 설정하는 메서드
  setGameFlowManager(gameFlowManager) {
    this.gameFlowManager = gameFlowManager;
    logger.info('GameFlowManager reference set in RoomManager');
  }

  // Check if user is already in waiting queue
  isUserInWaitingQueue(socketId) {
    return this.waitingUsers.some(user => user.socket.id === socketId);
  }

  /**
   * Add user to waiting queue
   * @param {Object} socket - Socket instance
   * @param {string} sessionId - User session ID
   * @param {Object} gameParams - Game parameters
   */
  addToWaitingQueue(socket, sessionId, gameParams = {}) {
    const user = { socket, sessionId, ...gameParams };
    
    // Check if user is already in queue
    if (!this.waitingUsers.some(u => u.socket.id === socket.id)) {
      this.waitingUsers.push(user);
      logger.info(`User ${sessionId} added to waiting queue`);
      
      // Process waiting users with delay
      setTimeout(() => {
        this.processWaitingUsers();
      }, 1000);
    }
  }

  /**
   * Process waiting users and assign them to rooms
   */
  async processWaitingUsers() {
    if (this.isCreatingRoom || this.waitingUsers.length === 0) {
      return;
    }

    const user = this.waitingUsers[0];
    let room = this.findAvailableRoom(user.generation, user.variation, user.ktf, user.nm);
    
    if (!room) {
      // Create new room if none available
      room = await this.createNewRoom(user.generation, user.variation, user.ktf, user.nm);
      if (!room) {
        logger.error('Failed to create new room');
        return;
      }
      this.rooms.push(room);
    }

    // Remove user from waiting queue
    this.waitingUsers.shift();
    
    // Add participant to room
    const newParticipant = this.createParticipant(user);
    room.participants.push(newParticipant);
    
    // Join socket room
    user.socket.join(room.roomName);
    
    // Notify user they joined
    const playersNeeded = this.config.game.maxParticipantsPerRoom - room.participants.length;
    user.socket.emit('joinedRoom', {
      roomId: room._id,
      roomName: room.roomName,
      size: room.participants.length,
      playersNeeded,
      gameFlows: room.gameFlows
    });

    // Notify all users in room about new participant
    this.io.to(room.roomName).emit('updateParticipants', room.participants);

    // If room is full, call the original assignRoles function (following original app.js exactly)
    if (room.participants.length === this.config.game.maxParticipantsPerRoom) {
      logger.info(`Room ${room.roomName} is full with ${room.participants.length} participants. Calling assignRoles...`);
      
      // Call assignRoles directly (following original app.js exactly)
      this.assignRoles(room);
    }

    // Process next user if any
    if (this.waitingUsers.length > 0) {
      setTimeout(() => {
        this.processWaitingUsers();
      }, 500);
    }
  }

  /**
   * Find available room for user
   * @param {number} generation - Game generation
   * @param {string} variation - Game variation
   * @param {number} ktf - KTF parameter
   * @param {string} nm - Near miss parameter
   * @returns {Object|null} Available room or null
   */
  findAvailableRoom(generation, variation, ktf, nm) {
    if (nm) {
      return this.rooms.find(room => 
        room.participants?.length < this.config.game.maxParticipantsPerRoom && 
        !room.inGame &&
        String(room.nm) === String(nm)
      );
    }
    
    return this.rooms.find(room => 
      room.participants?.length < this.config.game.maxParticipantsPerRoom && 
      !room.inGame &&
      Number(room.generation) === Number(generation) &&
      String(room.variation) === String(variation) &&
      Number(room.ktf) === Number(ktf)
    );
  }

  /**
   * Create new room
   * @param {number} generation - Game generation
   * @param {string} variation - Game variation
   * @param {number} ktf - KTF parameter
   * @param {string} nm - Near miss parameter
   * @returns {Object|null} Created room or null
   */
  async createNewRoom(generation, variation, ktf, nm) {
    if (this.isCreatingRoom) {
      return null;
    }
    
    this.isCreatingRoom = true;
    
    try {
      const gameFlowsIndex = this.getGameFlowsIndex(generation, ktf, nm);
      const selectedGameFlows = this.config.game.gameFlows[gameFlowsIndex];
      
      const newRoom = {
        roomName: "",
        gameFlows: selectedGameFlows,
        gameFlowsIndex,
        isChosenFirstGeneration: false,
        currentStepIndex: 0,
        currentStep: 'waitingRoom',
        stepTimers: {
          participantsReady: 5000,
          roleSelection: 5000,
          transitionNotification1: 10000,
          transitionNotification2: 10000,
          transitionNotification3: 10000,
          transitionNotification4: 10000,
          groupChat: 60000,
          historicText: 30000,
          nearMissNotification: 30000,
        },
        advice: [],
        chatHistory: [],
        gameDropped: false,
        gameCreatedTime: null,
        gameStartTime: null,
        gameEndTime: null,
        inGame: false,
        gameStarted: false,
        gameCompleted: false,
        participants: [],
        gameResults: [],
        roundTimer: null,
        waitingRoomTimer: null,
        resultTimer: null,
        gameStopTimer: null,
        roundDuration: 60,
        resultDuration: 20,
        gameStopDuration: 40,
        roundIndex: 0,
        rounds: [...this.config.game.rounds],
        currentRound: this.config.game.rounds[0],
        totalRounds: 10,
        roles: [...this.config.game.roles],
        waitingRoomTime: 300,
        riverVariability: "low",
        stockInvested: [],
        leveeStocks: [],
        leveeHeights: [],
        waterHeights: [],
        floodLosses: [],
        previousLeveeStock: {0: 75},
        isFlooded: false,
        now: 12,
        generation: Number(generation),
        variation: String(variation),
        ktf: Number(ktf),
        nm: String(nm),
      };

      const createdRoom = await this.createGameToDB(newRoom);
      if (!createdRoom) {
        return null;
      }

      // Create room name
      createdRoom.roomName = `${createdRoom._id}_${generation}_${variation}_${ktf}_${this.rooms.length}`;
      
      // Update room name in database
      const updatedGame = await this.updateGameToDB(createdRoom);
      if (!updatedGame) {
        return null;
      }

      logger.info(`New room created: ${updatedGame.roomName}`);
      return updatedGame;
      
    } catch (error) {
      logger.error('Error creating new room:', error);
      return null;
    } finally {
      this.isCreatingRoom = false;
    }
  }

  /**
   * Create participant object
   * @param {Object} user - User object
   * @returns {Object} Participant object
   */
  createParticipant(user) {
    return {
      id: user.socket.id,
      sessionId: user.sessionId,
      role: null,
      results: Array(10).fill(null).map((ele, index) => ({ 
        roundIndex: index, 
        choice: null, 
        totalWater: 0, 
        totalScore: 0, 
        totalEarnings: 0
      })),
      preQuiz: [],
      memorySurvey: [],
      adviceSurvey: [],
      generalSurvey: [],
      nearMissPostSurvey: [],
      nearMissPreSurvey: [],
      mTurkcode: this.getMturkcode(user.socket.id),
      totalEarnings: 0,
      finalTotalEarningsInDollars: 0,
    };
  }

  /**
   * Get game flows index based on parameters
   * @param {number} generation - Game generation
   * @param {number} ktf - KTF parameter
   * @param {string} nm - Near miss parameter
   * @returns {number} Game flows index
   */
  getGameFlowsIndex(generation, ktf, nm) {
    if (nm === 'base') {
      return 5;
    } else if (['HLRN', 'HLVN', 'LLRN', 'LLVN'].includes(nm)) {
      return 6;
    } else if (generation === 1) {
      return 1;
    } else if ((generation === 2 && ktf === 1) || (generation === 3 && ktf === 1)) {
      return 2;
    } else if ((generation === 2 && ktf === 2) || (generation === 3 && ktf === 2)) {
      return 3;
    } else if (generation === 4) {
      return 4;
    }
    return 0;
  }

  /**
   * Create game in database
   * @param {Object} data - Game data
   * @returns {Object|null} Created game or null
   */
  async createGameToDB(data) {
    try {
      const newGame = new Game({
        ...data,
        gameCreatedTime: new Date(),
      });
      
      const createdGame = await newGame.save();
      return createdGame;
    } catch (err) {
      logger.error('Error creating game in DB:', err);
      return null;
    }
  }

  /**
   * Update game in database
   * @param {Object} room - Room object
   * @returns {Object|null} Updated game or null
   */
  async updateGameToDB(room) {
    try {
      const updatedGame = await Game.findByIdAndUpdate(room._id, room, { new: true });
      if (!updatedGame) {
        logger.error('Game not found for update');
        return null;
      }
      return updatedGame;
    } catch (err) {
      logger.error('Error updating game in DB:', err);
      return null;
    }
  }

  /**
   * Get MTurk code for participant
   * @param {string} socketId - Socket ID
   * @returns {string} MTurk code
   */
  getMturkcode(socketId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}_${socketId}_b`;
  }

  /**
   * Handle room creation or joining
   * @param {Object} socket - Socket instance
   * @param {Object} params - Room parameters
   * @returns {Object} Result object
   */
  async handleRoomCreation(socket, { sessionId, generation, variation, ktf, nm }) {
    // Check if user is already in a room
    const existingRoom = this.rooms.find(room => 
      room.participants.some(p => p.sessionId === sessionId)
    );

    if (existingRoom) {
      socket.join(existingRoom.roomName);
      const playersNeeded = this.config.game.maxParticipantsPerRoom - existingRoom.participants.length;
      
      return {
        success: true,
        room: existingRoom,
        data: {
          roomId: existingRoom._id,
          roomName: existingRoom.roomName,
          size: existingRoom.participants.length,
          playersNeeded
        },
        participants: existingRoom.participants
      };
    }

    // Add to waiting queue
    this.addToWaitingQueue(socket, sessionId, { generation, variation, ktf, nm });
    
    return {
      success: true,
      room: null,
      data: { message: 'Added to waiting queue' },
      participants: []
    };
  }

  /**
   * Find room by participant ID
   * @param {string} participantId - Participant ID
   * @returns {Object|null} Room or null
   */
  findRoomByParticipantId(participantId) {
    return this.rooms.find(room => 
      room.participants?.some(participant => participant.id === participantId)
    );
  }

  /**
   * Find room by session ID
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Room or null
   */
  findRoomBySessionId(sessionId) {
    return this.rooms.find(room => 
      room.participants?.some(p => p.sessionId === sessionId)
    );
  }

  /**
   * Find room by name
   * @param {string} roomName - Room name
   * @returns {Object|null} Room or null
   */
  findRoomByName(roomName) {
    return this.rooms.find(room => room.roomName === roomName);
  }

  /**
   * Find room by socket ID
   * @param {string} socketId - Socket ID
   * @returns {Object|null} Room or null
   */
  findRoomBySocketId(socketId) {
    return this.rooms.find(room => 
      room.participants?.some(p => p.id === socketId)
    );
  }

  /**
   * Remove room
   * @param {string} roomName - Room name
   */
  removeRoom(roomName) {
    this.rooms = this.rooms.filter(room => room.roomName !== roomName);
    logger.info(`Room removed: ${roomName}`);
  }

  /**
   * Get total rooms count
   * @returns {number} Total rooms
   */
  getTotalRooms() {
    return this.rooms.length;
  }

  /**
   * Get active rooms count
   * @returns {number} Active rooms
   */
  getActiveRooms() {
    return this.rooms.filter(room => room.inGame).length;
  }

  /**
   * Get waiting users count
   * @returns {number} Waiting users count
   */
  getWaitingUsersCount() {
    return this.waitingUsers.length;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.rooms = [];
    this.waitingUsers = [];
    this.isCreatingRoom = false;
    logger.info('RoomManager cleanup completed');
  }

  /**
   * Get random role from available roles (copied exactly from original app.js)
   * @param {Object} room - Room object
   * @returns {string} Role name
   */
  getRandomRole(room) {
    const role = room.roles[Math.floor(Math.random() * room.roles.length)];
    let index = room.roles.indexOf(role);
    room?.roles?.splice(index, 1);
    return role;
  }

  /**
   * Assign roles to participants (copied exactly from original app.js)
   * @param {Object} room - Room object
   * @returns {Object} Room object
   */
  assignRoles(room) {
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
    
    // Same as original app.js: proceed to next step immediately after role assignment
    if (this.gameFlowManager) {
      logger.info(`Calling advanceGameStep directly from assignRoles for room: ${room.roomName}`);
      this.gameFlowManager.advanceGameStep(room);
    } else {
      logger.error('GameFlowManager not available in RoomManager');
    }
    
    // Database update is handled asynchronously
    this.updateGameToDB(room).then(() => {
      logger.info(`Room ${room.roomName} updated in database after role assignment`);
    }).catch(err => {
      logger.error(`Error updating room in database: ${err}`);
    });
    
    logger.info(`Roles assigned for room: ${room.roomName}`, rolesObject);
    
    return room;
  }
}

module.exports = RoomManager;
