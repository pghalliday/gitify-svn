import workingDirectory from '../working-directory';
import prompt from '../prompt';
import parse from './lib/parse';
import {
  DEFAULT_NAME,
  DEFAULT_EMAIL,
  AUTHORS_FILE,
  promptAuthorName,
  promptAuthorEmail,
} from '../../constants';
import {
  readFile,
  writeFile,
} from 'fs';
import {
  promisify,
} from 'util';
import {
  join,
} from 'path';

export class Authors {
  async init() {
    this.file = join(workingDirectory.path, AUTHORS_FILE);
    try {
      const json = await promisify(readFile)(this.file, 'utf8');
      this.list = JSON.parse(json);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      this.list = {};
    }
  }

  async get(author) {
    if (!author) {
      return {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
      };
    }
    let data = this.list[author];
    if (data) {
      return data;
    }
    const {name, email} = parse.author(author);
    data = {
      name: await prompt.input(promptAuthorName(author), name),
      email: await prompt.input(promptAuthorEmail(author), email),
    };
    this.list[author] = data;
    await promisify(writeFile)(this.file, JSON.stringify(this.list, null, 2));
    return data;
  }
}

const authors = new Authors();
export default authors;
