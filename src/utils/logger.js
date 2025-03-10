const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Format date for filename
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Format date for log entry
const formatDateTime = (date) => {
  return date.toISOString().replace('T', ' ').split('.')[0];
};

// Get log file name based on level and type
const getLogFileName = (level, type = 'app') => {
  const date = formatDate(new Date());
  return path.join(logsDir, `${type}-${level}-${date}.log`);
};

// Write to log file
const writeToLog = (level, message, data = null, type = 'app') => {
  const timestamp = formatDateTime(new Date());
  const logFile = getLogFileName(level, type);
  let logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  if (data) {
    logEntry += '\nData: ' + JSON.stringify(data, null, 2);
  }
  
  logEntry += '\n\n';
  
  fs.appendFileSync(logFile, logEntry);
};

// Log levels
const logger = {
  info: (message, data = null, type = 'app') => {
    writeToLog('info', message, data, type);
  },
  warn: (message, data = null, type = 'app') => {
    writeToLog('warn', message, data, type);
  },
  error: (message, data = null, type = 'app') => {
    writeToLog('error', message, data, type);
  },
  debug: (message, data = null, type = 'app') => {
    // Debug is disabled by default
    // writeToLog('debug', message, data, type);
  }
};

module.exports = logger; 