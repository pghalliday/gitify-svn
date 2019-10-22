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

export class Progress {
  constructor({workingDir}) {
    this.workingDir = workingDir;
  }

  async write() {
    await promisify(writeFile)(
        path.join(this.workingDir, PROGRESS_FILE),
        JSON.stringify(this.state, null, 2),
    );
  }

  async init() {
    await promisify(mkdirp)(this.workingDir);
    const progressFile = path.join(this.workingDir, PROGRESS_FILE);
    try {
      const json = await promisify(readFile)(progressFile, 'utf8');
      this.state = JSON.parse(json);
    } catch (err) {
      this.state = {};
      await this.write();
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
      throw new Error(`Repository UUIDs do not match: ${currentUuid} : ${repositoryUuid}`);
    }
    this.state.repositoryUrl = repositoryUrl;
    this.state.repositoryUuid = repositoryUuid;
    this.state.headRevision = headRevision;
  }
}
