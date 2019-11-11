import {
  gitFactory,
} from '../../../src/gitify/git';
import Binary from '../../../src/gitify/binary';
import prompt from '../../../src/gitify/prompt';
import {
  IMPORTED_DESCRIPTOR_FILE,
  INITIAL_COMMIT_MESSAGE,
  promptConfirmOverwriteProject,
  promptConfirmForcePush,
  DEFAULT_NAME,
  DEFAULT_EMAIL,
} from '../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  stubResolves,
  stubReturns,
} from '../../helpers/utils';
import {
  join,
} from 'path';
import {
  FsMock,
  FS_DIRECTORY,
  FS_FILE,
} from '../../mocks/fs';

const bin = 'bin';
const root = 'root';
const parent = 'parent';
const path = 'path';
const name = 'name';
const email = 'email';
const date = 'date';
const remote = 'remote';
const commit = 'commit';
const importedDescriptor = {
  data: 'data',
};
const env = ({
  name = DEFAULT_NAME,
  email = DEFAULT_EMAIL,
  date,
}) => ({
  ...process.env,
  GIT_COMMITTER_NAME: name,
  GIT_COMMITTER_EMAIL: email,
  GIT_COMMITTER_DATE: date,
  GIT_AUTHOR_NAME: name,
  GIT_AUTHOR_EMAIL: email,
  GIT_AUTHOR_DATE: date,
});

const binary = createInstance(Binary, {
  exec: sinon.stub(),
});
const FakeBinary = createConstructor();
const Git = gitFactory({
  Binary: FakeBinary,
});

