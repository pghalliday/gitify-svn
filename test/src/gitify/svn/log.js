import {
  parse,
} from '../../../../src/gitify/svn/log';
import {
  VALID_LOG,
  PARSED_VALID_LOG,
  INVALID_ACTION_LOG,
} from '../../../helpers/constants';

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      describe('log', () => {
        describe('parse', () => {
          it('should parse valid log', async () => {
            (await parse(VALID_LOG)).should.eql(PARSED_VALID_LOG);
          });

          it('should error on invalid action', async () => {
            await parse(INVALID_ACTION_LOG).should.be.rejectedWith(
                'Unknown action: X'
            );
          });
        });
      });
    });
  });
});
