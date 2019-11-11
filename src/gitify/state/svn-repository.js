import {
  join,
} from 'path';
import {
  REPOSITORIES_DIR,
} from '../../constants';
import {
  exportObject,
  importObject,
} from './lib/utils';
import loggerFactory from '../../logger';
import svn from '../svn';
import Project from './project';

const logger = loggerFactory.create(__filename);

export function svnRepositoryFactory({
  Project,
}) {
  return class SvnRepository {
    static async create({
      url,
      uuid,
      name,
      email,
      date,
    }) {
      logger.debug(`Creating SvnRepository: ${url}: ${uuid}`);
      const svnRepository = new SvnRepository({
        url,
        uuid,
      });
      await svnRepository._init({
        name,
        email,
        date,
      });
      return svnRepository;
    }

    constructor({
      url,
      uuid,
      exported,
    }) {
      if (exported) {
        this._import(exported);
      } else {
        this.url = url;
        this.uuid = uuid;
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
      name,
      email,
      date,
    }) {
      this.last = 0;
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
