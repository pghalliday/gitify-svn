import {
  mapValues,
} from 'lodash';
import {
  ROOT_PROJECT_NAME,
} from '../../constants';
import {
  exportObject,
  importObject,
} from './lib/utils';
import {
  getLogger,
} from '../../logger';

const logger = getLogger(__filename);

export default function svnRepositoryFactory({
  Project,
  Svn,
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
      this.svn = new Svn({
        url: this.url,
      });
    }

    _import(exported) {
      logger.debug(`Importing SvnRepository`);
      logger.debug(exported);
      this.url = exported.url;
      this.name = exported.name;
      this.last = exported.last;
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
        projects: mapValues(this.projects, exportObject),
      };
      logger.debug(exported);
      return exported;
    }

    async _init() {
      this.last = 0;
      // Create the root git project for the main tree
      this.projects = {
        [ROOT_PROJECT_NAME]: await Project.create({
          svnRepository: this.name,
          svnPath: '/',
          name: ROOT_PROJECT_NAME,
        }),
      };
    }

    async getNext() {
      if (!this._next) {
        this._next = await this.svn.revision({
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

