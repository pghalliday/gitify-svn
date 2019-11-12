import {
  reduce,
  forEach,
  map,
} from 'lodash';
import {
  join,
} from 'path';
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
const NO_SUCH_REVISION_REGEX = RegExp('svn: E160006: No such revision');

export {
  ACTION,
  NODE_KIND,
} from './lib/shared';

import {
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
      let log;
      try {
        log = await this.log({
          repository,
          revision,
        });
      } catch (error) {
        if (error.output && NO_SUCH_REVISION_REGEX.test(error.output)) {
          return;
        } else {
          throw error;
        }
      }

      const diffProps = await this.diffProps({
        repository,
        revision,
      });
      const propChanges = reduce(diffProps, (propChanges, properties, path) => {
        forEach(properties, (changes, property) => {
          switch (property) {
            case 'svn:externals':
              const convertExternals = (changes, action) => map(
                  changes,
                  (target, name) => ({
                    action,
                    path: join(path, name),
                    url: target.url || target,
                    revision: target.revision,
                  }),
              );
              propChanges.externals = propChanges.externals.concat(
                  convertExternals(changes.added, ACTION.ADD)
              );
              propChanges.externals = propChanges.externals.concat(
                  convertExternals(changes.deleted, ACTION.DELETE)
              );
              propChanges.externals = propChanges.externals.concat(
                  convertExternals(changes.modified, ACTION.MODIFY)
              );
              break;
            // istanbul ignore next
            default:
              throw new Error(`Unhandled property: ${property}`);
          }
        });
        return propChanges;
      }, {
        externals: [],
      });
      const ret = {
        revision: log.revision,
        author: log.author,
        date: log.date,
        message: log.message,
        changes: {
          paths: await Promise.all(log.changes.map(async (change) => {
            if (change.kind !== NODE_KIND.UNSET) return change;
            const info = await this.info({
              repository,
              path: change.path,
              revision,
            });
            change.kind = info.nodeKind;
            return change;
          })),
          externals: propChanges.externals,
        },
      };
      return ret;
    }
  };
}

const Svn = svnFactory({
  Binary,
});
const svn = new Svn();
export default svn;
