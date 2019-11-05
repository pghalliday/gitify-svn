import {
  forEach,
} from 'lodash';
import {
  start,
} from '../../../src/gitify/start';
import workingDirectory from '../../../src/gitify/working-directory';
import loggerFactory from '../../../src/logger';
import git from '../../../src/gitify/git';
import svn from '../../../src/gitify/svn';
import state from '../../../src/gitify/state';

const repository = 'repository';
const repository2 = 'repository2';
const workingDir = 'workingDir';
const username = 'username';
const password = 'password';
const gitBinary = 'gitBinary';
const svnBinary = 'svnBinary';

const scenarios = {
  'with no repositories': {
    repositories: [],
  },
  'with one repositories': {
    repository,
    repositories: [repository],
  },
  'with multiple repositories': {
    repository: [repository, repository2],
    repositories: [repository, repository2],
  },
};

describe('src', () => {
  describe('gitify', () => {
    describe('start', () => {
      forEach(scenarios, (value, key) => {
        describe(key, () => {
          beforeEach(async () => {
            sinon.stub(workingDirectory, 'init').resolves(undefined);
            sinon.stub(git, 'init').returns(undefined);
            sinon.stub(svn, 'init').resolves(undefined);
            sinon.stub(state, 'init').resolves(undefined);
            await start({
              'repository': value.repository,
              username,
              password,
              'working-dir': workingDir,
              'git-binary': gitBinary,
              'svn-binary': svnBinary,
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
              path: workingDir,
            });
            // eslint-disable-next-line max-len
            workingDirectory.init.should.have.been.calledBefore(loggerFactory.init);
          });

          it('should initialise the logger factory', () => {
            loggerFactory.init.should.have.been.called;
            loggerFactory.init.should.have.been.calledBefore(svn.init);
            loggerFactory.init.should.have.been.calledBefore(git.init);
          });

          it('should initialise the git instance', () => {
            git.init.should.have.been.calledWith({
              binary: gitBinary,
            });
            git.init.should.have.been.calledBefore(state.init);
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
              repositories: value.repositories,
            });
          });
        });
      });
    });
  });
});
