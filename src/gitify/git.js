import Binary from './binary';
import {
  join,
} from 'path';

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

    async initProject({
      path,
    }) {
      await this.binary.exec([
        'init',
      ], {
        cwd: path,
      });
    }

    async addSubmodule({
      remote,
      parent,
      path,
    }) {
      const options = {
        cwd: parent,
      };
      await this.binary.exec([
        'submodule',
        'add',
        remote,
        path,
      ], options);
      await this.binary.exec([
        'submodule',
        'update',
        '--init',
        '--recursive',
      ], options);
      return (await this.binary.exec([
        'rev-parse',
        'master',
      ], {
        cwd: join(parent, path),
      })).trim();
    }
  };
}

const Git = gitFactory({
  Binary,
});
const git = new Git();
export default git;
