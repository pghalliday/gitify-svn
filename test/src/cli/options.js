import {
  help,
  parse,
} from '../../../src/cli/options';
import _ from 'lodash';
import {
  DEFAULT_WORKING_DIR,
  NO_REPOSITORY_ERROR,
  MULTIPLE_WORKING_DIRECTORIES_ERROR,
  USAGE_TEXT,
} from '../../../src/constants';

const workingDir = 'working dir';
const repository = 'repository';

const noRepository = [
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

const noOptions = [
  repository,
];

const shortOptions = [
  '-w',
  workingDir,
  repository,
];

const fullOptions = [
  '--working-dir',
  workingDir,
  repository,
];

const workingDirectories = [
  '--working-dir',
  workingDir,
  '--working-dir',
  workingDir,
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
          'with no options': {
            argv: noOptions,
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
