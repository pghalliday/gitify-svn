import {
  parse,
} from '../../../../src/gitify/svn/info';
import {
  DIRECTORY_INFO,
  PARSED_DIRECTORY_INFO,
  UNEXPECTED_INFO_KEYS,
  UNEXPECTED_INFO_KEY,
  UNKNOWN_INFO,
} from '../../../helpers/constants';

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      describe('info', () => {
        describe('parse', () => {
          it('should parse valid info output for directory', async () => {
            (await parse(DIRECTORY_INFO)).should.eql(PARSED_DIRECTORY_INFO);
          });

          it('should error on unexpected info key count', async () => {
            await parse(UNEXPECTED_INFO_KEYS).should.be.rejectedWith(
                // eslint-disable-next-line max-len
                'Unexpected keys: $,url,relative-url,repository,commit,unexpected'
            );
          });

          it('should error on unexpected info key name', async () => {
            await parse(UNEXPECTED_INFO_KEY).should.be.rejectedWith(
                'Unknown key: unexpected'
            );
          });

          it('should error on unknown node kind', async () => {
            await parse(UNKNOWN_INFO).should.be.rejectedWith(
                'Unknown node kind: unknown'
            );
          });
        });
      });
    });
  });
});
