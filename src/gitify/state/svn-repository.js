import {
  join,
} from 'path';
import {
  parseAuthor,
} from './lib/utils';
import {
  REPOSITORIES_DIR,
  promptConfirmRoot,
} from '../../constants';
import {
  exportObject,
  importObject,
} from './lib/utils';
import loggerFactory from '../../logger';
import svn from '../svn';
import prompt from '../prompt';
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
      const svnRepository = new SvnRepository({});
      await svnRepository._init({
        url,
      });
      return svnRepository;
    }

    constructor({
      exported,
    }) {
      if (exported) {
        this._import(exported);
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

    async _init({
      url,
    }) {
      this.last = 0;
      this.info = await svn.info({
        repository: url,
        path: '',
        revision: 0,
      });
      this.uuid = this.info.repositoryUuid;
      // check that the supplied url is the root of the repository
      if (this.info.repositoryRoot !== url) {
        logger.info('It is only possible to convert the repository root');
        const confirm = await prompt.confirm(
            promptConfirmRoot(this.info.repositoryRoot),
            true,
        );
        if (confirm) {
          url = this.info.repositoryRoot;
        } else {
          throw new Error('Can only convert the root of an SVN repository');
        }
      }
      this.url = url;
    }

    async initProject() {
      const date = this.info.lastChangedDate;
      const {name, email} = parseAuthor(this.info.lastChangedAuthor);
      this.project = await Project.create({
        svnUrl: this.url,
        revision: this.last,
        parent: '.',
        path: join(REPOSITORIES_DIR, this.uuid),
        name,
        email,
        date,
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

    async processNext() {
      logger.info(`${this.url}: Processing revision: ${this._next.revision}`);

      // TODO: apply the revision

      this.last = this._next.revision;
      delete this._next;
    }
  };
}

const SvnRepository = svnRepositoryFactory({
  Project,
});
export default SvnRepository;
