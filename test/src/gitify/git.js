import {
  gitFactory,
} from '../../../src/gitify/git';
import Binary from '../../../src/gitify/binary';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  stubResolves,
} from '../../helpers/utils';
import {
  join,
} from 'path';

const bin = 'bin';
const parent = 'parent';
const path = 'path';
const remote = 'remote';
const commit = 'commit';

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

          beforeEach(async () => {
            stubResolves(binary.exec, [
              undefined,
              undefined,
              `${commit}\n`,
            ]);
            response = await git.addSubmodule({
              remote,
              parent,
              path,
            });
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

          it('should recursively initialise the submodules', () => {
            binary.exec.getCall(1).should.have.been.calledWith([
              'submodule',
              'update',
              '--init',
              '--recursive',
            ], {
              cwd: parent,
            });
          });

          it('should return the remote and commit', () => {
            binary.exec.getCall(2).should.have.been.calledWith([
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
