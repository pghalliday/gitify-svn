import {
  mapValues,
} from 'lodash';
import {
  exportObject,
  importObject,
} from './lib/utils';
import {
  getLogger,
} from '../../logger';

const logger = getLogger(__filename);

export default function stateFactory({
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
      this.svnRepositories[name] = await SvnRepository.create({
        name,
        url,
      });
    }

    async getNext() {
    }
  };
}
