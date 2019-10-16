import cli from '../../../src/cli';
import gitify from '../../../src';
import {
  DEFAULT_WORKING_DIR,
} from '../../../src/constants';

const repository = 'repository';
const username = 'username';
const password = 'password';
const argv = ['-u', username, '-p', password, repository];

describe('gitify', () => {
  describe('cli', () => {
    before(async () => {
      sinon.stub(gitify, 'exec').callsFake(() => Promise.resolve());
      await cli(argv);
    });
    after(() => {
      gitify.exec.restore();
    });

    it('should execute the command', () => {
      gitify.exec.should.have.been.calledWithMatch({
        repository,
        username,
        password,
        workingDir: DEFAULT_WORKING_DIR,
      });
    });
  });
});
