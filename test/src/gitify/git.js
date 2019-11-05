import {
  gitFactory,
} from '../../../src/gitify/git';
import Binary from '../../../src/gitify/binary';
import prompt from '../../../src/gitify/prompt';
// eslint-disable-next-line max-len
import repositoriesDirectory from '../../../src/gitify/state/repositories-directory';
import {
  IMPORT_DESCRIPTOR_FILE,
  promptProjectRemote,
  promptConfirmForcePush,
  INITIAL_COMMIT_MESSAGE,
} from '../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  stubResolves,
} from '../../helpers/utils';
import {
  FsMock,
  FS_DIRECTORY,
} from '../../mocks/fs';
import {
  join,
} from 'path';

const bin = 'bin';
const url = 'url';
const uuid = 'uuid';
const path = 'path';
const badRemote = 'badRemote';
const remote = 'remote';
const commit = 'commit';

describe('src', () => {
  describe('gitify', () => {
    describe('git', () => {
      let binary;
      let FakeBinary;
      let Git;
      let fsMock;
      let git;

      beforeEach(() => {
        repositoriesDirectory.path = path;
        sinon.stub(prompt, 'input');
        sinon.stub(prompt, 'confirm');
        binary = createInstance(Binary, {
          exec: sinon.stub(),
        });
        FakeBinary = createConstructor([
          binary,
        ]);
        Git = gitFactory({
          Binary: FakeBinary,
        });
        fsMock = new FsMock({});
        git = new Git();
      });

      afterEach(() => {
        prompt.input.restore();
        prompt.confirm.restore();
        fsMock.restore();
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

        describe('create', () => {
          let response;

          beforeEach(async () => {
            stubResolves(prompt.input, [
              badRemote,
              remote,
            ]);
            stubResolves(prompt.confirm, [
              false,
              true,
            ]);
            stubResolves(binary.exec, [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              `${commit}\n`,
            ]);
            response = await git.create({
              url,
              uuid,
            });
          });

          it('should create the directory', () => {
            fsMock.getEntry(join(path, uuid)).type.should.eql(FS_DIRECTORY);
          });

          it('should prompt for a remote', () => {
            prompt.input.should.have.been.calledWith(promptProjectRemote(url));
          });

          it('should init the Git project', () => {
            binary.exec.getCall(0).should.have.been.calledWith([
              'init',
            ], {
              cwd: join(path, uuid),
            });
          });

          it('should set the remote', () => {
            binary.exec.getCall(1).should.have.been.calledWith([
              'remote',
              'add',
              'origin',
              remote,
            ], {
              cwd: join(path, uuid),
            });
          });

          it('should add an imported descriptor file', () => {
            fsMock.getEntry(join(path, uuid, IMPORT_DESCRIPTOR_FILE)).data
                .should.eql(JSON.stringify({
                  url,
                  uuid,
                }, null, 2));
            binary.exec.getCall(2).should.have.been.calledWith([
              'add',
              IMPORT_DESCRIPTOR_FILE,
            ], {
              cwd: join(path, uuid),
            });
          });

          it('should commit the imported descriptor file', () => {
            binary.exec.getCall(3).should.have.been.calledWith([
              'commit',
              '-m',
              INITIAL_COMMIT_MESSAGE,
            ], {
              cwd: join(path, uuid),
            });
          });

          it('should confirm the force push to the remote', () => {
            prompt.confirm.should.have.been.calledWith(
                promptConfirmForcePush(remote),
                false,
            );
          });

          it('should force push', () => {
            binary.exec.getCall(4).should.have.been.calledWith([
              'push',
              '--force',
              '--set-upstream',
              'origin',
              'master',
            ], {
              cwd: join(path, uuid),
            });
          });

          it('should return the remote and commit', () => {
            binary.exec.getCall(5).should.have.been.calledWith([
              'rev-parse',
              'master',
            ], {
              cwd: join(path, uuid),
            });
            response.should.eql({
              remote,
              commit,
            });
          });
        });
      });
    });
  });
});
