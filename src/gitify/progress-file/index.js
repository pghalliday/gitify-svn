import {
  PROGRESS_FILE,
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
import {
  Progress,
} from './progress';

const logger = getLogger(__filename);

export class ProgressFile {
  constructor(workingDir) {
    this.path = join(workingDir, PROGRESS_FILE);
  }

  async load() {
    try {
      logger.debug(`Reading progress file: ${this.path}`);
      const json = await promisify(readFile)(this.path, 'utf8');
      this.progress = new Progress(JSON.parse(json));
    } catch (err) {
      logger.debug(`Error reading progress file: ${err}`);
      logger.debug('Initialising progress');
      this.progress = new Progress();
    }
  }

  async save() {
    // eslint-disable-next-line max-len
    logger.debug(`Writing state to progress file: ${this.progress.lastRevision}`);
    await promisify(writeFile)(
        this.path,
        JSON.stringify(this.progress.export(), null, 2),
    );
  }
}
