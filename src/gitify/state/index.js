import SvnRepository from './svn-repository';
import {
  mapValues,
} from 'lodash';
import {
  exportObject,
  importObject,
} from './utils';

export default class State {
  constructor({
    svn,
    git,
    exported,
  }) {
    this.svn = svn;
    this.git = git;
    if (exported) {
      this.import(exported);
    } else {
      this.init();
    }
  }

  init() {
    this.svnRepositories = {};
  }

  import(exported) {
    this.svnRepositories = mapValues(
        exported.svnRepositories,
        importObject(SvnRepository, {
          svn: this.svn,
          git: this.git,
        }),
    );
  }

  export() {
    return {
      svnRepositories: {
        ...mapValues(this.svnRepositories, exportObject),
      },
    };
  }

  async addSvnRepository(name, url) {
    this.svnRepositories[name] = await SvnRepository.create({
      svn: this.svn,
      git: this.git,
      name,
      url,
    });
  }
}
