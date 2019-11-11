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
import loggerFactory from '../logger';
import {
  IMPORTED_DESCRIPTOR_FILE,
  INITIAL_COMMIT_MESSAGE,
  promptConfirmOverwriteProject,
  promptConfirmForcePush,
  DEFAULT_NAME,
  DEFAULT_EMAIL,
} from '../constants';

const logger = loggerFactory.create(__filename);

const execOptions = ({
  cwd,
  name = DEFAULT_NAME,
  email = DEFAULT_EMAIL,
  date,
}) => ({
  cwd,
  env: {
    ...process.env,
    GIT_COMMITTER_NAME: name,
    GIT_COMMITTER_EMAIL: email,
    GIT_COMMITTER_DATE: date,
    GIT_AUTHOR_NAME: name,
    GIT_AUTHOR_EMAIL: email,
    GIT_AUTHOR_DATE: date,
  },
});

export function gitFactory({
  Binary,
}) {
  return class Git {
    init({
      binary,
      root,
    }) {
      logger.debug(`root: ${root}`);
      logger.debug(`binary: ${binary}`);
      this.root = root;
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
      ], execOptions({
        cwd: join(this.root, path),
      }));
    }

    async pushNewRepository({
      remote,
      path,
      name,
      email,
      date,
      importedDescriptor,
    }) {
      const subPath = join(this.root, path);
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
      const options = execOptions({
        cwd: subPath,
        name,
        email,
        date,
      });
      await promisify(mkdirp)(subPath);
      await this.initRepository({
        path,
      });
      await promisify(writeFile)(
          importedDescriptorFile,
          JSON.stringify(importedDescriptor, null, 2),
      );
      await this.binary.exec([
        'add',
        IMPORTED_DESCRIPTOR_FILE,
      ], options);
      await this.binary.exec([
        'commit',
        '-m',
        INITIAL_COMMIT_MESSAGE,
      ], options);
      await this.binary.exec([
        'remote',
        'add',
        'origin',
        remote,
      ], options);
      await this.binary.exec([
        'push',
        '--force',
        '--set-upstream',
        'origin',
        'master',
      ], options);
      return (await this.binary.exec([
        'rev-parse',
        'master',
      ], options)).trim();
    }

    async newSubmodule({
      remote,
      parent,
      path,
      name,
      email,
      date,
      importedDescriptor,
    }) {
      const commit = await this.pushNewRepository({
        remote,
        path: join(parent, path),
        name,
        email,
        date,
        importedDescriptor,
      });
      const parentPath = join(this.root, parent);
      const subPath = join(parentPath, path);
      const options = execOptions({
        cwd: parentPath,
        name,
        email,
        date,
      });
      await promisify(rimraf)(subPath);
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
      return commit;
    }
  };
}

const Git = gitFactory({
  Binary,
});
const git = new Git();
export default git;
