import prompt from './prompt';
import promptFile from './prompt-file';
import mkdirp from 'mkdirp';
import {
  writeFile,
  readdir,
} from 'fs';
import {
  promisify,
} from 'util';
import {
  LOG_FILE,
  README_FILE,
  README_TEXT,
  STATE_FILE,
  promptConfirmNonEmpty,
} from '../constants';
import git from './git';
import loggerFactory from '../logger';
import {
  join,
} from 'path';

const logger = loggerFactory.create(__filename);

export function workingDirectoryFactory({
}) {
  return class WorkingDirectory {
    async init({
      path,
      usePromptFile,
    }) {
      logger.debug(`working directory set to ${path}`);
      this.path = path;
      await promisify(mkdirp)(path);
      await promptFile.init({
        usePromptFile,
      });

      // check for non empty
      const files = await promisify(readdir)(path);
      const isEmpty = files.length === 0;
      const isGit = files.indexOf('.git') !== -1;
      const hasState = files.indexOf(STATE_FILE) !== -1;
      const hasReadme = files.indexOf(README_FILE) !== -1;

      // Confirm if not empty and no state file
      if (!isEmpty && !hasState) {
        const confirm = await prompt.confirm(
            promptConfirmNonEmpty(path),
            false,
        );
        if (!confirm) {
          throw new Error('User cancelled');
        }
      }

      const logFile = join(path, LOG_FILE);
      loggerFactory.logToFile(logFile);
      logger.info(`logging to file: ${logFile}`);

      if (!isGit) {
        logger.debug('initialising git repository');
        await git.initRepository({
          path,
        });
      }

      if (!hasReadme) {
        logger.debug('creating the readme file');
        await promisify(writeFile)(join(path, README_FILE), README_TEXT);
      }
    }
  };
}

const WorkingDirectory = workingDirectoryFactory({
});
const workingDirectory = new WorkingDirectory();
export default workingDirectory;
