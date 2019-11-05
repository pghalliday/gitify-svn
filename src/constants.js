import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
export const APPLICATION_NAME = packageName;
export const APPLICATION_VERSION = packageVersion;
export const DEFAULT_WORKING_DIR = 'gitify-svn-working';
export const REPOSITORIES_DIR = 'repositories';
export const DEFAULT_GIT_BINARY = 'git';
export const DEFAULT_SVN_BINARY = 'svn';
export const DEFAULT_LOG_LEVEL = 'info';
export const STATE_FILE = 'state.json';
export const LOG_FILE = 'log.json';
export const USAGE_TEXT = `
Usage: ${APPLICATION_NAME} [options]

Gitifies an SVN repository interactively

Options:
`;
export const IMPORT_DESCRIPTOR_FILE = `${APPLICATION_NAME}.json`;
export const INITIAL_COMMIT_MESSAGE = `Initialised by ${APPLICATION_NAME}`;
// eslint-disable-next-line max-len
export const PROMPT_REPOSITORY_URL = 'Enter the root URL of an SVN repository to convert';
// eslint-disable-next-line max-len
export const promptConfirmRoot = (url) => `Do you wish to switch to the repository root: ${url}`;
// eslint-disable-next-line max-len
export const PROMPT_SVN_USERNAME = 'Enter the SVN username for access to all repositories';
// eslint-disable-next-line max-len
export const promptSvnPassword = (username) => `Enter the password for SVN user (${username})`;
// eslint-disable-next-line max-len
export const PROMPT_WORKING_DIRECTORY = 'Enter the path to the working directory';
// eslint-disable-next-line max-len
export const promptProjectRemote = (url) => `Enter the git remote URL for ${url}`;
// eslint-disable-next-line max-len
export const promptConfirmForcePush = (remote) => `About to force push to ${remote}. This will overwrite the upstream repository. Are you sure you wish to proceed`;
