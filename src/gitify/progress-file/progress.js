import {
  relative,
} from 'path';
import {
  getLogger,
} from '../../logger';
import {
  INITIAL_PROGRESS_STATE,
} from '../../constants';

const logger = getLogger(__filename);

export class Progress {
  constructor(state) {
    logger.debug(state);
    this.state = state || INITIAL_PROGRESS_STATE;
  }

  export() {
    return this.state;
  }

  revisionProcessed(revision) {
    this.state = {
      ...this.state,
      lastRevision: revision,
    };
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
    this.state = {
      ...this.state,
      repositoryUrl: repositoryUrl,
      repositoryUuid: repositoryUuid,
      headRevision: headRevision,
    };
  }

  addProject({
    name,
    path,
  }) {
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
    this.state = {
      ...this.state,
      projects: {
        ...projects,
        [name]: path,
      },
    };
  }

  inProject(subPath) {
    const projects = this.projects;
    const names = Object.keys(projects);
    for (let i = 0; i < names.length; i++) {
      const projectPath = projects[names[i]];
      const relativePath = relative(projectPath, subPath);
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
    return this.state.projects;
  }

  get projectCount() {
    return Object.keys(this.projects).length;
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
    return this.lastRevision + 1;
  }
}
