import * as gitify from '../../src';
describe('src', () => {
  it('should export exec', () => {
    gitify.exec.should.be.ok;
  });
});
