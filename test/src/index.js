import * as gitify from '../../src';
describe('gitify', () => {
  it('should export exec', () => {
    gitify.exec.should.be.ok;
  });
});
