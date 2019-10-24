import mkdirp from 'mkdirp';
import path from 'path';
import {
  writeFile,
  readFile,
} from 'fs';
import promisify from '../utils/promisify';
import {
  PROGRESS_FILE,
} from '../../constants';
import {
  initFileLogger,
  logger,
} from '../logger';

export class Progress {
  constructor({workingDir}) {
    this.workingDir = workingDir;
  }

  async write() {
    // eslint-disable-next-line max-len
    logger.info(`progress: Writing state to progress file: ${this.state.lastRevision}`);
    await promisify(writeFile)(
        path.join(this.workingDir, PROGRESS_FILE),
        JSON.stringify(this.state, null, 2),
    );
  }

  async init() {
    logger.info(`progress: Creating working directory: ${this.workingDir}`);
    await promisify(mkdirp)(this.workingDir);
    initFileLogger(this.workingDir);
    const progressFile = path.join(this.workingDir, PROGRESS_FILE);
    try {
      logger.info(`progress: Reading progress file: ${progressFile}`);
      const json = await promisify(readFile)(progressFile, 'utf8');
      this.state = JSON.parse(json);
    } catch (err) {
      logger.debug(`progress: Error reading progress file: ${err}`);
      logger.info('progress: Initialising progress');
      this.state = {};
    }
  }

  async revisionProcessed(revision) {
    this.state.lastRevision = revision;
    await this.write();
  }

  setRepository({
    repositoryUrl,
    repositoryUuid,
    headRevision,
  }) {
    const currentUuid = this.state.repositoryUuid;
    if (currentUuid && currentUuid !== repositoryUuid) {
      // eslint-disable-next-line max-len
      throw new Error(`progress: Repository UUIDs do not match: ${currentUuid} : ${repositoryUuid}`);
    }
    // eslint-disable-next-line max-len
    logger.info(`progress: Setting the repository: ${repositoryUrl}: ${repositoryUuid}: ${headRevision}`);
    this.state.repositoryUrl = repositoryUrl;
    this.state.repositoryUuid = repositoryUuid;
    this.state.headRevision = headRevision;
  }
}
