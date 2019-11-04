import {
  mapValues,
} from 'lodash';
import {
  ROOT_PROJECT_NAME,
  promptConfirmRoot,
} from '../../constants';
import {
  exportObject,
  importObject,
} from './lib/utils';
import {
  getLogger,
} from '../../logger';
import prompt from '../prompt';
import svn from '../svn';

const logger = getLogger(__filename);

export default function svnRepositoryFactory({
  Project,
}) {
  return class SvnRepository {
    static async create({
      url,
      name,
    }) {
      logger.debug(`Creating SvnRepository: ${url}: ${name}`);
      const svnRepository = new SvnRepository({
        url,
        name,
      });
      await svnRepository._init();
      return svnRepository;
    }

    constructor({
      url,
      name,
      exported,
    }) {
      if (exported) {
        this._import(exported);
      } else {
        this.url = url;
        this.name = name;
      }
    }

    _import(exported) {
      logger.debug(`Importing SvnRepository`);
      logger.debug(exported);
      this.url = exported.url;
      this.name = exported.name;
      this.last = exported.last;
      this.uuid = exported.uuid;
      this.projects = mapValues(
          exported.projects,
          importObject(Project)
      );
    }

    export() {
      logger.debug(`Exporting SvnRepository`);
      const exported = {
        url: this.url,
        name: this.name,
        last: this.last,
        uuid: this.uuid,
        projects: mapValues(this.projects, exportObject),
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
      this.projects = {
        [ROOT_PROJECT_NAME]: await Project.create({
          svnRepository: this.uuid,
          svnPath: '/',
          name: ROOT_PROJECT_NAME,
        }),
      };
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
      logger.info(`${this.name}: Resolving revision: ${this._next.revision}`);
      this.last = this._next.revision;
      delete this._next;
    }
  };
}

