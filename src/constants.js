import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
export const APPLICATION_NAME = packageName;
export const APPLICATION_VERSION = packageVersion;
export const DEFAULT_WORKING_DIR = 'gitify-svn-working';
export const DEFAULT_SVN_BINARY = 'svn';
export const DEFAULT_LOG_LEVEL = 'info';
export const STATE_FILE = 'state.json';
export const LOG_FILE = 'log.json';
export const ROOT_PROJECT_NAME = '_root';
export const USAGE_TEXT = `
Usage: ${APPLICATION_NAME} [options]

Gitifies an SVN repository interactively

Options:
`;
// eslint-disable-next-line max-len
export const PROMPT_REPOSITORY_URL = 'Enter the root URL of an SVN repository to convert';
export const PROMPT_REPOSITORY_NAME = 'Enter a name for the SVN repository';
// eslint-disable-next-line max-len
export const promptConfirmRoot = (url) => `Do you wish to switch to the repository root: ${url}`;
// eslint-disable-next-line max-len
export const PROMPT_SVN_USERNAME = 'Enter the SVN username for access to all repositories';
// eslint-disable-next-line max-len
export const promptSvnPassword = (username) => `Enter the password for SVN user (${username})`;


export const PROGRESS_FILE = 'gitify-svn-progress.json';
export const INITIAL_PROGRESS_STATE = {
  lastRevision: 0,
  projects: {},
};
