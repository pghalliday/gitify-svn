import loggerFactory from '../../logger';
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
      }
    }

    _import(exported) {
      logger.debug(`Importing project`);
      logger.debug(exported);
      this.parent = exported.parent;
      this.path = exported.path;
      this.remote = exported.remote;
      this.revisionMap = exported.revisionMap;
    }

    export() {
      logger.debug(`Exporting project`);
      const exported = {
        parent: this.parent,
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
      this.revisionMap = {
        0: {
          master: await git.newSubmodule({
            remote: this.remote,
            parent: this.parent,
            path: this.path,
            name,
            email,
            date,
            importedDescriptor: {
              svnUrl,
              revision,
            },
          }),
        },
      };
    }

    async addDirectory(path) {
      // TODO: deal with branches
      // TODO: check if path is in a submodule
      // make path relative
      path = join(this.parent, this.path, `.${path}`);
      await git.createDirectory({
        path,
      });
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
      const path = join(this.parent, this.path);
      await git.addAll({
        path,
      });
      this.revisionMap[revision] = {
        master: await git.commit({
          path,
          name,
          email,
          date,
          message,
        }),
      };
      await git.pushAll({
        path,
      });
    }
  };
}

const Project = projectFactory({
});
export default Project;
