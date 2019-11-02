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
  stubResolves,
} from '../../../helpers/utils';
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

      describe('get', () => {
        let fsMock;
        let get;
        let r;

        beforeEach(async () => {
          get = sinon.stub(workingDirectory, 'get');
          stubResolves(get, workingDir);
          fsMock = new FsMock({});
          r = await repositoriesDirectory.get();
        });

        afterEach(() => {
          fsMock.restore();
          get.restore();
        });

        it('should return the repositories directory', () => {
          r.should.eql(join(workingDir, REPOSITORIES_DIR));
        });

        it('should create the repositories directory', () => {
          fsMock.getEntry(join(workingDir, REPOSITORIES_DIR))
              .type.should.eql(FS_DIRECTORY);
        });
      });
    });
  });
});
