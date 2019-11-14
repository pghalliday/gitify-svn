import loggerFactory from '../../logger';
import uuidv1 from 'uuid/v1';
import repositoriesDirectory from './repositories-directory';
import git from '../git';
import prompt from '../prompt';
import {
  promptProjectRemote,
} from '../../constants';
import {
  join,
} from 'path';

const logger = loggerFactory.create(__filename);

export function projectFactory({
}) {
  return class Project {
    static async create({
      svnUrl,
      revision,
      parent,
      path,
      name,
      email,
      date,
    }) {
      // eslint-disable-next-line max-len
      logger.debug(`Creating a new project for SVN url: ${svnUrl}`);
      const project = new Project({
        parent,
        path,
      });
      await project._init({
        svnUrl,
        revision,
        name,
        email,
        date,
      });
      return project;
    }

    constructor({
      parent,
      path,
      exported,
    }) {
      if (exported) {
        this._import(exported);
      } else {
        this.parent = parent;
        this.path = path;
        this.uuid = uuidv1();
      }
    }

    _import(exported) {
      logger.debug(`Importing project`);
      logger.debug(exported);
      this.uuid = exported.uuid;
      this.path = exported.path;
      this.remote = exported.remote;
      this.revisionMap = exported.revisionMap;
    }

    export() {
      logger.debug(`Exporting project`);
      const exported = {
        uuid: this.uuid,
        path: this.path,
        remote: this.remote,
        revisionMap: this.revisionMap,
      };
      logger.debug(exported);
      return exported;
    }

    async _init({
      svnUrl,
      revision,
      name,
      email,
      date,
    }) {
      this.remote = await prompt.input(promptProjectRemote(svnUrl));
      this.revisionMap[this.path] = {
        [revision]: await git.newProject({
          remote: this.remote,
          path: this.repositoryPath,
          name,
          email,
          date,
          importedDescriptor: {
            svnUrl,
            revision,
          },
        }),
      };
    }

    async _checkClone() {
      // check the clone exists

    }

    async addDirectory(path) {
      await this._checkClone();
      // TODO: deal with branches
      // TODO: check if path is in a submodule
      // make path relative
      path = join(this.repositoryPath, `.${path}`);
      await git.createDirectory({
        path,
      });
    }

    removeFromParent() {
      this.parent.removeProject(this);
      delete this.parent;
      delete this.path;
    }

    addToParent(parent, path) {
      if (this.parent) {
        throw new Error('A project cannot have 2 parents');
      }
      parent.addProject(path, this);
      this.parent = parent;
      this.path = path;
    }

    changePath(parent, path) {
      this.removeFromParent();
      this.addToParent(parent, path);
    }

    get repositoryPath() {
      return join(this.repositoriesDirectory.path, this.uuid);
    }

    get svnPath() {
      return join(this.parent.svnPath, this.path);
    }

    async commit({
      revision,
      name,
      email,
      date,
      message,
    }) {
      // TODO: deal with branches
      // TODO: commit source submodules
      // TODO: update destination submodules in the right order
      await git.addAll({
        path: this.repositoryPath,
      });
      this.revisionMap[this.path] = {
        [revision]: await git.commit({
          path: this.repositoryPath,
          name,
          email,
          date,
          message,
        }),
      };
    }

    async push() {
      await git.pushAll({
        path: this.repositoryPath,
      });
    }
  };
}

const Project = projectFactory({
});
export default Project;
