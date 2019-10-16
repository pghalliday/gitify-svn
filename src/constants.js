export const WORKING_DIRECTORY_VAR = 'GITIFY_SVN_WORKING_DIRECTORY';
export const DEFAULT_WORKING_DIR = 'gitify-svn-working';
export const USAGE_TEXT = `
Usage: gitify-svn [options] <repository>

Gitifies an SVN repository interactively

Environment Variables:

${WORKING_DIRECTORY_VAR}

<repository>: The root of the SVN repository to gitify

Options:
`;
// eslint-disable-next-line max-len
export const MULTIPLE_WORKING_DIRECTORIES_ERROR = 'Working directory specified multiple times';
export const NO_REPOSITORY_ERROR = 'Repository not specified';
