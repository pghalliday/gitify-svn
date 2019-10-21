import cli from '../../../src/cli';
import gitify from '../../../src';

const argv = [];

describe('src', () => {
  describe('cli', () => {
    before(async () => {
      sinon.stub(gitify, 'exec').callsFake(() => Promise.resolve());
      await cli(argv);
    });
    after(() => {
      gitify.exec.restore();
    });

    it('should execute the command', () => {
      gitify.exec.should.have.been.calledWithMatch({});
    });
  });
});
