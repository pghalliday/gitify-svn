import path from 'path';
import {
  FsMock,
  FS_DIRECTORY,
  FS_FILE,
} from '../../../helpers/fs';
import {
  PROGRESS_TEST_EMPTY,
  PROGRESS_TEST_DATA,
  NEW_REPOSITORY_URL,
  REPOSITORY_UUID,
  NEW_REPOSITORY_UUID,
  NEW_HEAD_REVISION,
  NEW_LAST_REVISION,
} from '../../../helpers/constants';
import {
  Progress,
} from '../../../../src/gitify/progress';
import {
  PROGRESS_FILE,
} from '../../../../src/constants';

const workingDir = 'parentPath/workingDir';

describe('src', () => {
  describe('gitify', () => {
    describe('progress', () => {
      let progress;
      let fsMock;

      beforeEach(() => {
        progress = new Progress({
          workingDir,
        });
      });

      describe('init', () => {
        describe('when the working directory can be created', () => {
          beforeEach(async () => {
            fsMock = new FsMock({});
            await progress.init();
          });

          afterEach(() => {
            fsMock.restore();
          });

          it('should create the working directory', () => {
            fsMock.getEntry(workingDir).type.should.eql(FS_DIRECTORY);
          });

          it('should create the progress file', () => {
            const entry = fsMock.getEntry(path.join(workingDir, PROGRESS_FILE));
            entry.type.should.eql(FS_FILE);
            JSON.parse(entry.data).should.eql(PROGRESS_TEST_EMPTY);
          });

          describe('and then call setRepository', () => {
            beforeEach(() => {
              progress.setRepository({
                repositoryUrl: NEW_REPOSITORY_URL,
                repositoryUuid: NEW_REPOSITORY_UUID,
                headRevision: NEW_HEAD_REVISION,
              });
            });

            // eslint-disable-next-line max-len
            it('should update the state but not write the progress file', () => {
              const entry = fsMock.getEntry(
                  path.join(workingDir, PROGRESS_FILE)
              );
              JSON.parse(entry.data).should.eql(PROGRESS_TEST_EMPTY);
              progress.state.should.eql({
                ...PROGRESS_TEST_EMPTY,
                repositoryUrl: NEW_REPOSITORY_URL,
                repositoryUuid: NEW_REPOSITORY_UUID,
                headRevision: NEW_HEAD_REVISION,
              });
            });
          });
        });

        // eslint-disable-next-line max-len
        describe('if the working directory and progress file already exists', () => {
          beforeEach(async () => {
            fsMock = new FsMock({
              [workingDir]: {
                type: FS_DIRECTORY,
              },
              [path.join(workingDir, PROGRESS_FILE)]: {
                type: FS_FILE,
                data: JSON.stringify(PROGRESS_TEST_DATA, null, 2),
              },
            });
            await progress.init();
          });

          afterEach(() => {
            fsMock.restore();
          });

          it('should read the progress from the file', () => {
            const entry = fsMock.getEntry(path.join(workingDir, PROGRESS_FILE));
            JSON.parse(entry.data).should.eql(PROGRESS_TEST_DATA);
            progress.state.should.eql(PROGRESS_TEST_DATA);
          });

          describe('and then call revisionProcessed', () => {
            beforeEach(async () => {
              await progress.revisionProcessed(NEW_LAST_REVISION);
            });

            it('should update the state and write the progress file', () => {
              const entry = fsMock.getEntry(
                  path.join(workingDir, PROGRESS_FILE)
              );
              JSON.parse(entry.data).should.eql({
                ...PROGRESS_TEST_DATA,
                lastRevision: NEW_LAST_REVISION,
              });
              progress.state.should.eql({
                ...PROGRESS_TEST_DATA,
                lastRevision: NEW_LAST_REVISION,
              });
            });
          });

          describe('and then call setRepository', () => {
            describe('with a different UUID', () => {
              it('should error', () => {
                expect(() => progress.setRepository({
                  repositoryUrl: NEW_REPOSITORY_URL,
                  repositoryUuid: NEW_REPOSITORY_UUID,
                  headRevision: NEW_HEAD_REVISION,
                })).to.throw(
                    // eslint-disable-next-line max-len
                    `Repository UUIDs do not match: ${REPOSITORY_UUID} : ${NEW_REPOSITORY_UUID}`
                );
              });
            });

            describe('with a matching UUID', () => {
              beforeEach(() => {
                progress.setRepository({
                  repositoryUrl: NEW_REPOSITORY_URL,
                  repositoryUuid: REPOSITORY_UUID,
                  headRevision: NEW_HEAD_REVISION,
                });
              });

              // eslint-disable-next-line max-len
              it('should update the state but not write the progress file', () => {
                const entry = fsMock.getEntry(
                    path.join(workingDir, PROGRESS_FILE)
                );
                JSON.parse(entry.data).should.eql(PROGRESS_TEST_DATA);
                progress.state.should.eql({
                  ...PROGRESS_TEST_DATA,
                  repositoryUrl: NEW_REPOSITORY_URL,
                  headRevision: NEW_HEAD_REVISION,
                });
              });
            });
          });
        });

        describe('when the working directory cannot be created', () => {
          beforeEach(() => {
            fsMock = new FsMock({
              [workingDir]: {
                type: FS_FILE,
              },
            });
          });

          afterEach(() => {
            fsMock.restore();
          });

          it('should error', async () => {
            await progress.init().should.be.rejectedWith('EEXIST');
          });
        });
      });
    });
  });
});
