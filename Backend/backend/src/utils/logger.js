const winston = require('winston');
const { Logging } = require('@google-cloud/logging-winston');

// Initialize Google Cloud Logging if in production and credentials are available
const useGoogleCloud = process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_PROJECT;

const transports = [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' })
];

// Add Google Cloud Logging transport in production
if (useGoogleCloud) {
  const gcLogging = new Logging({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
  });
  const cloudLoggingTransport = gcLogging.express.makeMiddleware();
  transports.push(gcLogging.log('uzimacare-api'));
}

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'uzimacare-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports
});

// Structured logging helper functions
logger.logEvent = function(eventName, data = {}, severity = 'DEFAULT') {
  this.log({
    level: severity === 'ERROR' ? 'error' : 'info',
    message: eventName,
    event: eventName,
    severity,
    ...data,
    timestamp: new Date().toISOString()
  });
};

logger.logAuth = function(action, userId, details = {}) {
  this.logEvent(`AUTH_${action}`, {
    action,
    userId,
    ...details
  }, 'INFO');
};

logger.logPayment = function(action, paymentData = {}) {
  this.logEvent(`PAYMENT_${action}`, {
    action,
    ...paymentData
  }, 'INFO');
};

logger.logError = function(errorName, error, context = {}) {
  this.logEvent(`ERROR_${errorName}`, {
    error: error.message,
    stack: error.stack,
    ...context
  }, 'ERROR');
};

module.exports = logger;
