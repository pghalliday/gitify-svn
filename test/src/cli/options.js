import {
  help,
  parse,
} from '../../../src/cli/options';
import _ from 'lodash';
import {
  USAGE_TEXT,
  DEFAULT_SVN_BINARY,
  DEFAULT_DEBUG_LEVEL,
} from '../../../src/constants';

const repository = 'repository';
const username = 'username';
const password = 'password';
const workingDir = 'workingDir';
const svnBinary = 'svnBinary';
const debugLevel = 'debugLevel';

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
  '-s',
  svnBinary,
  '-d',
  debugLevel,
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
  '--svn-binary',
  svnBinary,
  '--debug-level',
  debugLevel,
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
              options['svn-binary'].should.eql(svnBinary);
              options['debug-level'].should.eql(debugLevel);
            });
          });
        });

        describe('with no options', () => {
          before(() => {
            options = parse(noOptions);
          });

          it('should set default options', () => {
            options['svn-binary'].should.eql(DEFAULT_SVN_BINARY);
            options['debug-level'].should.eql(DEFAULT_DEBUG_LEVEL);
          });
        });
      });
    });
  });
});
