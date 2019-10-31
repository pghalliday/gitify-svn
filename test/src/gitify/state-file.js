import path from 'path';
import {
  FsMock,
  FS_DIRECTORY,
  FS_FILE,
} from '../../mocks/fs';
import {
  createInstance,
  createConstructor,
  checkConstructed,
} from '../../helpers/utils';
import stateFileFactory from '../../../src/gitify/state-file';
import stateFactory from '../../../src/gitify/state';
import {
  STATE_FILE,
} from '../../../src/constants';

const State = stateFactory({});

const workingDir = 'parentPath/workingDir';
const exported = 'exported';

describe('src', () => {
  describe('gitify', () => {
    describe('state-file', () => {
      let state;
      let FakeState;
      let StateFile;
      let stateFile;

      beforeEach(async () => {
        state = createInstance(State, {
          export: exported,
        });
        FakeState = createConstructor(state);
        StateFile = stateFileFactory({
          State: FakeState,
        });
        stateFile = new StateFile(workingDir);
      });

      describe('load', () => {
        let fsMock;

        describe('when the the state file does not exist', () => {
          beforeEach(async () => {
            fsMock = new FsMock({
              [workingDir]: {
                type: FS_DIRECTORY,
              },
            });
            await stateFile.load(workingDir);
          });

          afterEach(() => {
            fsMock.restore();
          });

          it('should initialise an empty state', () => {
            checkConstructed(FakeState, {});
            stateFile.state.should.equal(state);
          });

          describe('and then call save', () => {
            beforeEach(async () => {
              await stateFile.save();
            });

            it('should write the state file', () => {
              fsMock.getEntry(path.join(workingDir, STATE_FILE)).data
                  .should.eql(JSON.stringify(exported, null, 2));
            });
          });
        });

        describe('when the state file does exist', () => {
          beforeEach(async () => {
            fsMock = new FsMock({
              [workingDir]: {
                type: FS_DIRECTORY,
              },
              [path.join(workingDir, STATE_FILE)]: {
                type: FS_FILE,
                data: JSON.stringify(exported, null, 2),
              },
            });
            await stateFile.load(workingDir);
          });

          afterEach(() => {
            fsMock.restore();
          });

          it('should read the state from the file', () => {
            checkConstructed(FakeState, {exported});
            stateFile.state.should.equal(state);
          });
        });
      });
    });
  });
});
