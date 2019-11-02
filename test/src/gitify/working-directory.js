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

      describe('init', () => {
        let fsMock;
        let input;

        beforeEach(() => {
          input = sinon.stub(prompt, 'input');
          fsMock = new FsMock({});
        });

        afterEach(() => {
          input.restore();
          fsMock.restore();
        });

        describe('with a path', () => {
          beforeEach(async () => {
            stubResolves(input, []);
            await workingDirectory.init({
              path: workingDir,
            });
          });

          it('should set the path', () => {
            workingDirectory.path.should.eql(workingDir);
          });

          it('should create the working directory', () => {
            fsMock.getEntry(workingDir).type.should.eql(FS_DIRECTORY);
          });
        });

        describe('without a path', () => {
          beforeEach(async () => {
            stubResolves(input, workingDir);
            await workingDirectory.init({});
          });

          it('should prompt for the working directory', () => {
            input.should.have.been.calledWith(
                PROMPT_WORKING_DIRECTORY,
                DEFAULT_WORKING_DIR,
            );
          });

          it('should set the path', () => {
            workingDirectory.path.should.eql(workingDir);
          });

          it('should create the working directory', () => {
            fsMock.getEntry(workingDir).type.should.eql(FS_DIRECTORY);
          });
        });
      });
    });
  });
});
