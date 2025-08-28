/**
 * 환경별 설정 관리
 * 개발, 테스트, 프로덕션 환경에 따른 설정값들을 관리
 */

const path = require('path');

// 기본 환경 설정
const defaultConfig = {
  // 서버 설정
  port: process.env.PORT || 5000,
  host: process.env.HOST || 'localhost',
  
  // 데이터베이스 설정
  mongoUri: process.env.MONGO_URI,
  
  // CORS 설정
  cors: {
    development: {
      origin: ['http://localhost:3000', 'http://localhost:5000'],
      credentials: true
    },
    production: {
      origin: [process.env.ALLOWED_ORIGIN || 'https://yourdomain.com'],
      credentials: true
    }
  },
  
  // 보안 설정
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  },
  
  // 로깅 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true',
      path: process.env.LOG_FILE_PATH || path.join(__dirname, '../logs'),
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d'
    }
  },
  
  // 게임 설정
  game: {
    maxParticipantsPerRoom: 5,
    maxRooms: 100,
    roundDuration: 300000, // 5분
    waitingRoomTimeout: 60000, // 1분
    rounds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    roles: ['Villager1', 'Villager2', 'Villager3', 'Villager4', 'Villager5'],
    gameFlows: {
      1: ['waitingRoom', 'participantsReady', 'adviceSurvey'],
      2: ['waitingRoom', 'rounds'],
      3: ['waitingRoom', 'adviceSurvey'],
      4: ['waitingRoom', 'participantsReady', 'memorySurvey', 'rounds'],
      5: ['waitingRoom', 'participantsReady', 'roleSelection', 'transitionNotification3', 'rounds', 'transitionNotification4', 'nearMissPostSurvey'],
      6: ['waitingRoom', 'participantsReady', 'roleSelection', 'transitionNotification1', 'nearMissNotification', 'transitionNotification2', 'nearMissPreSurvey', 'transitionNotification3', 'rounds', 'transitionNotification4', 'nearMissPostSurvey']
    }
  },
  
  // Socket.IO 설정
  socket: {
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 20000,
    allowEIO3: true
  }
};

// 환경별 설정
const environmentConfigs = {
  development: {
    ...defaultConfig,
    cors: defaultConfig.cors.development,
    logging: {
      ...defaultConfig.logging,
      level: 'debug'
    }
  },
  
  test: {
    ...defaultConfig,
    port: 5001,
    mongoUri: process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/gameRefactor_test',
    logging: {
      ...defaultConfig.logging,
      level: 'warn'
    }
  },
  
  production: {
    ...defaultConfig,
    cors: defaultConfig.cors.production,
    logging: {
      ...defaultConfig.logging,
      level: 'info',
      file: {
        ...defaultConfig.logging.file,
        enabled: true
      }
    },
    security: {
      ...defaultConfig.security,
      helmet: {
        ...defaultConfig.security.helmet,
        hsts: {
          ...defaultConfig.security.helmet.hsts,
          maxAge: 31536000
        }
      }
    }
  }
};

// 현재 환경 가져오기
const getCurrentEnvironment = () => {
  return process.env.NODE_ENV || 'development';
};

// 환경별 설정 가져오기
const getConfig = () => {
  const env = getCurrentEnvironment();
  return environmentConfigs[env] || environmentConfigs.development;
};

// 특정 설정값 가져오기
const getConfigValue = (key) => {
  const config = getConfig();
  return key.split('.').reduce((obj, k) => obj && obj[k], config);
};

module.exports = {
  getConfig,
  getConfigValue,
  getCurrentEnvironment,
  defaultConfig,
  environmentConfigs
};
