import {
  start,
} from '../../../src/gitify/start';
import workingDirectory from '../../../src/gitify/working-directory';
import git from '../../../src/gitify/git';
import svn from '../../../src/gitify/svn';
import state from '../../../src/gitify/state';

const repositories = 'repositories';
const directory = 'directory';
const username = 'username';
const password = 'password';
const gitBinary = 'gitBinary';
const svnBinary = 'svnBinary';

describe('src', () => {
  describe('gitify', () => {
    describe('start', () => {
      beforeEach(async () => {
        sinon.stub(workingDirectory, 'init').resolves(undefined);
        sinon.stub(git, 'init').returns(undefined);
        sinon.stub(svn, 'init').resolves(undefined);
        sinon.stub(state, 'init').resolves(undefined);
        await start({
          repositories,
          username,
          password,
          directory,
          gitBinary,
          svnBinary,
        });
      });

      afterEach(() => {
        workingDirectory.init.restore();
        git.init.restore();
        svn.init.restore();
        state.init.restore();
      });

      it('should initialise the working directory', () => {
        workingDirectory.init.should.have.been.calledWith({
          path: directory,
        });
        // eslint-disable-next-line max-len
        workingDirectory.init.should.have.been.calledBefore(state.init);
      });

      it('should initialise the git instance', () => {
        git.init.should.have.been.calledWith({
          binary: gitBinary,
        });
        git.init.should.have.been.calledBefore(workingDirectory.init);
      });

      it('should initialise the svn instance', () => {
        svn.init.should.have.been.calledWith({
          username,
          password,
          binary: svnBinary,
        });
        svn.init.should.have.been.calledBefore(state.init);
      });

      it('should initialise the state', () => {
        state.init.should.have.been.calledWith({
          repositories,
        });
      });
    });
  });
});