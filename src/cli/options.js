import minimist from 'minimist';
import optionDefault from './utils/option-default';
import _ from 'lodash';
import cliclopts from 'cliclopts';
import {
  DEFAULT_WORKING_DIR,
  NO_REPOSITORY_ERROR,
  NO_USERNAME_ERROR,
  NO_PASSWORD_ERROR,
  MULTIPLE_WORKING_DIRECTORIES_ERROR,
  USAGE_TEXT,
  WORKING_DIRECTORY_VAR,
  USERNAME_VAR,
  PASSWORD_VAR,
} from '../constants';

const defaultUsername = optionDefault(
    USERNAME_VAR,
    undefined,
);

const defaultPassword = optionDefault(
    PASSWORD_VAR,
    undefined,
);

const defaultWorkingDirectory = optionDefault(
    WORKING_DIRECTORY_VAR,
    DEFAULT_WORKING_DIR,
);

const cliOpts = cliclopts([{
  name: 'username',
  abbr: 'u',
  default: defaultUsername,
  help: '(required) The username to use with SVN',
}, {
  name: 'password',
  abbr: 'p',
  default: defaultPassword,
  help: '(required) The password to use with SVN',
}, {
  name: 'working-dir',
  abbr: 'w',
  default: defaultWorkingDirectory,
  help: 'The directory in which to create projects, record progress, etc.',
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
  if (parsed['working-dir'] instanceof Array) {
    return {
      error: MULTIPLE_WORKING_DIRECTORIES_ERROR,
    };
  }
  const repository = parsed._[0];
  if (_.isUndefined(repository)) {
    return {
      error: NO_REPOSITORY_ERROR,
    };
  }
  const username = parsed['username'];
  if (_.isUndefined(username)) {
    return {
      error: NO_USERNAME_ERROR,
    };
  }
  const password = parsed['password'];
  if (_.isUndefined(password)) {
    return {
      error: NO_PASSWORD_ERROR,
    };
  }
  const workingDir = parsed['working-dir'];
  return {
    repository,
    workingDir,
    username,
    password,
    help: false,
    version: false,
  };
};
