import workingDirectory from '../working-directory';
import promptFile from '../prompt-file';
import {
  STATE_FILE,
} from '../../constants';
import loggerFactory from '../../logger';
import {
  promisify,
} from 'util';
import {
  readFile,
  writeFile,
} from 'fs';
import {
  join,
} from 'path';

const logger = loggerFactory.create(__filename);

export class StateFile {
  async read() {
    this.path = join(workingDirectory.path, STATE_FILE);
    logger.debug(`Reading state file: ${this.path}`);
    try {
      const json = await promisify(readFile)(this.path, 'utf8');
      return JSON.parse(json);
    } catch (err) {
      logger.debug(`Error reading state file: ${err}`);
    }
  }

  async write(exported) {
    logger.debug('Writing state to state file');
    await promisify(writeFile)(
        this.path,
        JSON.stringify(exported, null, 2),
    );
    await promptFile.flush();
  }
}

const stateFile = new StateFile();
export default stateFile;
