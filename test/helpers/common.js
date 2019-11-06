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
import loggerFactory from '../../src/logger';
sinon.stub(loggerFactory, 'logToFile');
sinon.stub(loggerFactory, 'create').returns({
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
});
