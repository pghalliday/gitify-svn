import Binary from './binary';

export function gitFactory({
  Binary,
}) {
  return class Git {
    init({
      binary,
    }) {
      this.binary = new Binary({
        binary,
        args: [],
      });
    }

    async create() {
      throw new Error('Git: create: not implemented yet');
    }
  };
}

const Git = gitFactory({
  Binary,
});
const git = new Git();
export default git;
