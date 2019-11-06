import {
  help,
  parse,
} from '../../../src/cli/options';
import loggerFactory from '../../../src/logger';
import {
  escapeRegExp,
  forEach,
} from 'lodash';
import {
  USAGE_TEXT,
  DEFAULT_SVN_BINARY,
  DEFAULT_GIT_BINARY,
  DEFAULT_LOG_LEVEL,
  DEFAULT_DIRECTORY,
} from '../../../src/constants';

const repository = 'repository';
const username = 'username';
const password = 'password';
const svnBinary = 'svnBinary';
const gitBinary = 'gitBinary';
const logLevel = 'logLevel';
const directory = 'directory';

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
  '-g',
  gitBinary,
  '-s',
  svnBinary,
  '-l',
  logLevel,
  directory,
];

const fullOptions = [
  '--repository',
  repository,
  '--username',
  username,
  '--password',
  password,
  '--git-binary',
  gitBinary,
  '--svn-binary',
  svnBinary,
  '--log-level',
  logLevel,
  directory,
];

const tooManyDirectories = [
  directory,
  directory,
];

const multipleOptions = {
  repositories: 'repository',
};

const singleOptions = {
  username,
  password,
  gitBinary: 'git-binary',
  svnBinary: 'svn-binary',
  logLevel: 'log-level',
};

let options;

describe('src', () => {
  describe('cli', () => {
    describe('options', () => {
      describe('#help', () => {
        it('should return the help message', () => {
          help().should.match(
              new RegExp('^' + escapeRegExp(USAGE_TEXT))
          );
        });
      });

      describe('#parse', () => {
        forEach({
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

        forEach({
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

        forEach({
          'with the full options': fullOptions,
          'with the short options': shortOptions,
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value);
            });

            it('should set options', () => {
              loggerFactory.level.should.eql(logLevel);
              options.repositories.should.eql([repository]);
              options.username.should.eql(username);
              options.password.should.eql(password);
              options.gitBinary.should.eql(gitBinary);
              options.svnBinary.should.eql(svnBinary);
              options.directory.should.eql(directory);
            });
          });
        });

        forEach(multipleOptions, (value, key) => {
          describe(`when ${value} is specified multiple times`, () => {
            before(() => {
              options = parse([
                `--${value}`,
                'value1',
                `--${value}`,
                'value2',
              ]);
            });

            it('should return an array', () => {
              options[key].should.eql(['value1', 'value2']);
            });
          });
        });

        forEach(singleOptions, (value) => {
          describe(`when ${value} is specified multiple times`, () => {
            it('should throw an error', () => {
              expect(() => parse([
                `--${value}`,
                'value1',
                `--${value}`,
                'value2',
              ])).to.throw(`${value} should only be specified once`);
            });
          });
        });

        describe('with too many directories', () => {
          it('should throw an error', () => {
            expect(() => parse(tooManyDirectories))
                .to.throw(`Only one directory should be specified`);
          });
        });

        describe('with no options', () => {
          before(() => {
            options = parse(noOptions);
          });

          it('should set default options', () => {
            loggerFactory.level.should.eql(DEFAULT_LOG_LEVEL);
            options.repositories.should.eql([]);
            options.gitBinary.should.eql(DEFAULT_GIT_BINARY);
            options.svnBinary.should.eql(DEFAULT_SVN_BINARY);
            options.directory.should.eql(DEFAULT_DIRECTORY);
          });
        });
      });
    });
  });
});
