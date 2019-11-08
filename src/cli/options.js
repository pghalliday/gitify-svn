import minimist from 'minimist';
import cliclopts from 'cliclopts';
import {
  isUndefined,
} from 'lodash';
import {
  USAGE_TEXT,
  DEFAULT_GIT_BINARY,
  DEFAULT_SVN_BINARY,
  DEFAULT_LOG_LEVEL,
  DEFAULT_USE_PROMPT_FILE,
  DEFAULT_DIRECTORY,
} from '../constants';
import loggerFactory from '../logger';

const logger = loggerFactory.create(__filename);

const cliOpts = cliclopts([{
  name: 'repository',
  abbr: 'r',
  // eslint-disable-next-line max-len
  help: 'An SVN repository root URL to convert (can be specified multiple times',
}, {
  name: 'username',
  abbr: 'u',
  help: 'The SVN username',
}, {
  name: 'password',
  abbr: 'p',
  help: 'The SVN password',
}, {
  name: 'git-binary',
  abbr: 'g',
  help: 'The Git binary to use',
  default: DEFAULT_GIT_BINARY,
}, {
  name: 'svn-binary',
  abbr: 's',
  help: 'The SVN binary to use',
  default: DEFAULT_SVN_BINARY,
}, {
  name: 'use-prompt-file',
  abbr: 'q',
  boolean: true,
  // eslint-disable-next-line max-len
  help: 'Whether to use the responses in the prompt file (to replay a previous run)',
  default: DEFAULT_USE_PROMPT_FILE,
}, {
  name: 'log-level',
  abbr: 'l',
  help: 'Set the log level for the console and log file',
  default: DEFAULT_LOG_LEVEL,
}, {
  name: 'help',
  abbr: 'h',
  alias: ['?'],
  boolean: true,
  help: 'Show help',
}, {
  name: 'version',
  abbr: 'v',
  boolean: true,
  help: 'Show version number',
}]);

function checkSingles(parsed, singles) {
  singles.forEach((single) => {
    if (Array.isArray(parsed[single])) {
      throw new Error(`${single} should only be specified once`);
    }
  });
}

function checkDirectory(parsed) {
  const directories = parsed._;
  if (directories.length > 1) {
    throw new Error('Only one directory should be specified');
  }
  return directories[0] || DEFAULT_DIRECTORY;
}

function checkMultiple(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (isUndefined(value)) {
    return [];
  }
  return [value];
}

export function help() {
  return USAGE_TEXT + cliOpts.usage() + '\n';
}

export function parse(argv) {
  const parsed = minimist(argv, Object.assign(cliOpts.options(), {
    stopEarly: true,
  }));
  checkSingles(parsed, [
    'log-level',
  ]);
  loggerFactory.level = parsed['log-level'];
  logger.debug(JSON.stringify(parsed, null, 2));
  if (parsed.version) {
    return {
      version: true,
    };
  }
  if (parsed.help) {
    return {
      help: true,
    };
  }
  checkSingles(parsed, [
    'username',
    'password',
    'git-binary',
    'svn-binary',
  ]);
  const directory = checkDirectory(parsed);
  const repositories = checkMultiple(parsed.repository);
  return {
    username: parsed.username,
    password: parsed.password,
    gitBinary: parsed['git-binary'],
    svnBinary: parsed['svn-binary'],
    usePromptFile: parsed['use-prompt-file'],
    repositories,
    directory,
  };
};
