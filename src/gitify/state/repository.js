// TODO:
//  - Delete directory
//  - Write file
//  - Delete file
//  - Add gitignore entry
//  - delete gitignore entry
//  - merge ref
//  - Add submodule
//  - Remove submodule
//
import loggerFactory from '../../logger';
import uuidv1 from 'uuid/v1';
import repositoriesDirectory from './repositories-directory';
import git from '../git';
import prompt from '../prompt';
import {
  promptProjectRemote,
} from '../../constants';
import {
  join,
} from 'path';

const logger = loggerFactory.create(__filename);

export default class Repository {
  static async create({
    initialBranch,
    remote,
    ref,
    subPath,
  }) {
    // eslint-disable-next-line max-len
    const repository = new Repository({});
    await repository._init({
      initialBranch,
      remote,
      ref,
      subPath,
    });
    return repository;
  }

  constructor({
    exported,
  }) {
    if (exported) {
      this._import(exported);
    } else {
      this.uuid = uuidv1();
      this.refs = {
        tags: {},
        branches: {},
      };
      this.tagsToDeleteFromRemote = {};
    }
  }

  _import(exported) {
    logger.debug(`Importing repository`);
    logger.debug(exported);
    this.uuid = exported.uuid;
    this.remote = exported.remote;
    this.refs = exported.refs;
  }

  export() {
    logger.debug(`Exporting repository`);
    const exported = {
      uuid: this.uuid,
      remote: this.remote,
      refs: this.refs,
    };
    logger.debug(exported);
    return exported;
  }

  async _init({
    initialBranch,
    remote,
    ref,
    subPath,
  }) {
    this.remote = await prompt.input(promptProjectRemote(svnUrl));
    if (subPath) {
      await this._initFromSubPath({
        initialBranch,
        remote,
        ref,
        subPath,
      });
    } else {
      await this._initNew({
        initialBranch,
      });
    }
  }

  async _initNew({
    initialBranch,
  }) {
    logger.debug(`Initialising new repository: ${this.uuid}`);
    await this._clone();
    if (await git.isNotEmpty({
      path: this._path,
    })) {
      // Ask if the history should be deleted
      if (await prompt.confirm(promptConfirmReinit(this.remote), false)) {
        logger.debug(`Resetting respository history: ${this.uuid}`);
        await git.reinit({
          path: this._path,
        });
      }
    }
    // eslint-disable-next-line max-len
    logger.debug(`Commit and push an initialised repository: ${this.uuid}: ${initialBranch}`);
    this.refs.branches[initialBranch] = await git.pushEmpty({
      path: this._path,
      initialBranch,
    });
    this._setCurrentBranch(initialBranch);
  }

  // NB. the commit refs in this new repository
  // will not match any previously created
  // revisionMap
  async _initFromSubPath({
    remote,
    subPath,
  }) {
    // eslint-disable-next-line max-len
    logger.debug(`Creating a new repository from a sub path: ${this.uuid}: ${remote}: ${subPath}`);
    await git.clone({
      path: this._path,
      remote,
    });
    await git.subDirectoryFilter({
      path: this._path,
      subPath,
    });
    await git.setRemote({
      path: this._path,
      remote: this.remote,
    });
    this.refs = await git.getRefs({
      path: this._path,
    });
    this._setCurrentBranch(await git.getBranch({
      path: this._path,
    }));
    await this.push();
  }

  async _clone() {
    logger.debug(`Cloning repository: ${this.uuid}: ${this.remote}`);
    await git.clone({
      path: this._path,
      remote: this.remote,
    });
  }

  async _checkClone() {
    try {
      await promisify(stat)(this._path);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      logger.debug(`Repository missing: ${this.uuid}`);
      // clone not present so clone now
      await this._clone();
    }
  }

  get _path() {
    return join(repositoriesDirectory.path, this.uuid);
  }

  _setCurrentBranch(name) {
    delete this._currentTag;
    this._currentBranch = name;
  }

  _setCurrentTag(name) {
    delete this._currentBranch;
    this._currentTag = name;
  }

  async branch({
    name,
    ref,
  }) {
    await this._checkClone();
    if (git.branchExists({
      path: this._path,
      name,
    })) {
      // confirm branch removal
      if (await prompt.confirm(promptConfirmDeleteBranch(name), false)) {
        logger.debug(`Removing old branch: ${this.uuid}: ${name}`);
        await git.deleteBranch({
          path: this._path,
          name,
        });
      } else {
        throw new Error('User cancelled');
      }
    }
    logger.debug(`Branching repository: ${this.uuid}: ${name}: ${ref}`);
    await git.branch({
      path: this._path,
      remote: this.remote,
      name,
      ref,
    });
    this.refs.branches[name] = ref;
  }

