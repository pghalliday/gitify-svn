import Binary from '../../../src/gitify/binary';
import {
  BINARY,
} from '../../helpers/constants';

const args = [
  'arg1',
  'arg2',
];

describe('src', () => {
  describe('gitify', () => {
    describe('Binary', () => {
      let binary;

      describe('with an invalid binary', () => {
        beforeEach(() => {
          binary = new Binary({
            binary: 'invalid binary',
            args,
          });
        });

        describe('exec', () => {
          it('should error', async () => {
            await binary.exec([0, 'arg']).should.be.rejectedWith('ENOENT');
          });
        });
      });

      describe('with a valid binary', () => {
        beforeEach(() => {
          binary = new Binary({
            binary: BINARY,
            args,
          });
        });

        describe('exec', () => {
          it('should return the output on zero exit code', async () => {
            const output = await binary.exec(['arg3', 'arg4'], {
              cwd: __dirname,
            });
            output.should.eql(
                `${__dirname}\narg1 arg2 arg3 arg4\n`
            );
          });

          it('should error on non-zero exit code', async () => {
            await binary.exec(['error'], {
              cwd: __dirname,
            })
                .should.be.rejectedWith(
                    // eslint-disable-next-line max-len
                    `Exited with code: 1\nOutput:\n\n${__dirname}\narg1 arg2 error\n`
                );
          });
        });
      });
    });
  });
});
