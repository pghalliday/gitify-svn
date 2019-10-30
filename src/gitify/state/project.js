export default class Project {
  static async create({
    git,
    svnRepository,
    svnPath,
    name,
  }) {
    const project = new Project({
      git,
      svnRepository,
      svnPath,
      name,
    });
    await project.init();
    return project;
  }

  constructor({
    git,
    svnRepository,
    svnPath,
    name,
    exported,
  }) {
    if (exported) {
      this.import(exported);
    } else {
      this.svnRepository = svnRepository;
      this.svnPath = svnPath;
      this.name = name;
    }
    this.git = git.create({
      folder: this.svnRepository,
      name: this.name,
    });
  }

  import(exported) {
    this.svnRepository = exported.svnRepository;
    this.svnPath = exported.svnPath;
    this.name = exported.name;
  }

  export() {
    return {
      svnRepository: this.svnRepository,
      svnPath: this.svnPath,
      name: this.name,
    };
  }

  async init() {
    await this.git.init();
  }
}
