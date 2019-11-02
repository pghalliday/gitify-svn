import workingDirectory from '../working-directory';
import mkdirp from 'mkdirp';
import {
  join,
} from 'path';
import {
  promisify,
} from 'util';
import {
  REPOSITORIES_DIR,
} from '../../constants';

export class RepositoriesDirectory {
  async get() {
    const workingDir = await workingDirectory.get();
    const dir = join(workingDir, REPOSITORIES_DIR);
    await promisify(mkdirp)(dir);
    return dir;
  }
}

const repositoriesDirectory = new RepositoriesDirectory();
export default repositoriesDirectory;
