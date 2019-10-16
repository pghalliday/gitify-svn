import {
  help,
  parse,
} from '../../../src/cli/options';
import _ from 'lodash';
import {
  DEFAULT_WORKING_DIR,
  NO_REPOSITORY_ERROR,
  NO_USERNAME_ERROR,
  NO_PASSWORD_ERROR,
  MULTIPLE_WORKING_DIRECTORIES_ERROR,
  USAGE_TEXT,
} from '../../../src/constants';

const workingDir = 'working dir';
const repository = 'repository';
const username = 'username';
const password = 'password';

const noRepository = [
];

const justRequiredOptions = [
  '-u',
  username,
  '-p',
  password,
  repository,
];

const noUsername = [
  '-p',
  password,
  repository,
];

const noPassword = [
  '-u',
  username,
  repository,
];

const fullVersionOption = [
  '--version',
];

const shortVersionOption = [
  '-v',
];

const fullHelpOption = [
  '--help',
];

const shortHelpOption = [
  '-h',
];

const aliasHelpOption = [
  '-?',
];

const shortOptions = [
  '-w',
  workingDir,
  '-u',
  username,
  '-p',
  password,
  repository,
];

const fullOptions = [
  '--working-dir',
  workingDir,
  '--username',
  username,
  '--password',
  password,
  repository,
];

const workingDirectories = [
  '--working-dir',
  workingDir,
  '--working-dir',
  workingDir,
  '--username',
  username,
  '--password',
  password,
  repository,
];

let options;

describe('gitify', () => {
  describe('cli', () => {
    describe('options', () => {
      describe('#help', () => {
        it('should return the help message', () => {
          help().should.match(
              new RegExp('^' + _.escapeRegExp(USAGE_TEXT))
          );
        });
      });

      describe('#parse', () => {
        _.forEach({
          'with no repository': {
            argv: noRepository,
            error: NO_REPOSITORY_ERROR,
          },
          'with no username': {
            argv: noUsername,
            error: NO_USERNAME_ERROR,
          },
          'with no password': {
            argv: noPassword,
            error: NO_PASSWORD_ERROR,
          },
          'with multiple working directories specified': {
            argv: workingDirectories,
            error: MULTIPLE_WORKING_DIRECTORIES_ERROR,
          },
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value.argv);
            });

            it('should set the error', () => {
              options.error.should.eql(value.error);
            });
          });
        });

        _.forEach({
          'with the full version option': fullVersionOption,
          'with the short version option': shortVersionOption,
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value);
            });

            it('should set the version flag to true', () => {
              options.version.should.eql(true);
            });

            it('should not set the error', () => {
              expect(options.error).to.not.be.ok;
            });
          });
        });

        _.forEach({
          'with the full help option': fullHelpOption,
          'with the short help option': shortHelpOption,
          'with the alias help option': aliasHelpOption,
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value);
            });

            it('should set the help flag to true', () => {
              options.help.should.eql(true);
            });

            it('should not set the error', () => {
              expect(options.error).to.not.be.ok;
            });
          });
        });

        _.forEach({
          'with just required options': {
            argv: justRequiredOptions,
            workingDir: DEFAULT_WORKING_DIR,
          },
          'with short options': {
            argv: shortOptions,
            workingDir,
          },
          'with full options': {
            argv: fullOptions,
            workingDir,
          },
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value.argv);
            });

            it('should set the repository', () => {
              options.repository.should.eql(repository);
            });

            it('should set the username', () => {
              options.username.should.eql(username);
            });

            it('should set the password', () => {
              options.password.should.eql(password);
            });

            it('should set the working directory', () => {
              options.workingDir.should.eql(value.workingDir);
            });

            it('should set the help flag to false', () => {
              options.help.should.eql(false);
            });

            it('should set the version flag to false', () => {
              options.version.should.eql(false);
            });

            it('should not set the error', () => {
              expect(options.error).to.not.be.ok;
            });
          });
        });
      });
    });
  });
});
