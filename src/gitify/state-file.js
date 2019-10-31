import {
  STATE_FILE,
} from '../constants';
import {
  getLogger,
} from '../logger';
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

export default function stateFileFactory({
  State,
}) {
  return class StateFile {
    constructor(workingDir) {
      this.path = join(workingDir, STATE_FILE);
    }

    async load() {
      try {
        logger.debug(`Reading state file: ${this.path}`);
        const json = await promisify(readFile)(this.path, 'utf8');
        this.state = new State({
          exported: JSON.parse(json),
        });
      } catch (err) {
        logger.debug(`Error reading state file: ${err}`);
        logger.debug('Initialising state');
        this.state = new State({});
      }
    }

    async save() {
      logger.debug('Writing state to state file');
      await promisify(writeFile)(
          this.path,
          JSON.stringify(this.state.export(), null, 2),
      );
    }
  };
}
