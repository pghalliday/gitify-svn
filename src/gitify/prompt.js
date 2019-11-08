import inquirer from 'inquirer';
import promptFile from './prompt-file';

class Prompt {
  async input(question, def) {
    return promptFile.next({
      question,
      callback: async () => {
        const answers = await inquirer.prompt({
          type: 'input',
          name: 'response',
          message: question,
          default: def,
        });
        return answers.response;
      },
    });
  }

  async confirm(question, def) {
    return promptFile.next({
      question,
      callback: async () => {
        const answers = await inquirer.prompt({
          type: 'confirm',
          name: 'response',
          message: question,
          default: def,
        });
        return answers.response;
      },
    });
  }

  async password(question) {
    return promptFile.next({
      question,
      callback: async () => {
        const answers = await inquirer.prompt({
          type: 'password',
          name: 'response',
          message: question,
        });
        return answers.response;
      },
    });
  }
};

const prompt = new Prompt();
export default prompt;
