import path from 'path';
import {
  writeFile,
  readFile,
} from 'fs';
import {
  promisify,
} from 'util';
import {
  PROGRESS_FILE,
} from '../../constants';
import {
  getLogger,
} from '../../logger';

const logger = getLogger(__filename);

class Progress {
  async write() {
    // eslint-disable-next-line max-len
    logger.debug(`Writing state to progress file: ${this.state.lastRevision}`);
    await promisify(writeFile)(
        path.join(this.workingDir, PROGRESS_FILE),
        JSON.stringify(this.state, null, 2),
    );
  }

  async init(workingDir) {
    this.workingDir = workingDir;
    const progressFile = path.join(this.workingDir, PROGRESS_FILE);
    try {
      logger.debug(`Reading progress file: ${progressFile}`);
      const json = await promisify(readFile)(progressFile, 'utf8');
      this.state = JSON.parse(json);
    } catch (err) {
      logger.debug(`Error reading progress file: ${err}`);
      logger.debug('Initialising progress');
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
    logger.debug(`progress: Setting the repository: ${repositoryUrl}: ${repositoryUuid}: ${headRevision}`);
    this.state.repositoryUrl = repositoryUrl;
    this.state.repositoryUuid = repositoryUuid;
    this.state.headRevision = headRevision;
  }

  addProject({
    name,
    path,
  }) {
    this.state.projects = this.state.projects || {};
    const projects = this.state.projects;
    if (projects[name]) {
      // eslint-disable-next-line max-len
      throw new Error(`Project ${name} already exists with path ${projects[name]}`);
    }
    const project = this.inProject(path);
    if (project) {
      throw new Error(
          // eslint-disable-next-line max-len
          `Project ${name} with path ${path} would be contained by project ${project.name} with path ${project.path}`
      );
    }
    projects[name] = path;
  }

  inProject(subPath) {
    const projects = this.projects;
    const names = Object.keys(projects);
    for (let i = 0; i < names.length; i++) {
      const projectPath = projects[names[i]];
      const relativePath = path.relative(projectPath, subPath);
      if (!relativePath.startsWith('..')) {
        return {
          name: names[i],
          path: projectPath,
          relativePath,
        };
      }
    }
    return;
  }

  get projects() {
    return this.state.projects || {};
  }

  get projectCount() {
    const projects = this.projects;
    return Object.keys(projects).length;
  }

  get repositoryUrl() {
    return this.state.repositoryUrl;
  }

  get headRevision() {
    return this.state.headRevision;
  }

  get lastRevision() {
    return this.state.lastRevision;
  }

  get nextRevision() {
    return this.state.lastRevision + 1;
  }
}

export const progress = new Progress;
