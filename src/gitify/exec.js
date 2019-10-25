import _ from 'lodash';
import {
  APPLICATION_NAME,
  DEFAULT_WORKING_DIR,
} from '../constants';
import {
  getLogger,
} from '../logger';
import {
  Svn,
} from './svn';
import {
  Progress,
} from './progress';
import inquirer from 'inquirer';

const logger = getLogger(__filename);

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
    uuid: info.repositoryUuid,
  };
}

// istanbul ignore next
async function processRevision({
  svn,
  progress,
  revision,
}) {
  logger.info(`processing revision: ${revision}`);
  // Get the changes to properties
  const diffProps = await svn.diffProps({revision});
  logger.info(diffProps);
  // Get the changes to files
  const log = await svn.log({revision});
  logger.info(log);
  log.changes.forEach(async (change) => {
    const info = await svn.info({
      path: change.path,
      revision,
    });
    logger.info(info);
  });
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
  const progress = new Progress({workingDir});
  await progress.init();
  repository = repository || progress.state.repositoryUrl;
  const lastRevision = progress.state.lastRevision || 0;
  const required = await getRequired({
    repository,
    username,
    password,
  });
  const {svn, head, uuid} = await checkRepository({
    ...required,
    svnBinary,
  });
  progress.setRepository({
    repositoryUrl: svn.repository,
    repositoryUuid: uuid,
    headRevision: head,
  });
  // force a write of the new repository info to the progress file
  await progress.revisionProcessed(lastRevision);
  // eslint-disable-next-line max-len
  logger.info(`Converting ${svn.repository} up to revision ${head} in working directory: ${workingDir}`);
  await processRevision({
    svn,
    progress,
    revision: lastRevision + 1,
  });
}
