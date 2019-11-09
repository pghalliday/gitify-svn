import workingDirectory from './working-directory';
import state from './state';
import git from './git';
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
  git.init({
    binary: gitBinary,
  });
  await workingDirectory.init({
    path: directory,
    usePromptFile,
  });
  await svn.init({
    username,
    password,
    binary: svnBinary,
  });
  await state.init({
    repositories,
  });
}
