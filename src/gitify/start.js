import workingDirectory from './working-directory';
import state from './state';
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
  await state.init({
    repositories,
  });
}
