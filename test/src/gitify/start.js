import {
  start,
} from '../../../src/gitify/start';
import workingDirectory from '../../../src/gitify/working-directory';
import svn from '../../../src/gitify/svn';
import svnRepositories from '../../../src/gitify/state/svn-repositories';

const repositories = 'repositories';
const directory = 'directory';
const username = 'username';
const password = 'password';
const gitBinary = 'gitBinary';
const svnBinary = 'svnBinary';
const usePromptFile = 'usePromptFile';

describe('src', () => {
  describe('gitify', () => {
    describe('start', () => {
      beforeEach(async () => {
        sinon.stub(workingDirectory, 'init').resolves(undefined);
        sinon.stub(svn, 'init').resolves(undefined);
        sinon.stub(svnRepositories, 'init').resolves(undefined);
        sinon.stub(svnRepositories, 'migrate').resolves(undefined);
        await start({
          repositories,
          username,
          password,
          directory,
          gitBinary,
          svnBinary,
          usePromptFile,
        });
      });

      afterEach(() => {
        workingDirectory.init.restore();
        svn.init.restore();
        svnRepositories.init.restore();
        svnRepositories.migrate.restore();
      });

      it('should initialise the working directory', () => {
        workingDirectory.init.should.have.been.calledWith({
          path: directory,
          usePromptFile,
          gitBinary,
        });
        // eslint-disable-next-line max-len
        workingDirectory.init.should.have.been.calledBefore(svnRepositories.init);
      });

      it('should initialise the svn instance', () => {
        svn.init.should.have.been.calledWith({
          username,
          password,
          binary: svnBinary,
        });
        svn.init.should.have.been.calledBefore(svnRepositories.init);
      });

      it('should initialise the svn repositories', () => {
        svnRepositories.init.should.have.been.calledWith({
          repositories,
        });
        svnRepositories.init.should.have.been.calledBefore(
            svnRepositories.migrate
        );
      });

      it('should start the migration', () => {
        svnRepositories.migrate.should.have.been.called;
      });
    });
  });
});
