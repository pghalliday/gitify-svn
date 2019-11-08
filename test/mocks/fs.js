import {
  resolve,
  dirname,
  basename,
} from 'path';
import _ from 'lodash';
import fs from 'fs';
import sinon from 'sinon';
import {
  Writable,
} from 'stream';

export const FS_DIRECTORY = 'directory';
export const FS_FILE = 'file';

const EXCEPTIONS = [
  'ReadStream',
  'WriteStream',
  'FileReadStream',
  'FileWriteStream',
];

const BASE_STATS = {
  dev: 2049,
  mode: 16877,
  nlink: 8,
  uid: 1000,
  gid: 1000,
  rdev: 0,
  blksize: 4096,
  ino: 3675630,
  size: 4096,
  blocks: 8,
  atimeMs: 1571731156472.3372,
  mtimeMs: 1571731084452.345,
  ctimeMs: 1571731084452.345,
  birthtimeMs: 1571227460949.411,
  atime: new Date('2019-10-22T07:59:16.472Z'),
  mtime: new Date('2019-10-22T07:58:04.452Z'),
  ctime: new Date('2019-10-22T07:58:04.452Z'),
  birthtime: new Date('2019-10-16T12:04:20.949Z'),
};

class WriteStream extends Writable {
  constructor(path, paths) {
    super({
      decodeStrings: false,
      emitClose: false,
    });
    this.path = path;
    this.paths = paths;
    this.emitClose = true;
  }

  _write(chunk, encoding, cb) {
    if (encoding !== 'utf8') {
      cb(new Error(
          // eslint-disable-next-line max-len
          `FsMock: WriteStream: _write: only utf8 string chunks are supported: ${encoding}`
      ));
      return;
    }
    const absPath = resolve(this.path);
    let entry = this.paths[absPath];
    if (entry) {
      if (entry.type === FS_DIRECTORY) {
        cb(illegalOperationOnDirectoryError(this.path, 'open'));
        this.emitClose = false;
        return;
      }
    } else {
      entry = {
        type: FS_FILE,
        data: '',
      };
      this.paths[absPath] = entry;
    }
    entry.data += chunk;
    cb();
  }

  _final() {
    if (this.emitClose) {
      this.emit('close');
    }
  }
}

class Stats {
  constructor(entry) {
    Object.assign(this, BASE_STATS);
    this._entry = entry;
  }

  isDirectory() {
    return this._entry.type === FS_DIRECTORY;
  }

  isFile() {
    return this._entry.type === FS_FILE;
  }
}

class SystemError extends Error {
  constructor({
    message,
    errno,
    code,
    syscall,
    path,
  }) {
    super(`FsMock: ${message}`);
    this.errno = errno;
    this.code = code;
    this.syscall = syscall;
    this.path = path;
  }
}

const noSuchFileError = (path, syscall) => new SystemError({
  message: `ENOENT: no such file or directory, ${syscall} '${path}'`,
  errno: -2,
  code: 'ENOENT',
  syscall,
  path,
});

const notDirectoryError = (path, syscall) => new SystemError({
  message: `ENOTDIR: not a directory, ${syscall} '${path}'`,
  errno: -20,
  code: 'ENOTDIR',
  syscall,
  path,
});

const fileExistsError = (path, syscall) => new SystemError({
  message: `EEXIST: file already exists, ${syscall} '${path}'`,
  errno: -17,
  code: 'EEXIST',
  syscall,
  path,
});

const illegalOperationOnDirectoryError = (path, syscall) => new SystemError({
  message: `EISDIR: illegal operation on a directory, ${syscall} '${path}'`,
  errno: -21,
  code: 'EISDIR',
  syscall,
  path,
});

const directoryNotEmptyError = (path, syscall) => new SystemError({
  message: `ENOTEMPTY: directory not empty, ${syscall} '${path}'`,
  errno: -39,
  code: 'ENOTEMPTY',
  syscall,
  path,
});

export class FsMock {
  constructor(paths) {
    // convert all paths to absolute paths
    this.paths = _.mapKeys(paths, (value, key) => resolve(key));
    // make sure the root directory exists
    this.paths['/'] = {
      type: FS_DIRECTORY,
    };
    // stub all the methods of the fs object
    Object.keys(fs).forEach((key) => {
      if (typeof fs[key] === 'function' && EXCEPTIONS.indexOf(key) === -1) {
        if (this[key]) {
          sinon.stub(fs, key).callsFake(this[key].bind(this));
        } else {
          sinon.stub(fs, key).callsFake(() => {
            throw new Error(`FsMock: Not implemented: ${key}`);
          });
        }
        if (!fs[key].restore) {
          console.warn(`FsMock: unable to stub: ${key}`);
        }
      }
    });
  }

  getChildren(parent) {
    return Object.keys(this.paths).filter(
        (path) => dirname(path) === resolve(parent)
    );
  }

  getEntry(path) {
    return this.paths[resolve(path)];
  }

  restore() {
    Object.keys(fs).forEach((key) => {
      if (typeof fs[key] === 'function' && fs[key].restore) {
        fs[key].restore();
      }
    });
  }

