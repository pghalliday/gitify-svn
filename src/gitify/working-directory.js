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
  init({
    workingDirectory,
  }) {
    this.workingDirectory = workingDirectory;
  }

  async get() {
    if (!this.workingDirectory) {
      this.workingDirectory = await prompt.input(
          PROMPT_WORKING_DIRECTORY,
          DEFAULT_WORKING_DIR,
      );
    }
    await promisify(mkdirp)(this.workingDirectory);
    return this.workingDirectory;
  }
}

const workingDirectory = new WorkingDirectory();
export default workingDirectory;
