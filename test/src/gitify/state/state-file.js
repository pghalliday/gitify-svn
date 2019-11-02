import {
  StateFile,
} from '../../../../src/gitify/state/state-file';
import workingDirectory from '../../../../src/gitify/working-directory';
import {
  join,
} from 'path';
import {
  FsMock,
  FS_DIRECTORY,
} from '../../../mocks/fs';
import {
  STATE_FILE,
} from '../../../../src/constants';

const workingDir = 'workingDir';
const exported = {
  exported: 'exported',
};

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('stateFile', () => {
        let stateFile;
        let fsMock;
        let s;

        beforeEach(() => {
          workingDirectory.path = workingDir;
          fsMock = new FsMock({
            [workingDir]: {
              type: FS_DIRECTORY,
            },
          });
          stateFile = new StateFile();
        });

        afterEach(() => {
          fsMock.restore();
        });

        describe('read', () => {
          beforeEach(async () => {
            s = await stateFile.read();
          });

          it('should read the state file', () => {
            expect(s).to.not.be.ok;
          });

          describe('then write', () => {
            beforeEach(async () => {
              await stateFile.write(exported);
            });

            it('should write to the state file', () => {
              fsMock.getEntry(join(workingDir, STATE_FILE))
                  .data.should.eql(JSON.stringify(exported, null, 2));
            });

            describe('then read', () => {
              beforeEach(async () => {
                s = await stateFile.read();
              });

              it('should read the state file', () => {
                s.should.eql(exported);
              });
            });
          });
        });
      });
    });
  });
});
