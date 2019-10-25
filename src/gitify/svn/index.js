import {
  spawn,
} from 'child_process';
import {
  parse as parseInfo,
} from './info';
import {
  parse as parseLog,
} from './log';
import {
  parse as parseDiffProps,
} from './diff-props';
import request from 'request';
import {
  createWriteStream,
} from 'fs';
import {
  getLogger,
} from '../../logger';

const logger = getLogger(__filename);

export {
  ACTION,
  NODE_KIND,
} from './shared';

export class Svn {
  constructor({
    repository,
    username,
    password,
    svnBinary,
  }) {
    this.svnBinary = svnBinary;
    this.repository = repository,
    this.args = ['--username', username, '--password', password];
    this.auth = {
      user: username,
      pass: password,
    };
  }

  download({
    path,
    revision,
    destination,
  }) {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(destination);
      writeStream.on('error', (error) => {
        reject(error);
      });
      let resolution;
      writeStream.on('close', () => {
        resolution();
      });
      const url = `${this.repository}/!svn/bc/${revision}${path}`;
      logger.debug(`Downloading file from ${url} to ${destination}`);
      request.get(url, {
        auth: this.auth,
      })
          .on('error', (error) => {
            reject(error);
          })
          .on('response', ({statusCode}) => {
            if (statusCode === 200) {
              resolution = () => resolve();
            } else {
              resolution = () => reject(
                  new Error(
                      // eslint-disable-next-line max-len
                      `Failed to download file: ${url}: statusCode: ${statusCode}`
                  )
              );
            }
          })
          .pipe(writeStream);
    });
  }

  exec(args) {
    return new Promise((resolve, reject) => {
      const allArgs = this.args.concat(args);
      logger.debug({
        spawn: this.svnBinary,
        args: allArgs,
      });
      const svn = spawn(this.svnBinary, allArgs);
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

  async diffProps({revision}) {
    return parseDiffProps(
        await this.exec([
          'diff',
          encodeURI(this.repository),
          '-c',
          revision,
          '--properties-only',
        ])
    );
  }
}
