import path from 'path';
import {
  createLogger,
  transports,
  format,
} from 'winston';
import {
  LOG_FILE,
  DEFAULT_LOG_LEVEL,
} from './constants';

// istanbul ignore next
const consoleFormat = format.printf(({
  level,
  message,
}) => {
  if (typeof message === 'object') {
    message = JSON.stringify(message, null, 2);
  }
  return `${level}: ${message}`;
});

const consoleTransport = new transports.Console({
  format: format.combine(
      format.colorize(),
      consoleFormat,
  ),
});

const logger = createLogger({
  level: DEFAULT_LOG_LEVEL,
  transports: [
    consoleTransport,
  ],
});

// istanbul ignore next
function getLogger(file) {
  return logger.child({
    file: path.relative(__dirname, file),
  });
}

// istanbul ignore next
function setLogLevel(logLevel) {
  logger.level = logLevel;
}

// istanbul ignore next
function initFileLogger(workingDir) {
  logger.add(new transports.File({
    filename: path.join(workingDir, LOG_FILE),
    format: format.combine(
        format.timestamp(),
        format.json(),
    ),
  }));
}

module.exports = {
  getLogger,
  setLogLevel,
  initFileLogger,
};