  stat(path, opts, cb) {
    if (typeof opts === 'function') cb = opts;
    setImmediate(() => {
      const entry = this.paths[resolve(path)];
      if (entry) {
        cb(null, new Stats(entry));
      } else {
        cb(noSuchFileError(path, 'stat'));
      }
    });
  }

  lstat(path, opts, cb) {
    this.stat(path, opts, cb);
  }

  rmdir(path, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts;
    } else {
      throw new Error('FsMock: rmdir: options are not supported');
    }
    setImmediate(() => {
      const entry = this.paths[resolve(path)];
      if (entry) {
        if (entry.type !== FS_DIRECTORY) {
          cb(notDirectoryError(path, 'rmdir'));
        } else {
          const children = this.getChildren(path);
          if (children.length > 0) {
            cb(directoryNotEmptyError(path, 'rmdir'));
          } else {
            delete this.paths[resolve(path)];
            cb(null);
          }
        }
      } else {
        cb(noSuchFileError(path, 'rmdir'));
      }
    });
  }

  mkdir(path, opts, cb) {
    if (typeof opts === 'function') cb = opts;
    setImmediate(() => {
      const absPath = resolve(path);
      const entry = this.paths[absPath];
      if (entry) {
        const err = fileExistsError(path, 'mkdir');
        cb(err);
      } else {
        const parent = this.paths[dirname(absPath)];
        if (parent) {
          if (parent.type === FS_DIRECTORY) {
            this.paths[absPath] = {
              type: FS_DIRECTORY,
            };
            cb();
          } else {
            const err = notDirectoryError(path, 'mkdir');
            cb(err);
          }
        } else {
          const err = noSuchFileError(path, 'mkdir');
          cb(err);
        }
      }
    });
  }

  unlink(path, cb) {
    setImmediate(() => {
      const entry = this.paths[resolve(path)];
      if (entry) {
        if (entry.type === FS_DIRECTORY) {
          cb(illegalOperationOnDirectoryError(path, 'rmdir'));
        } else {
          delete this.paths[resolve(path)];
          cb(null);
        }
      } else {
        cb(noSuchFileError(path, 'unlink'));
      }
    });
  }

  writeFile(path, data, opts, cb) {
    let append = false;
    if (typeof data !== 'string') {
      throw new Error('FsMock: writeFile only supports strings at this time');
    }
    if (typeof opts === 'function') {
      cb = opts;
    } else {
      if (JSON.stringify(opts) !== JSON.stringify({flag: 'a'})) {
        throw new Error(
            `FsMock: writeFile options only support flag 'a': ${opts}`
        );
      } else {
        append = true;
      }
    }
    setImmediate(() => {
      const absPath = resolve(path);
      const entry = this.paths[absPath];
      if (entry) {
        if (entry.type === FS_DIRECTORY) {
          const err = illegalOperationOnDirectoryError(path, 'open');
          cb(err);
        } else if (entry.type === FS_FILE) {
          // only support truncating and append for now (flag w or a)
          if (append) {
            entry.data += data;
          } else {
            entry.data = data;
          }
          cb(null);
        }
      } else {
        const parent = this.paths[dirname(absPath)];
        if (parent) {
          if (parent.type === FS_DIRECTORY) {
            this.paths[absPath] = {
              type: FS_FILE,
              data,
            };
            cb(null);
          } else {
            const err = notDirectoryError(path, 'open');
            cb(err);
          }
        } else {
          const err = noSuchFileError(path, 'open');
          cb(err);
        }
      }
    });
  }

  readFile(path, opts, cb) {
    if (opts !== 'utf8') {
      throw new Error(`FsMock: readFile only supports utf8 encoding: ${opts}`);
    }
    setImmediate(() => {
      const absPath = resolve(path);
      const entry = this.paths[absPath];
      if (entry) {
        if (entry.type === FS_DIRECTORY) {
          const err = illegalOperationOnDirectoryError(path, 'open');
          cb(err);
        } else if (entry.type === FS_FILE) {
          cb(null, entry.data);
        }
      } else {
        const err = noSuchFileError(path, 'open');
        cb(err);
      }
    });
  }

  createWriteStream(path) {
    if (typeof path !== 'string') {
      throw new Error(
          `FsMock: createWriteStream: path must be a string: ${path}`
      );
    }
    if (arguments.length > 1) {
      throw new Error(
          `FsMock: createWriteStream: too many arguments: ${arguments.length}`
      );
    };
    return new WriteStream(path, this.paths);
  }

  readdir(path, opts, cb) {
    if (typeof opts === 'function') cb = opts;
    setImmediate(() => {
      const entry = this.paths[resolve(path)];
      if (entry) {
        if (entry.type !== FS_DIRECTORY) {
          cb(notDirectoryError(path, 'scandir'));
        } else {
          cb(null, this.getChildren(path).map((child) => basename(child)));
        }
      } else {
        cb(noSuchFileError(path, 'scandir'));
      }
    });
  }
}
