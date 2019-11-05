import loggerFactory from '../logger';
import workingDirectory from './working-directory';
import state from './state';
import svn from './svn';

const logger = loggerFactory.create(__filename);

export async function exec({
  repository,
  username,
  password,
  ['working-dir']: workingDir,
  ['svn-binary']: svnBinary,
}) {
  await workingDirectory.init({
    path: workingDir,
  });
  loggerFactory.init();
  logger.info('Starting...');
  await svn.init({
    username,
    password,
    svnBinary,
  });
  // eslint-disable-next-line max-len
  const repositories = Array.isArray(repository) ? repository : repository ? [repository] : [];
  await state.init({
    repositories,
  });
}
