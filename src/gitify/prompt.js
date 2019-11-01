class Prompt {
  async input() {
    throw new Error('Prompt: input: not yet implemented');
  }

  async confirm() {
    throw new Error('Prompt: confirm: not yet implemented');
  }
};

const prompt = new Prompt();
export default prompt;
