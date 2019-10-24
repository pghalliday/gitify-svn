import minimist from 'minimist';
import cliclopts from 'cliclopts';
import {
  USAGE_TEXT,
  DEFAULT_SVN_BINARY,
  DEFAULT_DEBUG_LEVEL,
} from '../constants';

const cliOpts = cliclopts([{
  name: 'repository',
  abbr: 'r',
  help: 'The SVN repository root URL',
}, {
  name: 'username',
  abbr: 'u',
  help: 'The SVN repository username',
}, {
  name: 'password',
  abbr: 'p',
  help: 'The SVN repository password',
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
  name: 'debug-level',
  abbr: 'd',
  help: 'Set the debug level for the console',
  default: DEFAULT_DEBUG_LEVEL,
}]);

export function help() {
  return USAGE_TEXT + cliOpts.usage() + '\n';
}

export function parse(argv) {
  const parsed = minimist(argv, Object.assign(cliOpts.options(), {
    stopEarly: true,
  }));
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
