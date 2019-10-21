import {
  Svn,
} from './svn';

// istanbul ignore next
export async function exec({
  repository,
  workingDir,
  username,
  password,
  binary,
}) {
  const svn = new Svn({
    username,
    password,
    repository,
    binary,
  });
  const log = await svn.info({path: '', revision: 'HEAD'});
  console.log(log);
  // first check if we are looking at the root of the repository
  // if not then offer to switch to the root of the repository or exit
  //
  // Get the first revision (0 or 1?)
  return {
    repository,
    workingDir,
    username,
    password,
  };
}
