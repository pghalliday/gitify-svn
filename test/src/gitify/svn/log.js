import {
  parse,
} from '../../../../src/gitify/svn/log';
import {
  VALID_LOG,
  PARSED_VALID_LOG,
} from '../../../helpers/constants';

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      describe('log', () => {
        describe('parse', () => {
          it('should parse valid log', () => {
            parse(VALID_LOG).should.eql(PARSED_VALID_LOG);
          });

          // it('should error on unexpected info output field', () => {
            // expect(() => parse(UNEXPECTED_INFO)).to.throw(
                // 'Unknown info field: Unexpected Field'
            // );
          // });

          // it('should error on unknown node kind', () => {
            // expect(() => parse(UNKNOWN_INFO)).to.throw(
                // 'Unknown info Node Kind: unknown'
            // );
          // });
        });
      });
    });
  });
});
