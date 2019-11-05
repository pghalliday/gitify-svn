import Binary from './binary';
import mkdirp from 'mkdirp';
import {
  promisify,
} from 'util';
import {
  join,
} from 'path';
import {
  writeFile,
} from 'fs';
import prompt from './prompt';
import repositoriesDirectory from './state/repositories-directory';
import {
  IMPORT_DESCRIPTOR_FILE,
  promptProjectRemote,
  INITIAL_COMMIT_MESSAGE,
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

    async create({
      url,
      uuid,
    }) {
      let confirm = false;
      while (!confirm) {
        const remote = await prompt.input(promptProjectRemote(url));
        confirm = await prompt.confirm(promptConfirmForcePush(remote), false);
        if (confirm) {
          const cwd = join(repositoriesDirectory.path, uuid);
          const importDescriptorFile = join(cwd, IMPORT_DESCRIPTOR_FILE);
          const options = {
            cwd,
          };
          await promisify(mkdirp)(cwd);
          await this.binary.exec([
            'init',
          ], options);
          await this.binary.exec([
            'remote',
            'add',
            'origin',
            remote,
          ], options);
          await promisify(writeFile)(importDescriptorFile, JSON.stringify({
            url,
            uuid,
          }, null, 2));
          await this.binary.exec([
            'add',
            IMPORT_DESCRIPTOR_FILE,
          ], options);
          await this.binary.exec([
            'commit',
            '-m',
            INITIAL_COMMIT_MESSAGE,
          ], options);
          await this.binary.exec([
            'push',
            '--force',
            '--set-upstream',
            'origin',
            'master',
          ], options);
          const commit = (await this.binary.exec([
            'rev-parse',
            'master',
          ], options)).trim();
          return {
            remote,
            commit,
          };
        }
      }
    }
  };
}

const Git = gitFactory({
  Binary,
});
const git = new Git();
export default git;
