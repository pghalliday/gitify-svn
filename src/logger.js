import mkdirp from 'mkdirp';
import path from 'path';
import {
  promisify,
} from 'util';
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
function overrideHelpers(logger) {
  Object.keys(logger.levels).forEach((level) => {
    const original = logger[level].bind(logger);
    logger[level] = (...args) => {
      if (args.length === 1) {
        // We do this so that we can pass in
        // a single argument that is an object
        // even if that object contains a message field
        return original({
          message: args[0],
        });
      } else {
        return original(...args);
      }
    };
  });
  return logger;
}

// istanbul ignore next
function getLogger(file) {
  return overrideHelpers(logger.child({
    file: path.relative(__dirname, file),
  }));
}

// istanbul ignore next
function setLogLevel(logLevel) {
  logger.level = logLevel;
}

// istanbul ignore next
async function initFileLogger(workingDir) {
  logger.debug(`Creating working directory: ${workingDir}`);
  await promisify(mkdirp)(workingDir);
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
