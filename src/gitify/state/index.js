import {
  mapValues,
} from 'lodash';
import {
  exportObject,
  importObject,
} from './lib/utils';
import {
  PROMPT_REPOSITORY_URL,
  PROMPT_REPOSITORY_NAME,
} from '../../constants';
import loggerFactory from '../../logger';
import prompt from '../prompt';
import stateFile from './state-file';
import repositoriesDirectory from './repositories-directory';

const logger = loggerFactory.create(__filename);

export function stateFactory({
  SvnRepository,
}) {
  return class State {
    async init() {
      await repositoriesDirectory.init();
      const exported = await stateFile.read();
      if (exported) {
        this._import(exported);
      } else {
        logger.debug('Creating State');
        this.svnRepositories = {};
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
      name,
      url,
    }) {
      logger.info(`Adding new SVN repository: ${name}: ${url}`);
      const svnRepository = await SvnRepository.create({
        name,
        url,
      });
      this.svnRepositories[svnRepository.uuid] = svnRepository;
      return svnRepository;
    }

    async _promptForNext() {
      const url = await prompt.input(PROMPT_REPOSITORY_URL);
      const name = await prompt.input(PROMPT_REPOSITORY_NAME);
      const svnRepository = await this.addSvnRepository({
        name,
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


// initialise the state singleton
import svnRepositoryFactory from './svn-repository';
import projectFactory from './project';
import Git from '../git';
const Project = projectFactory({
  Git,
});
const SvnRepository = svnRepositoryFactory({
  Project,
});
const State = stateFactory({
  SvnRepository,
});
const state = new State();
export default state;
