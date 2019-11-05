import cli from '../../../src/cli';
import gitify from '../../../src';

const argv = [];

describe('src', () => {
  describe('cli', () => {
    before(async () => {
      sinon.stub(gitify, 'start').callsFake(() => Promise.resolve());
      await cli(argv);
    });
    after(() => {
      gitify.start.restore();
    });

    it('should execute the command', () => {
      gitify.start.should.have.been.calledWithMatch({});
    });
  });
});
