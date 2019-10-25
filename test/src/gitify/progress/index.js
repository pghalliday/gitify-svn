import path from 'path';
import {
  FsMock,
  FS_DIRECTORY,
  FS_FILE,
} from '../../../mocks/fs';
import {
  PROGRESS_TEST_DATA,
  NEW_REPOSITORY_URL,
  REPOSITORY_UUID,
  NEW_REPOSITORY_UUID,
  NEW_HEAD_REVISION,
  NEW_LAST_REVISION,
} from '../../../helpers/constants';
import {
  progress,
} from '../../../../src/gitify/progress';
import {
  PROGRESS_FILE,
} from '../../../../src/constants';

const workingDir = 'parentPath/workingDir';

describe('src', () => {
  describe('gitify', () => {
    describe('progress', () => {
      let fsMock;

      describe('init', () => {
        describe('when the the progress file does not exist', () => {
          beforeEach(async () => {
            fsMock = new FsMock({
              [workingDir]: {
                type: FS_DIRECTORY,
              },
            });
            await progress.init(workingDir);
          });

          afterEach(() => {
            fsMock.restore();
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
            it('should not write the progress file', () => {
              expect(fsMock.getEntry(
                  path.join(workingDir, PROGRESS_FILE)
              )).to.not.be.ok;
            });

            describe('and then get repositoryUrl', () => {
              it('should return the repository URL', () => {
                progress.repositoryUrl.should.eql(NEW_REPOSITORY_URL);
              });
            });

            describe('and then get headRevision', () => {
              it('should return the HEAD revision number', () => {
                progress.headRevision.should.eql(NEW_HEAD_REVISION);
              });
            });
          });
        });

        // eslint-disable-next-line max-len
        describe('when the progress file does exist', () => {
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
            await progress.init(workingDir);
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

            it('should write the progress file', () => {
              const entry = fsMock.getEntry(
                  path.join(workingDir, PROGRESS_FILE)
              );
              JSON.parse(entry.data).should.eql(progress.state);
            });

            describe('and then get lastRevision', () => {
              it('should return the last revision number', () => {
                progress.lastRevision.should.eql(NEW_LAST_REVISION);
              });
            });

            describe('and then get nextRevision', () => {
              it('should return the next revision number', () => {
                progress.nextRevision.should.eql(NEW_LAST_REVISION + 1);
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
                progress.repositoryUrl.should.eql(NEW_REPOSITORY_URL);
                progress.headRevision.should.eql(NEW_HEAD_REVISION);
              });
            });
          });
        });
      });
    });
  });
});
