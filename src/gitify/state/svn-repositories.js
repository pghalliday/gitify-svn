import {
  mapValues,
} from 'lodash';
import {
  exportObject,
  importObject,
} from './lib/utils';
import {
  PROMPT_REPOSITORY_URL,
} from '../../constants';
import loggerFactory from '../../logger';
import prompt from '../prompt';
import repositoriesDirectory from './repositories-directory';
import SvnRepository from './svn-repository';

const logger = loggerFactory.create(__filename);

export function svnRepositoriesFactory({
  SvnRepository,
}) {
  return class SvnRepositories {
    async init({
      exported,
      urls,
    }) {
      await repositoriesDirectory.init();
      if (exported) {
        this._import(exported);
      } else {
        logger.debug('Creating SvnRepositories');
        this.list = {};
      }
      for (let i = 0; i < urls.length; i++) {
        await this.add({
          url: urls[i],
        });
      }
    }

    _import(exported) {
      logger.debug('Importing SvnRepositories');
      logger.debug(exported);
      this.list = mapValues(
          exported,
          importObject(SvnRepository),
      );
    }

    export() {
      logger.debug('Exporting State');
      const exported = {
        ...mapValues(this.list, exportObject),
      };
      logger.debug(exported);
      return exported;
    }

    async add({
      url,
    }) {
      let svnRepository = await SvnRepository.create({
        url,
      });
      if (this.list[svnRepository.uuid]) {
        // eslint-disable-next-line max-len
        logger.debug(`SVN repository already exists: ${svnRepository.url}: ${svnRepository.uuid}`);
        svnRepository = this.list[svnRepository.uuid];
      } else {
        // eslint-disable-next-line max-len
        logger.info(`Adding new SVN repository: ${svnRepository.url}: ${svnRepository.uuid}`);
        this.list[svnRepository.uuid] = svnRepository;
      }
      return svnRepository;
    }

    async _promptForNext() {
      const url = await prompt.input(PROMPT_REPOSITORY_URL);
      return this.add({
        url,
      });
    }

    async getNext() {
      const keys = Object.keys(this.list);
      let next;
      if (keys.length === 0) {
        logger.info('No SVN repositories have been added yet');
        next = await this._promptForNext();
      } else {
        for (let i = 0; i < keys.length; i++) {
          const svnRepository = this.list[keys[i]];
          next = await compareDates(next, svnRepository);
        }
      }
      while (!(await next.getNext())) {
        // eslint-disable-next-line max-len
        logger.info('No SVN repositories have a next revision, add another to continue');
        next = await this._promptForNext();
      }
      return next;
    }

    get length() {
      return Object.keys(this.list).length;
    }

    get(uuid) {
      return this.list[uuid];
    }
  };
}

async function compareDates(repo1, repo2) {
  if (!repo1) return repo2;
  const rev1 = await repo1.getNext();
  const rev2 = await repo2.getNext();
  if (!rev1) return repo2;
  if (!rev2) return repo1;
  return rev1.date < rev2.date ? rev1 : rev2;
}

const SvnRepositories = svnRepositoriesFactory({
  SvnRepository,
});
const svnRepositories = new SvnRepositories();
export default svnRepositories;
