import prompt from '../../../src/gitify/prompt';

describe('src', () => {
  describe('gitify', () => {
    describe('prompt', () => {
      describe('input', () => {
        it('should be rejected as not implemented', async () => {
          await prompt.input().should.be.rejectedWith(
              'Prompt: input: not yet implemented'
          );
        });
      });

      describe('confirm', () => {
        it('should be rejected as not implemented', async () => {
          await prompt.confirm().should.be.rejectedWith(
              'Prompt: confirm: not yet implemented'
          );
        });
      });

      describe('password', () => {
        it('should be rejected as not implemented', async () => {
          await prompt.password().should.be.rejectedWith(
              'Prompt: password: not yet implemented'
          );
        });
      });
    });
  });
});
