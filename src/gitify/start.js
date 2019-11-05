import loggerFactory from '../logger';
import workingDirectory from './working-directory';
import state from './state';
import git from './git';
import svn from './svn';

const logger = loggerFactory.create(__filename);

export async function start({
  repository,
  username,
  password,
  ['working-dir']: workingDir,
  ['git-binary']: gitBinary,
  ['svn-binary']: svnBinary,
}) {
  await workingDirectory.init({
    path: workingDir,
  });
  loggerFactory.init();
  logger.info('Starting...');
  git.init({
    binary: gitBinary,
  });
  await svn.init({
    username,
    password,
    binary: svnBinary,
  });
  // eslint-disable-next-line max-len
  const repositories = Array.isArray(repository) ? repository : repository ? [repository] : [];
  await state.init({
    repositories,
  });
}
