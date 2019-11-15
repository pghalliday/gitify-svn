// TODO:
//  - Add submodule
//  - Remove submodule
//  - Add gitignore entry
//  - delete gitignore entry
//  - merge ref
//
import loggerFactory from '../../logger';
import uuidv1 from 'uuid/v1';
import repositoriesDirectory from './repositories-directory';
import git from '../git';
import prompt from '../prompt';
import {
  promptProjectRemote,
  promptConfirmReinit,
  promptConfirmDeleteBranch,
  promptConfirmRollbackBranch,
  promptConfirmDeleteTag,
  promptConfirmRollbackTag,
  SVN_MODULES_FILE,
  INITIAL_BRANCH,
} from '../../constants';
import {
  join,
} from 'path';
import {
  stat,
  readFile,
} from 'fs';
import {
  promisify,
} from 'util';
import {
  map,
} from 'lodash';

const logger = loggerFactory.create(__filename);

export default class Repository {
  static async create({
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
      this.submodules = {
        tags: {},
        branches: {},
      };
      this.branchesToDeleteFromRemote = {};
      this.tagsToDeleteFromRemote = {};
    }
  }

  _import(exported) {
    logger.debug(`Importing repository`);
    logger.debug(exported);
    this.uuid = exported.uuid;
    this.remote = exported.remote;
    this.refs = exported.refs;
    this.submodules = exported.submodules;
  }

  export() {
    logger.debug(`Exporting repository`);
    const exported = {
      uuid: this.uuid,
      remote: this.remote,
      refs: this.refs,
      submodules: this.submodules,
    };
    logger.debug(exported);
    return exported;
  }

  async _init({
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
      await this._initNew();
    }
  }

  async _initNew() {
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
      INITIAL_BRANCH,
    });
    this._setCurrentBranch(INITIAL_BRANCH);
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
    this.switchToBranch({
      name,
    });
    this.submodules.branches[name] = await this._readSubmodules();
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
      if (prompt.confirm(promptConfirmRollbackBranch(name), false)) {
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

  async renameBranch({
    name,
    newName,
  }) {
    await git.renameBranch({
      path: this._path,
      name,
      newName,
      remote,
    });
    this.branchesToDeleteFromRemote[name] = true;
    const branchRefs = this.refs.branches;
    branchRefs[newName] = branchRefs[name];
    delete branchRefs[name];
    const branchSubmodules = this.submodules.branches;
    branchSubmodules[newName] = branchSubmodules[name];
    delete branchSubmodules[name];
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
    this.switchToTag({
      name,
    });
    this.submodules.tags[name] = await this._readSubmodules();
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
      if (prompt.confirm(promptConfirmRollbackTag(name), false)) {
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

  async renameTag({
    name,
    newName,
  }) {
    await git.renameTag({
      path: this._path,
      name,
      newName,
      remote,
    });
    this.tagsToDeleteFromRemote[name] = true;
    const tagRefs = this.refs.tags;
    tagRefs[newName] = tagRefs[name];
    delete tagRefs[name];
    const tagSubmodules = this.submodules.tags;
    tagSubmodules[newName] = tagSubmodules[name];
    delete tagSubmodules[name];
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

  async writeFile(path, data) {
    logger.debug(`Write/overwrite a file: ${this.uuid}: ${path}`);
    // make path relative
    path = join(this._path, `.${path}`);
    await git.writeFile({
      path,
      data,
    });
  }

  async deleteFile(path) {
    logger.debug(`Delete a file: ${this.uuid}: ${path}`);
    // make path relative
    path = join(this._path, `.${path}`);
    await git.deleteFile({
      path,
    });
  }

  async addDirectory(path) {
    logger.debug(`Add new directory: ${this.uuid}: ${path}`);
    // make path relative
    path = join(this._path, `.${path}`);
    await git.addDirectory({
      path,
    });
  }

  async deleteDirectory(path) {
    logger.debug(`Delete directory: ${this.uuid}: ${path}`);
    // make path relative
    path = join(this._path, `.${path}`);
    await git.deleteDirectory({
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

  async _deleteRefsFromRemote(refs, deleteMethod) {
    await Promise.all(
        map(this[refs], async (flag, name) => {
          if (flag) {
            await git[deleteMethod]({
              path: this._path,
              name,
            });
          }
        })
    );
    this[refs] = {};
  }

  async push() {
    // delete the tags flagged for removal
    // from the remote
    logger.debug(`Delete old tags from remote: ${this.uuid}`);
    await this._deleteRefsFromRemote(
        'tagsToDeleteFromRemote',
        'deleteTagFromRemote'
    );
    // delete the branches flagged for removal
    // from the remote
    logger.debug(`Delete old branches from remote: ${this.uuid}`);
    await this._deleteRefsFromRemote(
        'branchesToDeleteFromRemote',
        'deleteBranchFromRemote'
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
