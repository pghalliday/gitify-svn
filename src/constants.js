import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
export const APPLICATION_NAME = packageName;
export const APPLICATION_VERSION = packageVersion;
export const USERNAME_VAR = 'GITIFY_SVN_USERNAME';
export const PASSWORD_VAR = 'GITIFY_SVN_PASSWORD';
export const WORKING_DIRECTORY_VAR = 'GITIFY_SVN_WORKING_DIRECTORY';
export const DEFAULT_WORKING_DIR = 'gitify-svn-working';
export const USAGE_TEXT = `
Usage: ${APPLICATION_NAME} [options] <repository>

Gitifies an SVN repository interactively

Environment Variables:

${USERNAME_VAR}
${PASSWORD_VAR}
${WORKING_DIRECTORY_VAR}

<repository>: The root of the SVN repository to gitify

Options:
`;
// eslint-disable-next-line max-len
export const MULTIPLE_WORKING_DIRECTORIES_ERROR = 'Working directory specified multiple times';
export const NO_USERNAME_ERROR = 'Username not specified';
export const NO_PASSWORD_ERROR = 'Password not specified';
export const NO_REPOSITORY_ERROR = 'Repository not specified';
