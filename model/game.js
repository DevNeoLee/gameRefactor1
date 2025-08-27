const mongoose = require('mongoose');

const { Schema } = mongoose;

const GameSchema = new Schema({
  roomName: String,
  generation: Number,
  isChosenFirstGeneration: Boolean,
  gameFlows: [],
  gameFlowsIndex: Number,
  currentStepIndex: Number,
  currentStep: String,
  stepTimers: {},
  variation: String,
  advice: [],
  chatHistory: [
    {
      message: String,
      sentTime: Date,
      sender: String,
      socketId: String,
      direction: String,
      position: String,
    }
  ],
  gameCompleted: Boolean,
  gameCreatedTime: Date,
  gameStartTime: Date,
  gameEndTime: Date,
  gameStarted: Boolean,
  gameCompleted: Boolean,
  gameDropped: Boolean,
  inGame: Boolean,
  participants: [],
  gameResults: [],
  gameStopDuration: Number,
  roundDuration: Number,  
  resultDuration: Number, 
  roundIndex: Number,
  rounds: [],
  currentRound: String,
  totalRounds: Number,
  stockInvested: [],
  leveeStocks: [],
  leveeHeights: [],
  waterHeights: [],
  floodLosses: [],
  roles: [],
  waitingRoomTime: Number,
  previousLeveeStock: {},
  riverVariability: String,
  now: Number,

  participantDropped: {},
  participantNotresponded: {},

  generation: Number,
  variation: String,
  ktf: Number,
  nm: String,
});

module.exports = Game = mongoose.model('Game', GameSchema);
