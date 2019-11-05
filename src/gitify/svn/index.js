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
import loggerFactory from '../../logger';
import Binary from '../binary';

const logger = loggerFactory.create(__filename);

export {
  ACTION,
  NODE_KIND,
} from './lib/shared';

export function svnFactory({
  Binary,
}) {
  return class Svn {
    async init({
      username,
      password,
      binary,
    }) {
      await credentials.init({
        username,
        password,
      });
      this.binary = new Binary({
        binary,
        args: credentials.args,
      });
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
          auth: credentials.auth,
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

    async log({repository, revision}) {
      return parseLog(
          await this.binary.exec([
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
          await this.binary.exec([
            'info',
            encodeURI(`${repository}${path}@${revision}`),
            '--xml',
          ])
      );
    }

    async diffProps({repository, revision}) {
      return parseDiffProps(
          await this.binary.exec([
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
  };
}

const Svn = svnFactory({
  Binary,
});
const svn = new Svn();
export default svn;
