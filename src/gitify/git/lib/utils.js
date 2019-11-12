import {
  GIT_KEEP_FILE,
} from '../../../constants';
import {
  promisify,
} from 'util';
import {
  join,
} from 'path';
import {
  readdir,
  writeFile,
  unlink,
} from 'fs';

async function checkEmpty(dir) {
  const files = await promisify(readdir)(dir);
  if (files.length === 1 && files[0] === GIT_KEEP_FILE) {
    return;
  }
  const gitkeep = join(dir, GIT_KEEP_FILE);
  if (files.length === 0) {
    // create a .gitkeep file as the directory will
    // be empty and Git doesn't do that
    await promisify(writeFile)(gitkeep, '');
    return;
  }
  if (files.indexOf(GIT_KEEP_FILE) !== -1) {
    await promisify(unlink)(gitkeep);
  }
}

const utils = {
  checkEmpty,
};
export default utils;
