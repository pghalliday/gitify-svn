import {
  workingDirectoryFactory,
} from '../../../src/gitify/working-directory';
import prompt from '../../../src/gitify/prompt';
import promptFile from '../../../src/gitify/prompt-file';
import git from '../../../src/gitify/git';
import {
  FsMock,
  FS_DIRECTORY,
  FS_FILE,
} from '../../mocks/fs';
import {
  promptConfirmNonEmpty,
} from '../../../src/constants';
import {
  stubResolves,
} from '../../helpers/utils';
import {
  join,
} from 'path';
import loggerFactory from '../../../src/logger';
import {
  LOG_FILE,
  README_FILE,
  README_TEXT,
  STATE_FILE,
} from '../../../src/constants';

const workingDir = 'workingDir';
const stateFile = 'stateFile';
const usePromptFile = 'usePromptFile';
const gitBinary = 'gitBinary';

describe('src', () => {
  describe('gitify', () => {
    describe('workingDirectory', () => {
      let fsMock;
      let WorkingDirectory;
      let workingDirectory;

      beforeEach(() => {
        sinon.stub(prompt, 'confirm');
        sinon.stub(promptFile, 'init');
        sinon.stub(git, 'init');
        stubResolves(git.init, undefined);
        sinon.stub(git, 'initRepository');
        stubResolves(git.initRepository, undefined);
        WorkingDirectory = workingDirectoryFactory({
        });
        workingDirectory = new WorkingDirectory();
      });

      afterEach(() => {
        prompt.confirm.restore();
        promptFile.init.restore();
        git.init.restore();
        git.initRepository.restore();
      });

      describe('init', () => {
        describe('when the path does not exist', () => {
          beforeEach(async () => {
            fsMock = new FsMock({});
            stubResolves(prompt.confirm, []);
            await workingDirectory.init({
              path: workingDir,
              usePromptFile,
              gitBinary,
            });
          });

          afterEach(() => {
            fsMock.restore();
          });

          it('should set the path', () => {
            workingDirectory.path.should.eql(workingDir);
          });

          it('should create the working directory', () => {
            fsMock.getEntry(workingDir).type.should.eql(FS_DIRECTORY);
          });

          it('should init the git singleton', () => {
            git.init.should.have.been.calledWith({
              binary: gitBinary,
              root: workingDir,
            });
          });

          it('should initialise a git repository', () => {
            git.initRepository.should.have.been.calledWith({
              path: '.',
            });
          });

          it('should add a README.md', () => {
            fsMock.getEntry(join(workingDir, README_FILE)).data
                .should.eql(README_TEXT);
          });

          it('should start logging to the file', () => {
            loggerFactory.logToFile.should.have.been.calledWith(
                join(workingDir, LOG_FILE)
            );
          });

          it('should initialise the prompt file', () => {
            promptFile.init.should.have.been.calledWith({
              usePromptFile,
            });
          });
        });

        describe('when the path exists', () => {
          describe('when the path is not a directory', () => {
            beforeEach(() => {
              fsMock = new FsMock({
                workingDir: {
                  type: FS_FILE,
                },
              });
              stubResolves(prompt.confirm, []);
            });

            afterEach(() => {
              fsMock.restore();
            });

            it('should throw an error', async () => {
              await workingDirectory.init({
                path: workingDir,
                gitBinary,
              }).should.be.rejectedWith('EEXIST');
            });
          });

          describe('when the path contains only a state file', () => {
            beforeEach(async () => {
              fsMock = new FsMock({
                workingDir: {
                  type: FS_DIRECTORY,
                },
                [join(workingDir, STATE_FILE)]: {
                  type: FS_FILE,
                  data: stateFile,
                },
              });
              stubResolves(prompt.confirm, []);
              await workingDirectory.init({
                path: workingDir,
                gitBinary,
              });
            });

            afterEach(() => {
              fsMock.restore();
            });

            it('should set the path', () => {
              workingDirectory.path.should.eql(workingDir);
            });

            it('should start logging to the file', () => {
              loggerFactory.logToFile.should.have.been.calledWith(
                  join(workingDir, LOG_FILE)
              );
            });

            it('should initialise a git repository', () => {
              git.initRepository.should.have.been.calledWith({
                path: '.',
              });
            });

            it('should add a README.md', () => {
              fsMock.getEntry(join(workingDir, README_FILE)).data
                  .should.eql(README_TEXT);
            });
          });

          describe('when the path has everything but a state file', () => {
            beforeEach(async () => {
              fsMock = new FsMock({
                workingDir: {
                  type: FS_DIRECTORY,
                },
                [join(workingDir, README_FILE)]: {
                  type: FS_FILE,
                  data: 'text',
                },
                [join(workingDir, '.git')]: {
                  type: FS_DIRECTORY,
                },
              });
            });

            afterEach(() => {
              fsMock.restore();
            });

            describe('and the user confirms', () => {
              beforeEach(async () => {
                stubResolves(prompt.confirm, true);
                await workingDirectory.init({
                  path: workingDir,
                  gitBinary,
                });
              });

              it('should confirm with the user', () => {
                prompt.confirm.should.have.been.calledWith(
                    promptConfirmNonEmpty(workingDir),
                    false,
                );
              });

              it('should set the path', () => {
                workingDirectory.path.should.eql(workingDir);
              });

              it('should start logging to the file', () => {
                loggerFactory.logToFile.should.have.been.calledWith(
                    join(workingDir, LOG_FILE)
                );
              });

              it('should not initialise a git repository', () => {
                git.initRepository.should.not.have.been.called;
              });

              it('should not change the README.md', () => {
                fsMock.getEntry(join(workingDir, README_FILE)).data
                    .should.eql('text');
              });
            });

            describe('and the cancels', () => {
              beforeEach(async () => {
                stubResolves(prompt.confirm, false);
              });

              it('should throw an error', async () => {
                await workingDirectory.init({
                  path: workingDir,
                  gitBinary,
                }).should.be.rejectedWith('User cancelled');
              });
            });
          });
        });
      });
    });
  });
});
