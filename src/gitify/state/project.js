import loggerFactory from '../../logger';
import git from '../git';

const logger = loggerFactory.create(__filename);

export function projectFactory({
}) {
  return class Project {
    static async create({
      svnRepository,
      svnPath,
      name,
    }) {
      // eslint-disable-next-line max-len
      logger.debug(`Creating a new project: ${svnRepository}: ${svnPath}: ${name}`);
      const project = new Project({
        svnRepository,
        svnPath,
        name,
      });
      await project._init();
      return project;
    }

    constructor({
      svnRepository,
      svnPath,
      name,
      exported,
    }) {
      if (exported) {
        this._import(exported);
      } else {
        this.svnRepository = svnRepository;
        this.svnPath = svnPath;
        this.name = name;
      }
    }

    _import(exported) {
      logger.debug(`Importing project`);
      logger.debug(exported);
      this.svnRepository = exported.svnRepository;
      this.svnPath = exported.svnPath;
      this.name = exported.name;
    }

    export() {
      logger.debug(`Exporting project`);
      const exported = {
        svnRepository: this.svnRepository,
        svnPath: this.svnPath,
        name: this.name,
      };
      logger.debug(exported);
      return exported;
    }

    async _init() {
      await git.create({});
    }
  };
}

const Project = projectFactory({
});
export default Project;
