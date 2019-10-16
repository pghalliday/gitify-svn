export async function exec({
  repository,
  workingDir,
  username,
  password,
}) {
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
