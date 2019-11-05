import {
  help,
  parse,
} from '../../../src/cli/options';
import _ from 'lodash';
import {
  USAGE_TEXT,
  DEFAULT_SVN_BINARY,
  DEFAULT_GIT_BINARY,
  DEFAULT_LOG_LEVEL,
} from '../../../src/constants';

const repository = 'repository';
const username = 'username';
const password = 'password';
const workingDir = 'workingDir';
const svnBinary = 'svnBinary';
const gitBinary = 'gitBinary';
const logLevel = 'logLevel';

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

const noOptions = [
];

const shortOptions = [
  '-r',
  repository,
  '-u',
  username,
  '-p',
  password,
  '-w',
  workingDir,
  '-g',
  gitBinary,
  '-s',
  svnBinary,
  '-l',
  logLevel,
];

const fullOptions = [
  '--repository',
  repository,
  '--username',
  username,
  '--password',
  password,
  '--working-dir',
  workingDir,
  '--git-binary',
  gitBinary,
  '--svn-binary',
  svnBinary,
  '--log-level',
  logLevel,
];

let options;

describe('src', () => {
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
          });
        });

        _.forEach({
          'with the full options': fullOptions,
          'with the short options': shortOptions,
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value);
            });

            it('should set options', () => {
              options.repository.should.eql(repository);
              options.username.should.eql(username);
              options.password.should.eql(password);
              options['working-dir'].should.eql(workingDir);
              options['git-binary'].should.eql(gitBinary);
              options['svn-binary'].should.eql(svnBinary);
              options['log-level'].should.eql(logLevel);
            });
          });
        });

        describe('with no options', () => {
          before(() => {
            options = parse(noOptions);
          });

          it('should set default options', () => {
            options['git-binary'].should.eql(DEFAULT_GIT_BINARY);
            options['svn-binary'].should.eql(DEFAULT_SVN_BINARY);
            options['log-level'].should.eql(DEFAULT_LOG_LEVEL);
          });
        });
      });
    });
  });
});
