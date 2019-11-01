export default function promptFactory({
}) {
  return class Prompt {
    async input() {
      throw new Error('Prompt: input: not yet implemented');
    }
  };
}
