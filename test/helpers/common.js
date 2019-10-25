// assertions
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
global.expect = chai.expect;
global.sinon = sinon;

// override the logger
import logger from '../../src/logger';
logger.initFileLogger = () => {};
logger.getLogger = () => ({
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
});
logger.setLogLevel = () => {};
