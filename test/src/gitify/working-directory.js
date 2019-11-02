import {
  WorkingDirectory,
} from '../../../src/gitify/working-directory';
import prompt from '../../../src/gitify/prompt';
import {
  FsMock,
  FS_DIRECTORY,
} from '../../mocks/fs';
import {
  stubResolves,
} from '../../helpers/utils';
import {
  PROMPT_WORKING_DIRECTORY,
  DEFAULT_WORKING_DIR,
} from '../../../src/constants';

const workingDir = 'workingDir';

describe('src', () => {
  describe('gitify', () => {
    describe('workingDirectory', () => {
      let workingDirectory;

      beforeEach(() => {
        workingDirectory = new WorkingDirectory();
      });

      describe('get', () => {
        let fsMock;
        let input;
        let w;

        beforeEach(async () => {
          input = sinon.stub(prompt, 'input');
          fsMock = new FsMock({});
        });

        afterEach(() => {
          input.restore();
          fsMock.restore();
        });

        // eslint-disable-next-line max-len
        describe('when the working directory has been supplied with init', () => {
          beforeEach(async () => {
            stubResolves(input, []);
            workingDirectory.init({
              workingDirectory: workingDir,
            });
            w = await workingDirectory.get();
          });

          // eslint-disable-next-line max-len
          it('should return the same working directory without prompting', () => {
            w.should.eql(workingDir);
          });

          it('should create the working directory', () => {
            fsMock.getEntry(workingDir).type.should.eql(FS_DIRECTORY);
          });
        });

        // eslint-disable-next-line max-len
        describe('when the working directory has not yet been supplied', () => {
          beforeEach(async () => {
            stubResolves(input, workingDir);
            w = await workingDirectory.get();
          });

          it('should prompt for the working directory', () => {
            input.should.have.been.calledWith(
                PROMPT_WORKING_DIRECTORY,
                DEFAULT_WORKING_DIR,
            );
            w.should.eql(workingDir);
          });
        });
      });
    });
  });
});
