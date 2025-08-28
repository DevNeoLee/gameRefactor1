/**
 * RoomManager Service Tests
 * Demonstrates how to test the new modular architecture
 */

const RoomManager = require('../RoomManager');

// Mock dependencies
const mockIO = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

const mockConfig = {
  game: {
    maxParticipantsPerRoom: 5,
    rounds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    roles: ['Villager1', 'Villager2', 'Villager3', 'Villager4', 'Villager5'],
    gameFlows: {
      1: ['waitingRoom', 'participantsReady', 'adviceSurvey'],
      2: ['waitingRoom', 'rounds'],
    }
  }
};

// Mock Game model
jest.mock('../../../model/game', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({ _id: 'mock-game-id' })
  }));
});

describe('RoomManager', () => {
  let roomManager;

  beforeEach(() => {
    roomManager = new RoomManager(mockIO, mockConfig);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with empty rooms and waiting users', () => {
      expect(roomManager.rooms).toEqual([]);
      expect(roomManager.waitingUsers).toEqual([]);
      expect(roomManager.isCreatingRoom).toBe(false);
    });
  });

  describe('addToWaitingQueue', () => {
    it('should add user to waiting queue', () => {
      const mockSocket = { id: 'socket-1' };
      const sessionId = 'session-1';
      
      roomManager.addToWaitingQueue(mockSocket, sessionId);
      
      expect(roomManager.waitingUsers).toHaveLength(1);
      expect(roomManager.waitingUsers[0]).toEqual({
        socket: mockSocket,
        sessionId,
      });
    });

    it('should not add duplicate users to waiting queue', () => {
      const mockSocket = { id: 'socket-1' };
      const sessionId = 'session-1';
      
      roomManager.addToWaitingQueue(mockSocket, sessionId);
      roomManager.addToWaitingQueue(mockSocket, sessionId);
      
      expect(roomManager.waitingUsers).toHaveLength(1);
    });
  });

  describe('createParticipant', () => {
    it('should create participant with correct structure', () => {
      const mockUser = {
        socket: { id: 'socket-1' },
        sessionId: 'session-1'
      };
      
      const participant = roomManager.createParticipant(mockUser);
      
      expect(participant).toHaveProperty('id', 'socket-1');
      expect(participant).toHaveProperty('sessionId', 'session-1');
      expect(participant).toHaveProperty('role', null);
      expect(participant.results).toHaveLength(10);
      expect(participant.mTurkcode).toMatch(/^\d{8}_socket-1_b$/);
    });
  });

  describe('getGameFlowsIndex', () => {
    it('should return correct index for base nm', () => {
      const result = roomManager.getGameFlowsIndex(1, 1, 'base');
      expect(result).toBe(5);
    });

    it('should return correct index for HLRN nm', () => {
      const result = roomManager.getGameFlowsIndex(1, 1, 'HLRN');
      expect(result).toBe(6);
    });

    it('should return correct index for generation 1', () => {
      const result = roomManager.getGameFlowsIndex(1, 1, '');
      expect(result).toBe(1);
    });

    it('should return 0 for unknown parameters', () => {
      const result = roomManager.getGameFlowsIndex(999, 999, 'unknown');
      expect(result).toBe(0);
    });
  });

  describe('findAvailableRoom', () => {
    it('should find available room for nm parameter', () => {
      const mockRoom = {
        participants: [{}, {}],
        inGame: false,
        nm: 'HLRN'
      };
      roomManager.rooms.push(mockRoom);
      
      const result = roomManager.findAvailableRoom(1, 'A', 1, 'HLRN');
      expect(result).toBe(mockRoom);
    });

    it('should find available room for generation/variation/ktf parameters', () => {
      const mockRoom = {
        participants: [{}, {}],
        inGame: false,
        generation: 1,
        variation: 'A',
        ktf: 1
      };
      roomManager.rooms.push(mockRoom);
      
      const result = roomManager.findAvailableRoom(1, 'A', 1, '');
      expect(result).toBe(mockRoom);
    });

    it('should return null when no available room found', () => {
      const result = roomManager.findAvailableRoom(1, 'A', 1, '');
      expect(result).toBeNull();
    });
  });

  describe('getTotalRooms', () => {
    it('should return correct total rooms count', () => {
      expect(roomManager.getTotalRooms()).toBe(0);
      
      roomManager.rooms.push({}, {});
      expect(roomManager.getTotalRooms()).toBe(2);
    });
  });

  describe('getActiveRooms', () => {
    it('should return correct active rooms count', () => {
      roomManager.rooms.push(
        { inGame: true },
        { inGame: false },
        { inGame: true }
      );
      
      expect(roomManager.getActiveRooms()).toBe(2);
    });
  });

  describe('getWaitingUsersCount', () => {
    it('should return correct waiting users count', () => {
      expect(roomManager.getWaitingUsersCount()).toBe(0);
      
      roomManager.waitingUsers.push({}, {});
      expect(roomManager.getWaitingUsersCount()).toBe(2);
    });
  });

  describe('cleanup', () => {
    it('should reset all state variables', () => {
      roomManager.rooms.push({});
      roomManager.waitingUsers.push({});
      roomManager.isCreatingRoom = true;
      
      roomManager.cleanup();
      
      expect(roomManager.rooms).toEqual([]);
      expect(roomManager.waitingUsers).toEqual([]);
      expect(roomManager.isCreatingRoom).toBe(false);
    });
  });
});
