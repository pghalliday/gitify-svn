import prompt from '../prompt';
import {
  PROMPT_SVN_USERNAME,
  promptSvnPassword,
} from '../../constants';

class Credentials {
  async get() {
    if (!this.creds) {
      const username = await prompt.input(PROMPT_SVN_USERNAME);
      this.creds = {
        username,
        password: await prompt.password(promptSvnPassword(username)),
      };
    }
    return this.creds;
  }
}

const credentials = new Credentials;
export default credentials;
