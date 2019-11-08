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
    this.index = 0;
  }

  async init({
    usePromptFile,
  }) {
    this.path = join(workingDirectory.path, PROMPT_FILE);
    const json = await promisify(readFile)(this.path, 'utf8');
    this.prompts = JSON.parse(json);
    if (!usePromptFile) {
      this.index = this.prompts.length;
    }
  }

  async next({
    callback,
    question,
  }) {
    let prompt = this.prompts[this.index++];
    if (prompt) {
      if (prompt.question !== question) {
        logger.warn(
            // eslint-disable-next-line max-len
            `Question does not match question from prompt file, updating: ${question}: ${prompt.question}`
        );
        prompt.question = question;
      }
    } else {
      prompt = {
        question,
        response: await callback(),
      },
      this.prompts.push(prompt);
    }
    return prompt.response;
  }

  async flush() {
    logger.debug('Flushing prompts to prompt file');
    await promisify(writeFile)(
        this.path,
        JSON.stringify(this.prompts, null, 2),
    );
  }
}

const promptFile = new PromptFile();
export default promptFile;
