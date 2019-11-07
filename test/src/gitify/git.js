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
} from '../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  stubResolves,
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
const parent = 'parent';
const path = 'path';
const remote = 'remote';
const commit = 'commit';
const importedDescriptor = {
  data: 'data',
};

describe('src', () => {
  describe('gitify', () => {
    describe('git', () => {
      let binary;
      let FakeBinary;
      let Git;
      let git;

      beforeEach(() => {
        binary = createInstance(Binary, {
          exec: sinon.stub(),
        });
        FakeBinary = createConstructor([
          binary,
        ]);
        Git = gitFactory({
          Binary: FakeBinary,
        });
        git = new Git();
      });

      describe('init', () => {
        beforeEach(() => {
          git.init({
            binary: bin,
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
              cwd: path,
            });
          });
        });

        describe('pushNewRepository', () => {
          let response;
          let fsMock;

          beforeEach(async () => {
            fsMock = new FsMock({
              [join(parent, path)]: {
                type: FS_DIRECTORY,
              },
              [join(parent, path, 'test')]: {
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
                parent,
                path,
                importedDescriptor,
              });
            });

            it('should confirm overwrite', () => {
              prompt.confirm.should.have.been.calledWith(
                  promptConfirmOverwriteProject(join(parent, path)),
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
              expect(fsMock.getEntry(join(parent, path, 'test'))).to.not.be.ok;
            });

            it('should create the submodule directory', () => {
              fsMock.getEntry(join(parent, path)).type.should.eql(FS_DIRECTORY);
            });

            it('should init a git repository', () => {
              git.initRepository.should.have.been.calledWith({
                path: join(parent, path),
              });
            });

            it('should create the imported descriptor file', () => {
              fsMock.getEntry(
                  join(parent, path, IMPORTED_DESCRIPTOR_FILE)
              ).data.should.eql(JSON.stringify(importedDescriptor, null, 2));
            });

            it('should git add the imported descriptor file', () => {
              binary.exec.getCall(0).should.have.been.calledWith([
                'add',
                IMPORTED_DESCRIPTOR_FILE,
              ], {
                cwd: join(parent, path),
              });
            });

            it('should make the initial commit', () => {
              binary.exec.getCall(1).should.have.been.calledWith([
                'commit',
                '-m',
                INITIAL_COMMIT_MESSAGE,
              ], {
                cwd: join(parent, path),
              });
            });

            it('should set the remote', () => {
              binary.exec.getCall(2).should.have.been.calledWith([
                'remote',
                'add',
                'origin',
                remote,
              ], {
                cwd: join(parent, path),
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
                cwd: join(parent, path),
              });
            });

            it('should return the commit', () => {
              binary.exec.getCall(4).should.have.been.calledWith([
                'rev-parse',
                'master',
              ], {
                cwd: join(parent, path),
              });
              response.should.eql(commit);
            });
          });

          describe('when the cancels overwrite', () => {
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
                parent,
                path,
                importedDescriptor,
              }).should.be.rejectedWith('User cancelled overwrite project');
            });
          });

          describe('when the cancels force push', () => {
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
                parent,
                path,
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
              [join(parent, path)]: {
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
              parent,
              path,
              importedDescriptor,
            });
          });

          it('should delete the directory', () => {
            expect(fsMock.getEntry(join(parent, path))).to.not.be.ok;
          });

          it('should add the submodule', () => {
            binary.exec.getCall(0).should.have.been.calledWith([
              'submodule',
              'add',
              remote,
              path,
            ], {
              cwd: parent,
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
