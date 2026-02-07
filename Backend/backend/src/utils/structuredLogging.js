/**
 * Structured Logging Helpers for Google Cloud Logging Integration
 * Provides consistent structured log formats for key events across the application
 */

const logger = require('./logger');

/**
 * Log user authentication events
 * @param {string} action - 'LOGIN', 'LOGOUT', 'SIGNUP', 'LOGIN_FAILED'
 * @param {string} userId - User ID or email
 * @param {object} details - Additional context (device, ip, etc.)
 */
const logAuthEvent = (action, userId, details = {}) => {
  logger.logAuth(action, userId, {
    ...details,
    timestamp: new Date().toISOString(),
    labels: {
      event_type: 'AUTHENTICATION',
      action: action
    }
  });
};

/**
 * Log payment-related events
 * @param {string} action - 'INITIATED', 'COMPLETED', 'FAILED', 'REFUNDED'
 * @param {object} paymentData - Payment details (amount, phone, referralId, etc.)
 */
const logPaymentEvent = (action, paymentData = {}) => {
  logger.logPayment(action, {
    ...paymentData,
    timestamp: new Date().toISOString(),
    labels: {
      event_type: 'PAYMENT',
      action: action
    }
  });
};

/**
 * Log STK Push initiation
 * @param {string} phoneNumber - Phone number for the payment
 * @param {number} amount - Amount in KES
 * @param {string} referralId - Referral ID
 * @param {string} status - 'INITIATED', 'SENT', 'TIMEOUT'
 */
const logStkPush = (phoneNumber, amount, referralId, status = 'INITIATED') => {
  logPaymentEvent('STK_PUSH', {
    phone: phoneNumber.replace(/\d(?=\d{2})/g, '*'),  // Mask phone number
    amount: amount,
    referralId: referralId,
    status: status
  });
};

/**
 * Log payment callback received
 * @param {object} callbackData - Callback data from M-Pesa
 */
const logPaymentCallback = (callbackData) => {
  const { TransactionCode, PhoneNumber, Amount, ResultCode } = callbackData;
  logPaymentEvent('CALLBACK_RECEIVED', {
    transactionCode: TransactionCode,
    phone: PhoneNumber.replace(/\d(?=\d{2})/g, '*'),  // Mask phone number
    amount: Amount,
    resultCode: ResultCode,
    success: ResultCode === '0'
  });
};

/**
 * Log user action/activity
 * @param {string} action - Action description
 * @param {string} userId - User ID
 * @param {object} details - Additional details
 */
const logUserActivity = (action, userId, details = {}) => {
  logger.log('info', {
    message: `USER_ACTIVITY_${action}`,
    userId: userId,
    ...details,
    timestamp: new Date().toISOString(),
    labels: {
      event_type: 'USER_ACTIVITY',
      action: action
    }
  });
};

/**
 * Log API errors with context
 * @param {string} errorName - Error identifier
 * @param {Error} error - Error object
 * @param {object} context - Context where error occurred
 */
const logError = (errorName, error, context = {}) => {
  logger.logError(errorName, error, {
    ...context,
    timestamp: new Date().toISOString(),
    labels: {
      event_type: 'ERROR',
      error_name: errorName,
      severity: context.severity || 'ERROR'
    }
  });
};

/**
 * Log API request/response
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 */
const logApiCall = (endpoint, method, statusCode, duration, userId = null) => {
  const logLevel = statusCode >= 400 ? 'warn' : 'info';
  logger.log(logLevel, {
    message: `API_CALL_${method}`,
    endpoint: endpoint,
    method: method,
    statusCode: statusCode,
    duration: duration,
    userId: userId,
    timestamp: new Date().toISOString(),
    labels: {
      event_type: 'API_CALL',
      method: method,
      status: statusCode >= 400 ? 'FAILED' : 'SUCCESS'
    }
  });
};

/**
 * Log database operations
 * @param {string} operation - 'INSERT', 'UPDATE', 'DELETE', 'QUERY'
 * @param {string} collection - Collection/table name
 * @param {number} duration - Operation duration in ms
 * @param {boolean} success - Whether operation succeeded
 */
const logDatabaseOperation = (operation, collection, duration, success = true) => {
  logger.log(success ? 'info' : 'warn', {
    message: `DB_${operation}_${collection}`,
    operation: operation,
    collection: collection,
    duration: duration,
    success: success,
    timestamp: new Date().toISOString(),
    labels: {
      event_type: 'DATABASE',
      operation: operation,
      collection: collection
    }
  });
};

/**
 * Log external service calls (M-Pesa, etc.)
 * @param {string} service - Service name
 * @param {string} endpoint - Endpoint called
 * @param {number} statusCode - Response status
 * @param {number} duration - Call duration in ms
 */
const logExternalServiceCall = (service, endpoint, statusCode, duration) => {
  const logLevel = statusCode >= 400 ? 'warn' : 'info';
  logger.log(logLevel, {
    message: `EXTERNAL_SERVICE_${service}`,
    service: service,
    endpoint: endpoint,
    statusCode: statusCode,
    duration: duration,
    timestamp: new Date().toISOString(),
    labels: {
      event_type: 'EXTERNAL_SERVICE',
      service: service,
      status: statusCode >= 400 ? 'FAILED' : 'SUCCESS'
    }
  });
};

module.exports = {
  logAuthEvent,
  logPaymentEvent,
  logStkPush,
  logPaymentCallback,
  logUserActivity,
  logError,
  logApiCall,
  logDatabaseOperation,
  logExternalServiceCall
};
