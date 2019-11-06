import {
  gitFactory,
} from '../../../src/gitify/git';
import Binary from '../../../src/gitify/binary';
import {
  IMPORTED_DESCRIPTOR_FILE,
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
} from '../../mocks/fs';

const bin = 'bin';
const parent = 'parent';
const path = 'path';
const remote = 'remote';
const commit = 'commit';
const importedDescriptor = 'importedDescriptor';

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

        describe('initProject', () => {
          beforeEach(async () => {
            stubResolves(binary.exec, [
              undefined,
            ]);
            await git.initProject({
              path,
            });
          });

          it('should initialise a git repository', () => {
            binary.exec.should.have.been.calledWith(['init'], {
              cwd: path,
            });
          });
        });

        describe('addSubmodule', () => {
          let response;
          let fsMock;

          beforeEach(async () => {
            fsMock = new FsMock({});
            sinon.stub(git, 'initProject');
            stubResolves(git.initProject, undefined);
            stubResolves(binary.exec, [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              `${commit}\n`,
            ]);
            response = await git.addSubmodule({
              remote,
              parent,
              path,
              importedDescriptor,
            });
          });

          afterEach(() => {
            fsMock.restore();
            git.initProject.restore();
          });

          it('should create the submodule directory', () => {
            fsMock.getEntry(join(parent, path)).type.should.eql(FS_DIRECTORY);
          });

          it('should init a git repository', () => {
            git.initProject.should.have.been.calledWith({
              path: join(parent, path),
            });
          });

          it('should create the imported descriptor file', () => {
            fsMock.getEntry(
                join(parent, path, IMPORTED_DESCRIPTOR_FILE)
            ).data.should.eql(importedDescriptor);
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
              'origin',
              'master',
            ], {
              cwd: join(parent, path),
            });
          });

          it.skip('should delete the directory', () => {
            // TODO: hard to prove this as we will use rimraf
          });

          it('should add the submodule', () => {
            binary.exec.getCall(4).should.have.been.calledWith([
              'submodule',
              'add',
              remote,
              path,
            ], {
              cwd: parent,
            });
          });

          it('should recursively initialise the submodules', () => {
            binary.exec.getCall(5).should.have.been.calledWith([
              'submodule',
              'update',
              '--init',
              '--recursive',
            ], {
              cwd: parent,
            });
          });

          it('should return the commit', () => {
            binary.exec.getCall(6).should.have.been.calledWith([
              'rev-parse',
              'master',
            ], {
              cwd: join(parent, path),
            });
            response.should.eql(commit);
          });
        });
      });
    });
  });
});
