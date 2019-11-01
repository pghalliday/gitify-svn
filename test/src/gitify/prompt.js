import promptFactory from '../../../src/gitify/prompt';

describe('src', () => {
  describe('gitify', () => {
    describe('prompt', () => {
      let Prompt;
      let prompt;

      beforeEach(() => {
        Prompt = promptFactory({});
        prompt = new Prompt();
      });

      describe('input', () => {
        it('should be rejected as no implemented', async () => {
          await prompt.input().should.be.rejectedWith(
              'Prompt: input: not yet implemented'
          );
        });
      });
    });
  });
});
