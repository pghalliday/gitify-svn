import loggerFactory from '../../logger';
import git from '../git';

const logger = loggerFactory.create(__filename);

export function projectFactory({
}) {
  return class Project {
    static async create({
      url,
      uuid,
    }) {
      // eslint-disable-next-line max-len
      logger.debug(`Creating a new project: ${url}: ${uuid}`);
      const project = new Project({
        uuid,
      });
      await project._init(url);
      return project;
    }

    constructor({
      uuid,
      url,
      exported,
    }) {
      if (exported) {
        this._import(exported);
      } else {
        this.uuid = uuid;
      }
    }

    _import(exported) {
      logger.debug(`Importing project`);
      logger.debug(exported);
      this.uuid = exported.uuid;
      this.remote = exported.remote;
      this.commit = exported.commit;
    }

    export() {
      logger.debug(`Exporting project`);
      const exported = {
        uuid: this.uuid,
        remote: this.remote,
        commit: this.commit,
      };
      logger.debug(exported);
      return exported;
    }

    async _init(url) {
      const response = await git.create({
        uuid: this.uuid,
        url,
      });
      this.remote = response.remote;
      this.commit = response.commit;
    }
  };
}

const Project = projectFactory({
});
export default Project;