  async switchToBranch({
    name,
  }) {
    await this._checkClone();
    logger.debug(`Switching to branch: ${this.uuid}: ${name}`);
    const ref = await git.switchToBranch({
      path: this._path,
      name,
    });
    if (ref !== this.refs.branches[name]) {
      // The only real scenario where this does not match
      // is if we rolled back some changes in the migration
      // state.
      // Confirm that this branch should be rolled back to
      // the saved ref.
      if (prompt.confirm(promptRollbackBranch(name), false)) {
        logger.debug(`Resetting branch: ${this.uuid}: ${name}`);
        await git.hardReset({
          path: this._path,
          ref: this.refs.branches[name],
        });
      } else {
        throw new Error('User cancelled');
      }
    }
    this._setCurrentBranch(name);
  }

  async tag({
    name,
    ref,
  }) {
    await this._checkClone();
    if (git.tagExists({
      path: this._path,
      name,
    })) {
      // confirm tag removal
      if (await prompt.confirm(promptConfirmDeleteTag(name), false)) {
        logger.debug(`Removing old tag: ${this.uuid}: ${name}`);
        await git.deleteTag({
          path: this._path,
          name,
        });
        // will need to delete the tag from the remote before
        // we can push the new tag
        this.tagsToDeleteFromRemote[name] = true;
      } else {
        throw new Error('User cancelled');
      }
    }
    logger.debug(`Tagging repository: ${this.uuid}: ${name}: ${ref}`);
    this.refs.tags[name] = await git.tag({
      path: this._path,
      name,
      ref,
    });
  }

  async switchToTag({
    name,
  }) {
    await this._checkClone();
    logger.debug(`Switching to tag: ${this.uuid}: ${name}`);
    const ref = await git.switchToTag({
      path: this._path,
      name,
    });
    if (ref !== this.refs.tags[name]) {
      // The only real scenario where this does not match
      // is if we rolled back some changes in the migration
      // state.
      // Confirm that this tag should be rolled back to
      // the saved ref.
      if (prompt.confirm(promptRollbackTag(name), false)) {
        logger.debug(`Resetting tag: ${this.uuid}: ${name}`);
        await git.hardReset({
          path: this._path,
          ref: this.refs.tags[name],
        });
      } else {
        throw new Error('User cancelled');
      }
    }
    this._setCurrentTag(name);
  }

  async _forceTag() {
    logger.debug(`Force update tag: ${this.uuid}: ${this._currentTag}`);
    await git.forceTag({
      path: this._path,
      name: this._currentTag,
    });
    // will need to delete this tag from the remote before
    // we can push it again
    this.tagsToDeleteFromRemote[this._currentTag] = true;
  }

  async addDirectory(path) {
    logger.debug(`Add new directory: ${this.uuid}: ${path}`);
    // make path relative
    path = join(this._path, `.${path}`);
    await git.createDirectory({
      path,
    });
  }

  async addAndCommit({
    author,
    date,
    message,
  }) {
    // eslint-disable-next-line max-len
    logger.debug(`Add and commit all: ${this.uuid}: ${author}: ${date}: ${message}`);
    const ref = await git.addAndCommit({
      path: this._path,
      name,
      email,
      date,
      message,
    });
    if (this._currentBranch) {
      this.refs.branches[this._currentBranch] = ref;
    }
    if (this._currentTag) {
      this.refs.tag[this._currentTag] = ref;
      await this._forceTag();
    }
    return ref;
  }

  async push() {
    // delete the tags flagged for removal
    // from the remote
    await Promise.all(
        Object.keys(this.tagsToDeleteFromRemote).map(async (name) => {
          logger.debug(`Delete old tag from remote: ${this.uuid}: ${name}`);
          await git.deleteTagFromRemote({
            path: this._path,
            name,
          });
          delete this.tagsToDeleteFromRemote[name];
        })
    );
    // always force push all branches as any
    // scenario that rewrites history
    // will have already been confirmed
    logger.debug(`Force push all branches: ${this.uuid}: ${name}`);
    await git.forcePushAll({
      path: this._path,
    });
    // push the tags as well
    logger.debug(`Push all tags: ${this.uuid}: ${name}`);
    await git.pushTags({
      path: this._path,
    });
  }
}
