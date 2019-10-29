import minimist from 'minimist';
import cliclopts from 'cliclopts';
import {
  USAGE_TEXT,
  DEFAULT_SVN_BINARY,
  DEFAULT_LOG_LEVEL,
} from '../constants';
import {
  getLogger,
  setLogLevel,
} from '../logger';

const logger = getLogger(__filename);

const cliOpts = cliclopts([{
  name: 'repository',
  abbr: 'r',
  help: 'The SVN repository root URL to start with',
}, {
  name: 'username',
  abbr: 'u',
  help: 'The SVN username',
}, {
  name: 'password',
  abbr: 'p',
  help: 'The SVN password',
}, {
  name: 'working-dir',
  abbr: 'w',
  help: 'The working directory',
}, {
  name: 'svn-binary',
  abbr: 's',
  help: 'The SVN binary to use',
  default: DEFAULT_SVN_BINARY,
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
}, {
  name: 'log-level',
  abbr: 'l',
  help: 'Set the log level for the console and log file',
  default: DEFAULT_LOG_LEVEL,
}]);

export function help() {
  return USAGE_TEXT + cliOpts.usage() + '\n';
}

export function parse(argv) {
  const parsed = minimist(argv, Object.assign(cliOpts.options(), {
    stopEarly: true,
  }));
  setLogLevel(parsed['log-level']);
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
  return parsed;
};
