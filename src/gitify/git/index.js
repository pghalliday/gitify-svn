export default class Git {
  constructor({
    folder,
    name,
  }) {
    this.folder = folder;
    this.name = name;
  }

  async init() {
    throw new Error('Git: init: not implemented yet');
  }
}
