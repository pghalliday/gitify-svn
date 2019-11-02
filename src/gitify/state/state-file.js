import workingDirectory from '../working-directory';
import {
  STATE_FILE,
} from '../../constants';
import {
  getLogger,
} from '../../logger';
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

const logger = getLogger(__filename);

export class StateFile {
  async _file() {
    const workingDir = await workingDirectory.get();
    return join(workingDir, STATE_FILE);
  }

  async read() {
    const file = await this._file();
    logger.debug(`Reading state file: ${file}`);
    try {
      const json = await promisify(readFile)(file, 'utf8');
      return JSON.parse(json);
    } catch (err) {
      console.log(err);
      logger.debug(`Error reading state file: ${err}`);
    }
  }

  async write(exported) {
    logger.debug('Writing state to state file');
    const file = await this._file();
    await promisify(writeFile)(
        file,
        JSON.stringify(exported, null, 2),
    );
  }
}

const stateFile = new StateFile();
export default stateFile;
