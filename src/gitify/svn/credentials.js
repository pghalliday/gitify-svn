import prompt from '../prompt';
import {
  PROMPT_SVN_USERNAME,
  promptSvnPassword,
} from '../../constants';

export class Credentials {
  init({
    username,
    password,
  }) {
    this.username = username;
    this.password = password;
  }

  async get() {
    if (!this.username) {
      this.username = await prompt.input(PROMPT_SVN_USERNAME);
    }
    if (!this.password) {
      this.password = await prompt.password(promptSvnPassword(this.username));
    }
    return {
      username: this.username,
      password: this.password,
    };
  }
}

const credentials = new Credentials;
export default credentials;
