/* eslint-disable max-len */
import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
export const APPLICATION_NAME = packageName;
export const APPLICATION_VERSION = packageVersion;
export const DEFAULT_DIRECTORY = '.';
export const REPOSITORIES_DIR = 'repositories';
export const DEFAULT_GIT_BINARY = 'git';
export const DEFAULT_SVN_BINARY = 'svn';
export const DEFAULT_LOG_LEVEL = 'info';
export const DEFAULT_USE_PROMPT_FILE = false;
export const STATE_FILE = 'state.json';
export const IMPORTED_DESCRIPTOR_FILE = `${APPLICATION_NAME}.json`;
export const LOG_FILE = 'log.json';
export const PROMPT_FILE = 'prompts.json';
export const README_FILE = 'README.md';
export const USAGE_TEXT = `
Usage: ${APPLICATION_NAME} [options] [<directory>] 

Gitifies an SVN repository interactively. If directory is supplied then progress, etc will be saved there. Otherwise the current directory is used.

Options:
`;
export const README_TEXT = `#${APPLICATION_NAME} project

A ${APPLICATION_NAME} project converting the following SVN repositories to Git repositories:
`;
export const INITIAL_COMMIT_MESSAGE = `Initialised by ${APPLICATION_NAME}`;
export const PROMPT_REPOSITORY_URL = 'Enter the root URL of an SVN repository to convert';
export const promptConfirmRoot = (url) => `Do you wish to switch to the repository root: ${url}`;
export const PROMPT_SVN_USERNAME = 'Enter the SVN username for access to all repositories';
export const promptSvnPassword = (username) => `Enter the password for SVN user (${username})`;
export const promptProjectRemote = (url) => `Enter the git remote URL for ${url}`;
export const promptConfirmNonEmpty = (path) => `${path} is not an empty directory, are you sure you wish to run ${APPLICATION_NAME} here`;
export const promptConfirmOverwriteProject = (path) => `${path} will be removed and overwritten if it exists, are you sure you wish to continue`;
export const promptConfirmForcePush = (remote) => `${remote} will be overwritten with a force push, are you sure you wish to continue`;
