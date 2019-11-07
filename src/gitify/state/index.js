import {
  mapValues,
} from 'lodash';
import {
  exportObject,
  importObject,
} from './lib/utils';
import {
  PROMPT_REPOSITORY_URL,
  promptConfirmRoot,
} from '../../constants';
import loggerFactory from '../../logger';
import prompt from '../prompt';
import svn from '../svn';
import stateFile from './state-file';
import repositoriesDirectory from './repositories-directory';
import SvnRepository from './svn-repository';

const logger = loggerFactory.create(__filename);

export function stateFactory({
  SvnRepository,
}) {
  return class State {
    async init({
      repositories,
    }) {
      await repositoriesDirectory.init();
      const exported = await stateFile.read();
      if (exported) {
        this._import(exported);
      } else {
        logger.debug('Creating State');
        this.svnRepositories = {};
      }
      for (let i = 0; i < repositories.length; i++) {
        await this.addSvnRepository({
          url: repositories[i],
        });
      }
    }

    _import(exported) {
      logger.debug('Importing State');
      logger.debug(exported);
      this.svnRepositories = mapValues(
          exported.svnRepositories,
          importObject(SvnRepository),
      );
    }

    _export() {
      logger.debug('Exporting State');
      const exported = {
        svnRepositories: {
          ...mapValues(this.svnRepositories, exportObject),
        },
      };
      logger.debug(exported);
      return exported;
    }

    async addSvnRepository({
      url,
    }) {
      const info = await svn.info({
        repository: url,
        path: '',
        revision: 0,
      });
      const uuid = info.repositoryUuid;
      // check that the supplied url is the root of the repository
      if (info.repositoryRoot !== url) {
        logger.info('It is only possible to convert the repository root');
        const confirm = await prompt.confirm(
            promptConfirmRoot(info.repositoryRoot),
            true,
        );
        if (confirm) {
          url = info.repositoryRoot;
        } else {
          throw new Error('Can only convert the root of an SVN repository');
        }
      }
      let svnRepository = this.svnRepositories[uuid];
      if (svnRepository) {
        // eslint-disable-next-line max-len
        logger.debug(`SVN repository already added: ${url}: ${uuid}`);
      } else {
        logger.info(`Adding new SVN repository: ${url}`);
        svnRepository = await SvnRepository.create({
          url,
          uuid: uuid,
        });
        this.svnRepositories[uuid] = svnRepository;
        await stateFile.write(this._export());
      }
      return svnRepository;
    }

    async _promptForNext() {
      const url = await prompt.input(PROMPT_REPOSITORY_URL);
      const svnRepository = await this.addSvnRepository({
        url,
      });
      return svnRepository.getNext();
    }

    async getNext() {
      const keys = Object.keys(this.svnRepositories);
      if (keys.length === 0) {
        logger.info('No SVN repositories have been added yet');
        this._next = await this._promptForNext();
      } else {
        for (let i = 0; i < keys.length; i++) {
          const svnRepository = this.svnRepositories[keys[i]];
          const revision = await svnRepository.getNext();
          this._next = compareDates(this._next, revision);
        }
      }
      while (!this._next) {
        // eslint-disable-next-line max-len
        logger.info('No SVN repositories have a next revision, add another to continue');
        this._next = await this._promptForNext();
      }
      return this._next;
    }

    async resolve() {
      this.svnRepositories[this._next.uuid].resolve();
      delete this._next;
      await stateFile.write(this._export());
    }
  };
}

function compareDates(revision1, revision2) {
  if (!revision1) return revision2;
  if (!revision2) return revision1;
  return revision1.date < revision2.date ? revision1 : revision2;
}

const State = stateFactory({
  SvnRepository,
});
const state = new State();
export default state;
