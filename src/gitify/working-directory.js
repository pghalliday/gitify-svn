import prompt from './prompt';
import mkdirp from 'mkdirp';
import {
  promisify,
} from 'util';
import {
  PROMPT_WORKING_DIRECTORY,
  DEFAULT_WORKING_DIR,
} from '../constants';

export class WorkingDirectory {
  async init({
    path,
  }) {
    this.path = path;
    if (!this.path) {
      this.path = await prompt.input(
          PROMPT_WORKING_DIRECTORY,
          DEFAULT_WORKING_DIR,
      );
    }
    await promisify(mkdirp)(this.path);
  }
}

const workingDirectory = new WorkingDirectory();
export default workingDirectory;
