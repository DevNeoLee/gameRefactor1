const mongoose = require('mongoose');

const { Schema } = mongoose; 

const SessionSchema = new Schema({
  generation: Number,
  nm: String,
  roomName: String,
  ipAddress: String,
  sessionStartTime: Date,
  gameJoinedTime: Date,
  sessionEndTime: Date,
  gameStarted: Boolean,
  gameCompleted: Boolean,
  gameDropped: Boolean,
  sessionCompleted: Boolean,
  timeLastUpdated: Date,
  preQuiz: [],

  role: String,
  yourDecisions: {},
  gameId:{ type: Schema.Types.ObjectId },
  roomName: String,
  mTurkNumber: String,
  lastActivity: String,
  totalEarnings: Number,
  finalTotalEarningsInDollars: Number,
  leveeInvestments: [],
  socket_id: String,
  memorySurvey: [],
  adviceSurvey: [],
  nearMissPreSurvey: [],
  nearMissPostSurvey: [],
  generalSurvey: [],
  timeTracker: {}
});

module.exports = Session = mongoose.model('session', SessionSchema);