describe('src', () => {
  describe('gitify', () => {
    describe('git', () => {
      let git;

      beforeEach(() => {
        git = new Git();
      });

      describe('init', () => {
        beforeEach(() => {
          stubReturns(FakeBinary, binary);
          git.init({
            binary: bin,
            root,
          });
        });

        it('should create the Binary instance', () => {
          checkConstructed(FakeBinary, {
            binary: bin,
            args: [],
          });
        });

        describe('initRepository', () => {
          beforeEach(async () => {
            stubResolves(binary.exec, [
              undefined,
            ]);
            await git.initRepository({
              path,
            });
          });

          it('should initialise a git repository', () => {
            binary.exec.should.have.been.calledWith(['init'], {
              cwd: join(root, path),
              env: env({}),
            });
          });
        });

        describe('pushNewRepository', () => {
          let response;
          let fsMock;

          beforeEach(async () => {
            fsMock = new FsMock({
              [join(root, path)]: {
                type: FS_DIRECTORY,
              },
              [join(root, path, 'test')]: {
                type: FS_FILE,
                data: 'data',
              },
            });
            sinon.stub(git, 'initRepository');
            sinon.stub(prompt, 'confirm');
          });

          afterEach(() => {
            fsMock.restore();
            git.initRepository.restore();
            prompt.confirm.restore();
          });

          describe('when the user confirms all', () => {
            beforeEach(async () => {
              stubResolves(prompt.confirm, [
                true,
                true,
              ]);
              stubResolves(git.initRepository, undefined);
              stubResolves(binary.exec, [
                undefined,
                undefined,
                undefined,
                undefined,
                `${commit}\n`,
              ]);
              response = await git.pushNewRepository({
                remote,
                path,
                name,
                email,
                date,
                importedDescriptor,
              });
            });

            it('should confirm overwrite', () => {
              prompt.confirm.should.have.been.calledWith(
                  promptConfirmOverwriteProject(join(root, path)),
                  false,
              );
            });

            it('should confirm force push', () => {
              prompt.confirm.should.have.been.calledWith(
                  promptConfirmForcePush(remote),
                  false,
              );
            });

            it('should delete the existing directory', () => {
              expect(fsMock.getEntry(join(root, path, 'test')))
                  .to.not.be.ok;
            });

            it('should create the repository directory', () => {
              fsMock.getEntry(join(root, path)).type
                  .should.eql(FS_DIRECTORY);
            });

            it('should init a git repository', () => {
              git.initRepository.should.have.been.calledWith({
                path: path,
              });
            });

            it('should create the imported descriptor file', () => {
              fsMock.getEntry(
                  join(root, path, IMPORTED_DESCRIPTOR_FILE)
              ).data.should.eql(JSON.stringify(importedDescriptor, null, 2));
            });

            it('should git add the imported descriptor file', () => {
              binary.exec.getCall(0).should.have.been.calledWith([
                'add',
                IMPORTED_DESCRIPTOR_FILE,
              ], {
                cwd: join(root, path),
                env: env({
                  name,
                  email,
                  date,
                }),
              });
            });

            it('should make the initial commit', () => {
              binary.exec.getCall(1).should.have.been.calledWith([
                'commit',
                '-m',
                INITIAL_COMMIT_MESSAGE,
              ], {
                cwd: join(root, path),
                env: env({
                  name,
                  email,
                  date,
                }),
              });
            });

            it('should set the remote', () => {
              binary.exec.getCall(2).should.have.been.calledWith([
                'remote',
                'add',
                'origin',
                remote,
              ], {
                cwd: join(root, path),
                env: env({
                  name,
                  email,
                  date,
                }),
              });
            });

            it('should force push', () => {
              binary.exec.getCall(3).should.have.been.calledWith([
                'push',
                '--force',
                '--set-upstream',
                'origin',
                'master',
              ], {
                cwd: join(root, path),
                env: env({
                  name,
                  email,
                  date,
                }),
              });
            });

            it('should return the commit', () => {
              binary.exec.getCall(4).should.have.been.calledWith([
                'rev-parse',
                'master',
              ], {
                cwd: join(root, path),
                env: env({
                  name,
                  email,
                  date,
                }),
              });
              response.should.eql(commit);
            });
          });

          describe('when the user cancels overwrite', () => {
            beforeEach(async () => {
              stubResolves(prompt.confirm, [
                false,
              ]);
              stubResolves(git.initRepository, []);
              stubResolves(binary.exec, []);
            });

            it('should throw an error', async () => {
              await git.pushNewRepository({
                remote,
                path,
                name,
                email,
                date,
                importedDescriptor,
              }).should.be.rejectedWith('User cancelled overwrite project');
            });
          });

          describe('when the user cancels force push', () => {
            beforeEach(async () => {
              stubResolves(prompt.confirm, [
                true,
                false,
              ]);
              stubResolves(git.initRepository, []);
              stubResolves(binary.exec, []);
            });

            it('should throw an error', async () => {
              await git.pushNewRepository({
                remote,
                path,
                name,
                email,
                date,
                importedDescriptor,
              }).should.be.rejectedWith('User cancelled force push');
            });
          });
        });

        describe('newSubmodule', () => {
          let response;
          let fsMock;

          beforeEach(async () => {
            fsMock = new FsMock({
              [join(root, parent, path)]: {
                type: FS_DIRECTORY,
              },
            });
            sinon.stub(git, 'pushNewRepository');
            stubResolves(git.pushNewRepository, commit);
            stubResolves(binary.exec, [
              undefined,
              undefined,
            ]);
            response = await git.newSubmodule({
              remote,
              parent,
              path,
              name,
              email,
              date,
              importedDescriptor,
            });
          });

          afterEach(() => {
            fsMock.restore();
            git.pushNewRepository.restore();
          });

          it('should create and push a new repository', () => {
            git.pushNewRepository.should.have.been.calledWith({
              remote,
              path: join(parent, path),
              name,
              email,
              date,
              importedDescriptor,
            });
          });

          it('should delete the directory', () => {
            expect(fsMock.getEntry(join(root, parent, path))).to.not.be.ok;
          });

          it('should add the submodule', () => {
            binary.exec.getCall(0).should.have.been.calledWith([
              'submodule',
              'add',
              remote,
              path,
            ], {
              cwd: join(root, parent),
              env: env({
                name,
                email,
                date,
              }),
            });
          });

          it('should recursively update the submodules', () => {
            binary.exec.getCall(1).should.have.been.calledWith([
              'submodule',
              'update',
              '--init',
              '--recursive',
            ], {
              cwd: join(root, parent),
              env: env({
                name,
                email,
                date,
              }),
            });
          });

          it('should return the commit', () => {
            response.should.eql(commit);
          });
        });
      });
    });
  });
});
