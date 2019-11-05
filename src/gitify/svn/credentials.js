import prompt from '../prompt';
import {
  PROMPT_SVN_USERNAME,
  promptSvnPassword,
} from '../../constants';

export class Credentials {
  async init({
    username,
    password,
  }) {
    if (!username) {
      username = await prompt.input(PROMPT_SVN_USERNAME);
    }
    if (!password) {
      password = await prompt.password(promptSvnPassword(username));
    }
    this.args = [
      '--username',
      username,
      '--password',
      password,
    ];
    this.auth = {
      user: username,
      pass: password,
    };
  }
}

const credentials = new Credentials;
export default credentials;
