import {
  gitFactory,
} from '../../../../src/gitify/git';
import utils from '../../../../src/gitify/git/lib/utils';
import Binary from '../../../../src/gitify/binary';
import prompt from '../../../../src/gitify/prompt';
import {
  IMPORTED_DESCRIPTOR_FILE,
  INITIAL_COMMIT_MESSAGE,
  promptConfirmOverwriteProject,
  promptConfirmForcePush,
} from '../../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  stubResolves,
  stubReturns,
} from '../../../helpers/utils';
import {
  join,
} from 'path';
import {
  FsMock,
  FS_DIRECTORY,
  FS_FILE,
} from '../../../mocks/fs';

const bin = 'bin';
const root = 'root';
const parent = 'parent';
const path = 'path';
const name = 'name';
const email = 'email';
const date = 'date';
const message = 'message';
const remote = 'remote';
const commit = 'commit';
const importedDescriptor = {
  data: 'data',
};
const commitEnv = ({
  name,
  email,
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

        describe('getCommit', () => {
          let ret;

          beforeEach(async () => {
            stubResolves(binary.exec, `${commit}\n`);
            ret = await git.getCommit({
              path,
            });
          });

          it('should return the commit', () => {
            binary.exec.should.have.been.calledWith([
              'rev-parse',
              'HEAD',
            ], {
              cwd: join(root, path),
            });
            ret.should.eql(commit);
          });
        });

        describe('addAll', () => {
          beforeEach(async () => {
            stubResolves(binary.exec, undefined);
            await git.addAll({
              path,
            });
          });

          it('should add all changes', () => {
            binary.exec.should.have.been.calledWith([
              'add',
              '-A',
            ], {
              cwd: join(root, path),
            });
          });
        });

        describe('commit', () => {
          let ret;

          beforeEach(async () => {
            stubResolves(binary.exec, undefined);
            sinon.stub(git, 'getCommit');
            stubResolves(git.getCommit, commit);
            ret = await git.commit({
              path,
              name,
              email,
              date,
              message,
            });
          });

          afterEach(() => {
            git.getCommit.restore();
          });

          it('should commit changes and return the commit ref', () => {
            binary.exec.should.have.been.calledWith([
              'commit',
              '-m',
              message,
            ], {
              cwd: join(root, path),
              env: commitEnv({
                name,
                email,
                date,
              }),
            });
            ret.should.eql(commit);
          });
        });

        describe('pushAll', () => {
          beforeEach(async () => {
            stubResolves(binary.exec, undefined);
            await git.pushAll({
              path,
            });
          });

          it('should push all changes', () => {
            binary.exec.should.have.been.calledWith([
              'push',
              '--all',
            ], {
              cwd: join(root, path),
            });
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
            sinon.stub(git, 'addAll');
            sinon.stub(git, 'commit');
            sinon.stub(prompt, 'confirm');
          });

          afterEach(() => {
            fsMock.restore();
            git.initRepository.restore();
            git.addAll.restore();
            git.commit.restore();
            prompt.confirm.restore();
          });

          describe('when the user confirms all', () => {
            beforeEach(async () => {
              stubResolves(prompt.confirm, [
                true,
                true,
              ]);
              stubResolves(git.initRepository, undefined);
              stubResolves(git.addAll, undefined);
              stubResolves(git.commit, commit);
              stubResolves(binary.exec, [
                undefined,
                undefined,
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
                path,
              });
            });

            it('should create the imported descriptor file', () => {
              fsMock.getEntry(
                  join(root, path, IMPORTED_DESCRIPTOR_FILE)
              ).data.should.eql(JSON.stringify(importedDescriptor, null, 2));
            });

            it('should git add the imported descriptor file', () => {
              git.addAll.should.have.been.calledWith({
                path,
              });
            });

            it('should make the initial commit', () => {
              git.commit.should.have.been.calledWith({
                message: INITIAL_COMMIT_MESSAGE,
                name,
                email,
                date,
                path,
              });
            });

            it('should set the remote', () => {
              binary.exec.getCall(0).should.have.been.calledWith([
                'remote',
                'add',
                'origin',
                remote,
              ], {
                cwd: join(root, path),
              });
            });

            it('should force push', () => {
              binary.exec.getCall(1).should.have.been.calledWith([
                'push',
                '--force',
                '--set-upstream',
                'origin',
                'master',
              ], {
                cwd: join(root, path),
              });
            });

            it('should return the commit', () => {
              response.should.eql(commit);
            });
          });

          describe('when the user cancels overwrite', () => {
            beforeEach(async () => {
              stubResolves(prompt.confirm, [
                false,
              ]);
              stubResolves(git.initRepository, []);
              stubResolves(git.addAll, []);
              stubResolves(git.commit, []);
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
              stubResolves(git.addAll, []);
              stubResolves(git.commit, []);
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
            });
          });

          it('should return the commit', () => {
            response.should.eql(commit);
          });
        });

        describe('createDirectory', () => {
          let fsMock;

          beforeEach(async () => {
            sinon.stub(utils, 'checkEmpty');
            fsMock = new FsMock({
            });
            await git.createDirectory({
              path,
            });
          });

          afterEach(() => {
            utils.checkEmpty.restore();
            fsMock.restore();
          });

          it('should create the directory', () => {
            fsMock.getEntry(join(root, path)).type.should.eql(FS_DIRECTORY);
          });

          // eslint-disable-next-line max-len
          it('should check if the directory is empty to create a .gitkeep file', () => {
            utils.checkEmpty.should.have.been.calledWith(join(root, path));
          });
        });
      });
    });
  });
});
