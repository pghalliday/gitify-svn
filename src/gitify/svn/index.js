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
import credentials from './credentials';
import {
  DEFAULT_SVN_BINARY,
} from '../../constants';
import {
  getLogger,
} from '../../logger';

const logger = getLogger(__filename);

export {
  ACTION,
  NODE_KIND,
} from './lib/shared';

export class Svn {
  constructor(svnBinary = DEFAULT_SVN_BINARY) {
    this.svnBinary = svnBinary;
  }

  async init() {
    await credentials.init();
    this.args = [
      '--username',
      credentials.username,
      '--password',
      credentials.password,
    ];
    this.auth = {
      user: credentials.username,
      pass: credentials.password,
    };
  }

  download({
    repository,
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
      const url = `${repository}/!svn/bc/${revision}${path}`;
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

  async log({repository, revision}) {
    return parseLog(
        await this.exec([
          'log',
          encodeURI(repository),
          '--xml',
          '-v',
          '-r',
          revision,
        ])
    );
  }

  async info({repository, path, revision}) {
    return parseInfo(
        await this.exec([
          'info',
          encodeURI(`${repository}${path}@${revision}`),
          '--xml',
        ])
    );
  }

  async diffProps({repository, revision}) {
    return parseDiffProps(
        await this.exec([
          'diff',
          encodeURI(repository),
          '-c',
          revision,
          '--properties-only',
        ])
    );
  }

  async revision({repository, revision}) {
    throw new Error('Svn: revision: not yet implemented');
  }
}

const svn = new Svn();
export default svn;
