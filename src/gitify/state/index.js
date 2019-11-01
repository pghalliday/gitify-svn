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
import {
  getLogger,
} from '../../logger';

const logger = getLogger(__filename);

export default function stateFactory({
  prompt,
  SvnRepository,
}) {
  return class State {
    constructor({
      exported,
    }) {
      if (exported) {
        this._import(exported);
      } else {
        this._init();
      }
      this.prompt = prompt;
    }

    _init() {
      logger.debug('Creating State');
      this.svnRepositories = {};
    }

    _import(exported) {
      logger.debug('Importing State');
      logger.debug(exported);
      this.svnRepositories = mapValues(
          exported.svnRepositories,
          importObject(SvnRepository),
      );
    }

    export() {
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
      const url = await this.prompt.input(PROMPT_REPOSITORY_URL);
      const name = await this.prompt.input(PROMPT_REPOSITORY_NAME);
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
        return this._promptForNext();
      } else {
        let next;
        for (let i = 0; i < keys.length; i++) {
          const svnRepository = this.svnRepositories[keys[i]];
          const revision = await svnRepository.getNext();
          next = compareDates(next, revision);
        }
        while (!next) {
          // eslint-disable-next-line max-len
          logger.info('No SVN repositories have a next revision, add another to continue');
          next = await this._promptForNext();
        }
        return next;
      }
    }
  };
}

function compareDates(revision1, revision2) {
  if (!revision1) return revision2;
  if (!revision2) return revision1;
  return revision1.date < revision2.date ? revision1 : revision2;
}
