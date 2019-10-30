import {
  mapValues,
} from 'lodash';
import Project from './project';
import {
  ROOT_PROJECT_NAME,
} from './constants';

export default class SvnRepository {
  static async create({
    svn,
    git,
    url,
    name,
  }) {
    const svnRepository = new SvnRepository({
      svn,
      git,
      url,
      name,
    });
    await svnRepository.init();
    return svnRepository;
  }

  constructor({
    svn,
    git,
    url,
    name,
    exported,
  }) {
    if (exported) {
      this.import(exported);
    } else {
      this.url = url;
      this.name = name;
    }
    this.git = git;
    this.svn = svn.create(this.url);
  }

  import(exported) {
    this.url = exported.url;
    this.name = exported.name;
    this.next = exported.next;
    this.projects = mapValues(exported.projects, importObject(Project, {
      git: this.git,
    }));
  }

  export() {
    return {
      url: this.url,
      name: this.name,
      next: this.next,
      projects: mapValues(this.projects, exportObject),
    };
  }

  async init() {
    // Get the first revision
    this.next = await this.svn.revision({
      revision: 1,
    });
    // Create the root git project for the main tree
    this.projects = {
      [ROOT_PROJECT_NAME]: await Project.create({
        git: this.git,
        svnRepository: this.name,
        svnPath: '/',
        name: ROOT_PROJECT_NAME,
      }),
    };
  }

  async resolve() {
    this.next = await this.svn.revision({
      revision: this.next.revision + 1,
    });
  }
}

