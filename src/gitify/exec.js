import _ from 'lodash';
import {
  APPLICATION_NAME,
  DEFAULT_WORKING_DIR,
} from '../constants';
import {
  Svn,
} from './svn';
import inquirer from 'inquirer';

// istanbul ignore next
async function getWorkingDir(workingDir) {
  return workingDir || (await inquirer.prompt({
    type: 'input',
    name: 'workingDir',
    message: 'Enter the path to the working directory to use',
    default: DEFAULT_WORKING_DIR,
  })).workingDir;
}

// istanbul ignore next
async function getRequired({
  repository,
  username,
  password,
}) {
  return {
    repository,
    username,
    password,
    ...(await inquirer.prompt([{
      type: 'input',
      name: 'repository',
      message: 'Enter the SVN repository root URL',
      when: () => _.isUndefined(repository),
    }, {
      type: 'input',
      name: 'username',
      message: 'Enter the SVN username',
      when: () => _.isUndefined(username),
    }, {
      type: 'password',
      name: 'password',
      // eslint-disable-next-line max-len
      message: (answers) => `Enter the SVN password for user: ${username || answers.username}`,
      when: () => _.isUndefined(password),
    }])),
  };
}

// istanbul ignore next
async function checkRepository({
  repository,
  username,
  password,
  svnBinary,
}) {
  let svn = new Svn({
    repository,
    username,
    password,
    svnBinary,
  });
  // first check if we are looking at the root of the repository
  // if not then offer to switch to the root of the repository or exit
  const info = await svn.info({path: '', revision: 'HEAD'});
  if (info.repositoryRoot !== repository) {
    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'confirmRepositoryRoot',
      // eslint-disable-next-line max-len
      message: `${APPLICATION_NAME} only works on the repository root, do you wish to switch to ${info.repositoryRoot}`,
      default: false,
    });
    if (answer.confirmRepositoryRoot) {
      svn = new Svn({
        username,
        password,
        repository: info.repositoryRoot,
        svnBinary,
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
  username,
  password,
  ['working-dir']: workingDir,
  ['svn-binary']: svnBinary,
}) {
  workingDir = await getWorkingDir(workingDir);
  // TODO: check working directory for progress
  const required = await getRequired({
    repository,
    username,
    password,
  });
  const {svn, head} = await checkRepository({
    ...required,
    svnBinary,
  });
  // eslint-disable-next-line max-len
  console.log(`Converting ${svn.repository} up to revision ${head} in working directory: ${workingDir}`);
}
