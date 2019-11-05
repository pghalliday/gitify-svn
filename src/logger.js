import path from 'path';
import workingDirectory from './gitify/working-directory';
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

// istanbul ignore next
const consoleTransport = new transports.Console({
  format: format.combine(
      format.colorize(),
      consoleFormat,
  ),
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
export class LoggerFactory {
  constructor() {
    this.logger = createLogger({
      level: DEFAULT_LOG_LEVEL,
      transports: [
        consoleTransport,
      ],
    });
  }

  init() {
    this.logger.add(new transports.File({
      filename: path.join(workingDirectory.path, LOG_FILE),
      format: format.combine(
          format.timestamp(),
          format.json(),
      ),
    }));
  }

  create(file) {
    return overrideHelpers(this.logger.child({
      file: path.relative(__dirname, file),
    }));
  }

  get level() {
    return this.logger.level;
  }

  set level(level) {
    this.logger.level = level;
  }
}

const loggerFactory = new LoggerFactory();
export default loggerFactory;
