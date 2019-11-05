import * as gitify from '../../src';
describe('src', () => {
  it('should export start', () => {
    gitify.start.should.be.ok;
  });
});
