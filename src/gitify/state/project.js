import loggerFactory from '../../logger';
import git from '../git';
import prompt from '../prompt';
import {
  promptProjectRemote,
} from '../../constants';

const logger = loggerFactory.create(__filename);

export function projectFactory({
}) {
  return class Project {
    static async create({
      svnUrl,
      revision,
      parent,
      path,
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
      this.commit = exported.commit;
    }

    export() {
      logger.debug(`Exporting project`);
      const exported = {
        parent: this.parent,
        path: this.path,
        remote: this.remote,
        commit: this.commit,
      };
      logger.debug(exported);
      return exported;
    }

    async _init({
      svnUrl,
      revision,
    }) {
      this.remote = await prompt.input(promptProjectRemote(svnUrl));
      this.commit = await git.newSubmodule({
        remote: this.remote,
        parent: this.parent,
        path: this.path,
        importedDescriptor: {
          svnUrl,
          revision,
        },
      });
    }
  };
}

const Project = projectFactory({
});
export default Project;
