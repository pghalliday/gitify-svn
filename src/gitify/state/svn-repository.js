import {
  promptConfirmRoot,
} from '../../constants';
import {
  exportObject,
  importObject,
} from './lib/utils';
import loggerFactory from '../../logger';
import prompt from '../prompt';
import svn from '../svn';
import Project from './project';

const logger = loggerFactory.create(__filename);

export function svnRepositoryFactory({
  Project,
}) {
  return class SvnRepository {
    static async create({
      url,
    }) {
      logger.debug(`Creating SvnRepository: ${url}`);
      const svnRepository = new SvnRepository({
        url,
      });
      await svnRepository._init();
      return svnRepository;
    }

    constructor({
      url,
      exported,
    }) {
      if (exported) {
        this._import(exported);
      } else {
        this.url = url;
      }
    }

    _import(exported) {
      logger.debug(`Importing SvnRepository`);
      logger.debug(exported);
      this.url = exported.url;
      this.last = exported.last;
      this.uuid = exported.uuid;
      this.project = importObject(Project)(exported.project);
    }

    export() {
      logger.debug(`Exporting SvnRepository`);
      const exported = {
        url: this.url,
        last: this.last,
        uuid: this.uuid,
        project: exportObject(this.project),
      };
      logger.debug(exported);
      return exported;
    }

    async _init() {
      this.last = 0;
      const info = await svn.info({
        repository: this.url,
        path: '',
        revision: 0,
      });
      // check that the supplied url is the root of the repository
      if (info.repositoryRoot !== this.url) {
        logger.info('It is only possible to convert the repository root');
        const confirm = await prompt.confirm(
            promptConfirmRoot(info.repositoryRoot),
            true,
        );
        if (confirm) {
          this.url = info.repositoryRoot;
        } else {
          throw new Error('Can only convert the root of an SVN repository');
        }
      }
      this.uuid = info.repositoryUuid;
      this.project = await Project.create({
        uuid: this.uuid,
        url: this.url,
      });
    }

    async getNext() {
      if (!this._next) {
        this._next = await svn.revision({
          repository: this.url,
          revision: this.last + 1,
        });
      }
      return this._next;
    }

    resolve() {
      logger.info(`${this.url}: Resolving revision: ${this._next.revision}`);
      this.last = this._next.revision;
      delete this._next;
    }
  };
}

const SvnRepository = svnRepositoryFactory({
  Project,
});
export default SvnRepository;
