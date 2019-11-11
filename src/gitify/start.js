import workingDirectory from './working-directory';
import svnRepositories from './state/svn-repositories';
import svn from './svn';

export async function start({
  repositories,
  username,
  password,
  directory,
  gitBinary,
  svnBinary,
  usePromptFile,
}) {
  await workingDirectory.init({
    path: directory,
    gitBinary,
    usePromptFile,
  });
  await svn.init({
    username,
    password,
    binary: svnBinary,
  });
  await svnRepositories.init({
    repositories,
  });
  await svnRepositories.migrate();
}
