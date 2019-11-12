import Binary from '../binary';
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
import utils from './lib/utils';
import prompt from '../prompt';
import loggerFactory from '../../logger';
import {
  IMPORTED_DESCRIPTOR_FILE,
  INITIAL_COMMIT_MESSAGE,
  promptConfirmOverwriteProject,
  promptConfirmForcePush,
} from '../../constants';

const logger = loggerFactory.create(__filename);

const commitEnv = ({
  name,
  email,
  date,
}) => ({
  ...process.env,
  GIT_COMMITTER_NAME: name,
  GIT_COMMITTER_EMAIL: email,
  GIT_COMMITTER_DATE: date,
  GIT_AUTHOR_NAME: name,
  GIT_AUTHOR_EMAIL: email,
  GIT_AUTHOR_DATE: date,
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

    _realPath(...path) {
      return join(this.root, ...path);
    }

    async getCommit({
      path,
    }) {
      return (await this.binary.exec([
        'rev-parse',
        'HEAD',
      ], {
        cwd: this._realPath(path),
      })).trim();
    }

    async addAll({
      path,
    }) {
      await this.binary.exec([
        'add',
        '-A',
      ], {
        cwd: this._realPath(path),
      });
    }

    async commit({
      path,
      name,
      email,
      date,
      message,
    }) {
      await this.binary.exec([
        'commit',
        '-m',
        message,
      ], {
        cwd: this._realPath(path),
        env: commitEnv({
          name,
          email,
          date,
        }),
      });
      return await this.getCommit({
        path,
      });
    }

    async pushAll({
      path,
    }) {
      await this.binary.exec([
        'push',
        '--all',
      ], {
        cwd: this._realPath(path),
      });
    }

    async initRepository({
      path,
    }) {
      await this.binary.exec([
        'init',
      ], {
        cwd: this._realPath(path),
      });
    }

    async pushNewRepository({
      remote,
      path,
      name,
      email,
      date,
      importedDescriptor,
    }) {
      const realPath = this._realPath(path);
      const confirmOverwite = await prompt.confirm(
          promptConfirmOverwriteProject(realPath),
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
      await promisify(rimraf)(realPath);
      const importedDescriptorFile = join(
          realPath,
          IMPORTED_DESCRIPTOR_FILE,
      );
      const options = {
        cwd: realPath,
      };
      await promisify(mkdirp)(realPath);
      await this.initRepository({
        path,
      });
      await promisify(writeFile)(
          importedDescriptorFile,
          JSON.stringify(importedDescriptor, null, 2),
      );
      await this.addAll({
        path,
      });
      const commit = await this.commit({
        message: INITIAL_COMMIT_MESSAGE,
        path,
        name,
        email,
        date,
      });
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
      return commit;
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
      const parentPath = this._realPath(parent);
      const subPath = join(parentPath, path);
      const options = {
        cwd: parentPath,
      };
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

    async createDirectory({
      path,
    }) {
      path = this._realPath(path);
      await promisify(mkdirp)(path);
      await utils.checkEmpty(path);
    }
  };
}

const Git = gitFactory({
  Binary,
});
const git = new Git();
export default git;
