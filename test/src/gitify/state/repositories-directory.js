import {
  RepositoriesDirectory,
} from '../../../../src/gitify/state/repositories-directory';
import workingDirectory from '../../../../src/gitify/working-directory';
import {
  join,
} from 'path';
import {
  FsMock,
  FS_DIRECTORY,
} from '../../../mocks/fs';
import {
  REPOSITORIES_DIR,
} from '../../../../src/constants';

const workingDir = 'workingDir';

describe('src', () => {
  describe('gitify', () => {
    describe('repositoriesDirectory', () => {
      let repositoriesDirectory;

      beforeEach(() => {
        repositoriesDirectory = new RepositoriesDirectory();
      });

      describe('init', () => {
        let fsMock;

        beforeEach(async () => {
          workingDirectory.path = workingDir;
          fsMock = new FsMock({});
          await repositoriesDirectory.init();
        });

        afterEach(() => {
          fsMock.restore();
        });

        it('should set the path', () => {
          repositoriesDirectory.path.should.eql(
              join(workingDir, REPOSITORIES_DIR)
          );
        });

        it('should create the repositories directory', () => {
          fsMock.getEntry(join(workingDir, REPOSITORIES_DIR))
              .type.should.eql(FS_DIRECTORY);
        });
      });
    });
  });
});
