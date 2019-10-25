import path from 'path';
import {
  FsMock,
  FS_DIRECTORY,
  FS_FILE,
} from '../../../mocks/fs';
import {
  PROGRESS_TEST_DATA,
} from '../../../helpers/constants';
import {
  ProgressFile,
} from '../../../../src/gitify/progress-file';
import {
  PROGRESS_FILE,
  INITIAL_PROGRESS_STATE,
} from '../../../../src/constants';

const workingDir = 'parentPath/workingDir';

describe('src', () => {
  describe('gitify', () => {
    describe('progress-file', () => {
      let progressFile;

      beforeEach(async () => {
        progressFile = new ProgressFile(workingDir);
      });

      describe('load', () => {
        let fsMock;

        describe('when the the progress file does not exist', () => {
          beforeEach(async () => {
            fsMock = new FsMock({
              [workingDir]: {
                type: FS_DIRECTORY,
              },
            });
            await progressFile.load(workingDir);
          });

          afterEach(() => {
            fsMock.restore();
          });

          it('should initialise an empty progress', () => {
            progressFile.progress.export().should.eql(INITIAL_PROGRESS_STATE);
          });

          describe('and then call save', () => {
            beforeEach(async () => {
              await progressFile.save();
            });

            it('should write the progress file', () => {
              fsMock.getEntry(path.join(workingDir, PROGRESS_FILE)).data
                  .should.eql(JSON.stringify(INITIAL_PROGRESS_STATE, null, 2));
            });
          });
        });

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
            await progressFile.load(workingDir);
          });

          afterEach(() => {
            fsMock.restore();
          });

          it('should read the progress from the file', () => {
            progressFile.progress.export().should.eql(PROGRESS_TEST_DATA);
          });
        });
      });
    });
  });
});
