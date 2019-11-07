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
import prompt from './prompt';
import {
  IMPORTED_DESCRIPTOR_FILE,
  INITIAL_COMMIT_MESSAGE,
  promptConfirmOverwriteProject,
  promptConfirmForcePush,
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

    async initRepository({
      path,
    }) {
      await this.binary.exec([
        'init',
      ], {
        cwd: path,
      });
    }

    async pushNewRepository({
      remote,
      parent,
      path,
      importedDescriptor,
    }) {
      const subPath = join(parent, path);
      const confirmOverwite = await prompt.confirm(
          promptConfirmOverwriteProject(subPath),
          false,
      );
      if (!confirmOverwite) {
        throw new Error('User cancelled overwrite project');
      }
      const confirmForce = await prompt.confirm(
          promptConfirmForcePush(remote),
          false,
      );
      if (!confirmForce) {
        throw new Error('User cancelled force push');
      }
      await promisify(rimraf)(subPath);
      const importedDescriptorFile = join(
          subPath,
          IMPORTED_DESCRIPTOR_FILE,
      );
      const subOptions = {
        cwd: subPath,
      };
      await promisify(mkdirp)(subPath);
      await this.initRepository({
        path: subPath,
      });
      await promisify(writeFile)(
          importedDescriptorFile,
          JSON.stringify(importedDescriptor, null, 2),
      );
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
        '--force',
        '--set-upstream',
        'origin',
        'master',
      ], subOptions);
      return (await this.binary.exec([
        'rev-parse',
        'master',
      ], subOptions)).trim();
    }

    async newSubmodule({
      remote,
      parent,
      path,
      importedDescriptor,
    }) {
      const commit = await this.pushNewRepository({
        remote,
        parent,
        path,
        importedDescriptor,
      });
      const subPath = join(parent, path);
      const parentOptions = {
        cwd: parent,
      };
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
      return commit;
    }
  };
}

const Git = gitFactory({
  Binary,
});
const git = new Git();
export default git;
