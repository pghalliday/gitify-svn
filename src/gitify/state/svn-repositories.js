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
import stateFile from './state-file';
import repositoriesDirectory from './repositories-directory';
import SvnRepository from './svn-repository';

const logger = loggerFactory.create(__filename);

export function svnRepositoriesFactory({
  SvnRepository,
}) {
  return class SvnRepositories {
    async init({
      repositories,
    }) {
      await repositoriesDirectory.init();
      const exported = await stateFile.read();
      if (exported) {
        this._import(exported);
      } else {
        logger.debug('Creating SvnRepositories');
        this.list = {};
      }
      for (let i = 0; i < repositories.length; i++) {
        await this.add({
          url: repositories[i],
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

    _export() {
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
        await svnRepository.initProject();
        this.list[svnRepository.uuid] = svnRepository;
        await stateFile.write(this._export());
      }
      return svnRepository;
    }

    async _promptForNext() {
      const url = await prompt.input(PROMPT_REPOSITORY_URL);
      return this.add({
        url,
      });
    }

    async _getNext() {
      const keys = Object.keys(this.list);
      let next;
      for (let i = 0; i < keys.length; i++) {
        next = await compareDates(next, this.list[keys[i]]);
      }
      while (!next || !(await next.getNext())) {
        // eslint-disable-next-line max-len
        logger.info('No known SVN repositories have a next revision, add one to continue');
        next = await this._promptForNext();
      }
      return next;
    }

    async processNext() {
      const svnRepository = await this._getNext();

      // TODO: Check changes to externals for new SVN
      // repositories (then return as we won't want to
      // process this revision till the other respositories
      // have caught up)

      await svnRepository.processNext();
      await stateFile.write(this._export());
    }

    get length() {
      return Object.keys(this.list).length;
    }

    get(uuid) {
      return this.list[uuid];
    }

    // istanbul ignore next
    async migrate() {
      while (true) {
        await svnRepositories.processNext();
      }
    }
  };
}

async function compareDates(repo1, repo2) {
  if (!repo1) return repo2;
  const rev1 = await repo1.getNext();
  const rev2 = await repo2.getNext();
  if (!rev1) return repo2;
  if (!rev2) return repo1;
  return rev1.date < rev2.date ? repo1 : repo2;
}

const SvnRepositories = svnRepositoriesFactory({
  SvnRepository,
});
const svnRepositories = new SvnRepositories();
export default svnRepositories;
