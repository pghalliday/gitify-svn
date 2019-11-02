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
  async init() {
    this.path = join(workingDirectory.path, REPOSITORIES_DIR);
    await promisify(mkdirp)(this.path);
  }
}

const repositoriesDirectory = new RepositoriesDirectory();
export default repositoriesDirectory;
