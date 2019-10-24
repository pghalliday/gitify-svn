import request from 'request';
import sinon from 'sinon';
import EventEmitter from 'events';

const EXCEPTIONS = [
];

class Get extends EventEmitter {
  constructor({error, statusCode, url, options}) {
    super();
    setImmediate(() => {
      if (error) {
        this.emit('error', error);
      } else if (statusCode) {
        this.emit('response', {
          statusCode,
        });
        if (this.writeStream) {
          this.writeStream.end(JSON.stringify({
            statusCode,
          }));
        }
      } else {
        this.emit('response', {
          statusCode: 200,
        });
        if (this.writeStream) {
          this.writeStream.end(JSON.stringify({
            url,
            options,
          }));
        }
      }
    });
  }

  pipe(writeStream) {
    this.writeStream = writeStream;
    return writeStream;
  }
}

export class RequestMock {
  constructor({error, statusCode}) {
    // set error if errors should be thrown on requests
    this.error = error;
    // set the statusCode that should be given for responses
    this.statusCode = statusCode;
    // stub all the methods of the request object
    Object.keys(request).forEach((key) => {
      if (
        typeof request[key] === 'function' &&
        EXCEPTIONS.indexOf(key) === -1
      ) {
        if (this[key]) {
          sinon.stub(request, key).callsFake(this[key].bind(this));
        } else {
          sinon.stub(request, key).callsFake(() => {
            throw new Error(`RequestMock: Not implemented: ${key}`);
          });
        }
        if (!request[key].restore) {
          console.warn(`RequestMock: unable to stub: ${key}`);
        }
      }
    });
  }

  restore() {
    Object.keys(request).forEach((key) => {
      if (typeof request[key] === 'function' && request[key].restore) {
        request[key].restore();
      }
    });
  }

  get(url, options) {
    if (typeof url !== 'string') {
      throw new Error(`RequestMock: Get: url must be a string: ${url}`);
    }
    if (typeof options !== 'object') {
      throw new Error(
          `RequestMock: Get: options must be an object: ${options}`
      );
    }
    if (arguments.length > 2) {
      throw new Error(
          `RequestMock: Get: too many arguments: ${arguments.length}`
      );
    }
    return new Get({
      error: this.error,
      statusCode: this.statusCode,
      url,
      options,
    });
  }
}
