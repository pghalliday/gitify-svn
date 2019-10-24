import path from 'path';
import {
  createLogger,
  transports,
  format,
} from 'winston';
import {
  LOG_FILE,
} from '../../constants';

const consoleTransport = new transports.Console({
  format: format.combine(
      format.colorize(),
      format.label({label: 'logger'}),
      format.simple(),
  ),
});

export const logger = createLogger({
  transports: [
    consoleTransport,
  ],
});

export const reporter = createLogger({
  transports: [
    new transports.Console({
      level: 'silly',
      format: format.combine(
          format.colorize(),
          format.simple(),
      ),
    }),
  ],
});

export function setConsoleDebugLevel(debugLevel) {
  consoleTransport.level = debugLevel;
}

export function initFileLogger(workingDir) {
  logger.add(new transports.File({
    level: 'silly',
    filename: path.join(workingDir, LOG_FILE),
    format: format.combine(
        format.timestamp(),
        format.json(),
    ),
  }));
}
