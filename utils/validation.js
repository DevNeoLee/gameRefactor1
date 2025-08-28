/**
 * 입력 검증 미들웨어 및 유틸리티 함수
 * 게임 애플리케이션의 보안을 강화하기 위한 입력 검증 로직
 */

const { StatusCodes } = require('http-status-codes');
const log = require('./logger'); // logger import 추가

/**
 * 기본 입력 검증 미들웨어
 * @param {Object} schema - Joi 스키마 또는 검증 함수
 * @returns {Function} Express 미들웨어 함수
 */
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      // 요청 본문, 쿼리, 파라미터 검증
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params
      };

      // 스키마가 함수인 경우 직접 검증
      if (typeof schema === 'function') {
        const validationResult = schema(dataToValidate);
        if (!validationResult.isValid) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: '입력 데이터가 올바르지 않습니다.',
            errors: validationResult.errors
          });
        }
      }

      next();
    } catch (error) {
      log.error('입력 검증 중 오류 발생:', { error: error.message });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '서버 오류가 발생했습니다.'
      });
    }
  };
};

/**
 * 게임 생성 입력 검증
 * @param {Object} data - 검증할 데이터
 * @returns {Object} 검증 결과
 */
const validateGameCreation = (data) => {
  const errors = [];
  const { generation, variation, ktf, nm } = data.body;

  // 필수 필드 검증
  if (!generation || !variation || !ktf) {
    errors.push('generation, variation, ktf는 필수 필드입니다.');
  }

  // 타입 검증
  if (generation && typeof generation !== 'number') {
    errors.push('generation은 숫자여야 합니다.');
  }

  if (ktf && typeof ktf !== 'number') {
    errors.push('ktf는 숫자여야 합니다.');
  }

  if (variation && typeof variation !== 'string') {
    errors.push('variation은 문자열이어야 합니다.');
  }

  // 값 범위 검증
  if (generation && (generation < 1 || generation > 6)) {
    errors.push('generation은 1-6 사이의 값이어야 합니다.');
  }

  if (ktf && (ktf < 1 || ktf > 2)) {
    errors.push('ktf는 1-2 사이의 값이어야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 게임 업데이트 입력 검증
 * @param {Object} data - 검증할 데이터
 * @returns {Object} 검증 결과
 */
const validateGameUpdate = (data) => {
  const errors = [];
  const { _id, ...updateData } = data.body;

  if (!_id) {
    errors.push('게임 ID는 필수입니다.');
  }

  // MongoDB ObjectId 형식 검증 (간단한 검증)
  if (_id && typeof _id !== 'string') {
    errors.push('게임 ID는 문자열이어야 합니다.');
  }

  if (_id && _id.length !== 24) {
    errors.push('게임 ID 형식이 올바르지 않습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 세션 조회 입력 검증
 * @param {Object} data - 검증할 데이터
 * @returns {Object} 검증 결과
 */
const validateSessionQuery = (data) => {
  const errors = [];
  const { year, month, day } = data.query;

  if (!year || !month || !day) {
    errors.push('year, month, day 파라미터가 모두 필요합니다.');
  }

  // 날짜 값 검증
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
    errors.push('year는 2020-2030 사이의 유효한 연도여야 합니다.');
  }

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    errors.push('month는 1-12 사이의 유효한 월이어야 합니다.');
  }

  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
    errors.push('day는 1-31 사이의 유효한 일이어야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * XSS 방지를 위한 입력 정제
 * @param {string} input - 정제할 입력 문자열
 * @returns {string} 정제된 문자열
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * 요청 본문 정제 미들웨어
 */
const sanitizeRequestBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  validateInput,
  validateGameCreation,
  validateGameUpdate,
  validateSessionQuery,
  sanitizeInput,
  sanitizeRequestBody
};
