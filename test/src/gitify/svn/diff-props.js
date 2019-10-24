import {
  parse,
} from '../../../../src/gitify/svn/diff-props';
import {
  VALID_DIFF_PROPS,
  PARSED_VALID_DIFF_PROPS,
  UNKNOWN_DIFF_PROPS,
  INVALID_EXTERNAL_TUPLE_DIFF_PROPS,
  INVALID_LINE_PREFIX_DIFF_PROPS,
} from '../../../helpers/constants';

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      describe('diff-props', () => {
        describe('parse', () => {
          it('should parse valid diff output', () => {
            parse(VALID_DIFF_PROPS).should.eql(PARSED_VALID_DIFF_PROPS);
          });

          it('should error on unknown property', async () => {
            expect(() => parse(UNKNOWN_DIFF_PROPS)).to.throw(
                'diff-props: unknown property: svn:unknown'
            );
          });

          it('should error on invalid line prefix', async () => {
            expect(() => parse(INVALID_LINE_PREFIX_DIFF_PROPS)).to.throw(
                'diff-props: unexpected line prefix: url1 name1'
            );
          });

          it('should error on invalid external tuple', async () => {
            expect(() => parse(INVALID_EXTERNAL_TUPLE_DIFF_PROPS)).to.throw(
                'diff-props: invalid external tuple: url1 name1 hello'
            );
          });
        });
      });
    });
  });
});
