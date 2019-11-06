import Binary from './binary';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import {
  writeFile,
} from 'fs';
import {
  promisify,
} from 'util';
import {
  join,
} from 'path';
import {
  IMPORTED_DESCRIPTOR_FILE,
  INITIAL_COMMIT_MESSAGE,
} from '../constants';

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
      importedDescriptor,
    }) {
      const subPath = join(parent, path);
      const importedDescriptorFile = join(subPath, IMPORTED_DESCRIPTOR_FILE);
      const subOptions = {
        cwd: subPath,
      };
      const parentOptions = {
        cwd: parent,
      };
      await promisify(mkdirp)(subPath);
      await this.initProject({
        path: subPath,
      });
      await promisify(writeFile)(importedDescriptorFile, importedDescriptor);
      await this.binary.exec([
        'add',
        IMPORTED_DESCRIPTOR_FILE,
      ], subOptions);
      await this.binary.exec([
        'commit',
        '-m',
        INITIAL_COMMIT_MESSAGE,
      ], subOptions);
      await this.binary.exec([
        'remote',
        'add',
        'origin',
        remote,
      ], subOptions);
      await this.binary.exec([
        'push',
        '--set-upstream',
        'origin',
        'master',
      ], subOptions);
      await promisify(rimraf)(subPath);
      await this.binary.exec([
        'submodule',
        'add',
        remote,
        path,
      ], parentOptions);
      await this.binary.exec([
        'submodule',
        'update',
        '--init',
        '--recursive',
      ], parentOptions);
      return (await this.binary.exec([
        'rev-parse',
        'master',
      ], {
        cwd: subOptions,
      })).trim();
    }
  };
}

const Git = gitFactory({
  Binary,
});
const git = new Git();
export default git;
