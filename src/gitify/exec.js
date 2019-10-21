import {
  APPLICATION_NAME,
} from '../constants';
import {
  Svn,
} from './svn';
import inquirer from 'inquirer';

// istanbul ignore next
async function resolveRepository({
  repository,
  workingDir,
  username,
  password,
  binary,
}) {
  let svn = new Svn({
    username,
    password,
    repository,
    binary,
  });
  // first check if we are looking at the root of the repository
  // if not then offer to switch to the root of the repository or exit
  const info = await svn.info({path: '', revision: 'HEAD'});
  if (info.repositoryRoot !== repository) {
    const answers = await inquirer.prompt({
      type: 'confirm',
      name: 'confirmRepositoryRoot',
      // eslint-disable-next-line max-len
      message: `${APPLICATION_NAME} only works on the repository root, do you wish to switch to ${info.repositoryRoot}`,
      default: false,
    });
    if (answers.confirmRepositoryRoot) {
      svn = new Svn({
        username,
        password,
        repository: info.repositoryRoot,
        binary,
      });
    } else {
      throw new Error('Cannot convert a sub-path of a Subversion repository');
    }
  }
  return {
    svn,
    head: info.revision,
  };
}

// istanbul ignore next
export async function exec({
  repository,
  workingDir,
  username,
  password,
  binary,
}) {
  const {svn, head} = await resolveRepository({
    repository,
    workingDir,
    username,
    password,
    binary,
  });
  console.log(`Converting ${svn.repository} up to revision ${head}`);
}
