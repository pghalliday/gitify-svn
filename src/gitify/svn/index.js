import {
  spawn,
} from 'child_process';
import {
  parse as parseInfo,
} from './info';
import {
  parse as parseLog,
} from './log';

export {
  ACTION,
  NODE_KIND,
} from './shared';

const SVN = 'svn';

export class Svn {
  constructor({
    binary = SVN,
    username,
    password,
    repository,
  }) {
    this.binary = binary;
    this.repository = repository,
    this.args = ['--username', username, '--password', password];
  }

  exec(args) {
    return new Promise((resolve, reject) => {
      const svn = spawn(this.binary, this.args.concat(args));
      let output = '';
      const appendOutput = (data) => {
        output += data.toString();
      };
      svn.stdout.on('data', appendOutput);
      svn.stderr.on('data', appendOutput);
      svn.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Exited with code: ${code}\nOutput:\n\n${output}`));
        }
      });
      svn.on('error', (error) => {
        reject(error);
      });
    });
  }

  async log({revision}) {
    return parseLog(
        await this.exec([
          'log',
          encodeURI(this.repository),
          '--xml',
          '-v',
          '-r',
          revision,
        ])
    );
  }

  async info({path, revision}) {
    return parseInfo(
        await this.exec([
          'info',
          encodeURI(`${this.repository}${path}@${revision}`),
          '--xml',
        ])
    );
  }
}
