import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
export const APPLICATION_NAME = packageName;
export const APPLICATION_VERSION = packageVersion;
export const DEFAULT_WORKING_DIR = 'gitify-svn-working';
export const DEFAULT_SVN_BINARY = 'svn';
export const PROGRESS_FILE = 'gitify-svn-progress.json';
export const USAGE_TEXT = `
Usage: ${APPLICATION_NAME} [options]

Gitifies an SVN repository interactively

Options:
`;
