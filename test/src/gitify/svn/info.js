import {
  parse,
} from '../../../../src/gitify/svn/info';
import {
  DIRECTORY_INFO,
  PARSED_DIRECTORY_INFO,
  UNEXPECTED_INFO,
  UNKNOWN_INFO,
} from '../../../helpers/constants';

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      describe('info', () => {
        describe('parse', () => {
          it('should parse valid info output for directory', () => {
            parse(DIRECTORY_INFO).should.eql(PARSED_DIRECTORY_INFO);
          });

          it('should error on unexpected info output field', () => {
            expect(() => parse(UNEXPECTED_INFO)).to.throw(
                'Unknown info field: Unexpected Field'
            );
          });

          it('should error on unknown node kind', () => {
            expect(() => parse(UNKNOWN_INFO)).to.throw(
                'Unknown info Node Kind: unknown'
            );
          });
        });
      });
    });
  });
});
