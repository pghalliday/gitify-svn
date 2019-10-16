import minimist from 'minimist';
import optionDefault from './utils/option-default';
import _ from 'lodash';
import cliclopts from 'cliclopts';
import {
  DEFAULT_WORKING_DIR,
  NO_REPOSITORY_ERROR,
  MULTIPLE_WORKING_DIRECTORIES_ERROR,
  USAGE_TEXT,
  WORKING_DIRECTORY_VAR,
} from '../constants';

const defaultWorkingDirectory = optionDefault(
    WORKING_DIRECTORY_VAR,
    DEFAULT_WORKING_DIR,
);

const cliOpts = cliclopts([{
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
  const workingDir = parsed['working-dir'];
  return {
    repository,
    workingDir,
    help: false,
    version: false,
  };
};
