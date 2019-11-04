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
    this.username = username;
    this.password = password;
    if (!this.username) {
      this.username = await prompt.input(PROMPT_SVN_USERNAME);
    }
    if (!this.password) {
      this.password = await prompt.password(promptSvnPassword(this.username));
    }
  }
}

const credentials = new Credentials;
export default credentials;
