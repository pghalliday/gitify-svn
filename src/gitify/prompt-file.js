import workingDirectory from './working-directory';
import {
  PROMPT_FILE,
} from '../constants';
import {
  promisify,
} from 'util';
import {
  join,
} from 'path';
import {
  readFile,
  writeFile,
} from 'fs';
import loggerFactory from '../logger';

const logger = loggerFactory.create(__filename);

export class PromptFile {
  constructor() {
    this.prompts = [];
    this.newPrompts = [];
  }

  async init({
    usePromptFile,
  }) {
    this.path = join(workingDirectory.path, PROMPT_FILE);
    if (usePromptFile) {
      const lines = await promisify(readFile)(this.path, 'utf8');
      this.prompts = lines.split('\n').filter((line) => {
        return line.trim().length > 0;
      }).map((line) => {
        return JSON.parse(line);
      });
    }
  }

  async next({
    callback,
    question,
  }) {
    let prompt = this.prompts.shift();
    if (prompt) {
      // istanbul ignore next
      if (prompt.question !== question) {
        logger.warn(
            // eslint-disable-next-line max-len
            `Question does not match question from prompt file: ${question}: ${prompt.question}`
        );
      }
    } else {
      prompt = {
        question,
        response: await callback(),
      },
      this.newPrompts.push(prompt);
    }
    return prompt.response;
  }

  async flush() {
    logger.debug('Flushing prompts to prompt file');
    await promisify(writeFile)(
        this.path,
        this.newPrompts.reduce((lines, prompt) => {
          return lines + `${JSON.stringify(prompt)}\n`;
        }, ''), {
          flag: 'a',
        },
    );
    this.newPrompts = [];
  }
}

const promptFile = new PromptFile();
export default promptFile;
