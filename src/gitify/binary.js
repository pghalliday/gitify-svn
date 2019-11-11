import {
  spawn,
} from 'child_process';
import loggerFactory from '../logger';

const logger = loggerFactory.create(__filename);

export default class Binary {
  constructor({
    binary,
    args,
  }) {
    this.binary = binary;
    this.args = args;
  }

  exec(args, options) {
    return new Promise((resolve, reject) => {
      const allArgs = this.args.concat(args);
      logger.debug({
        spawn: this.binary,
        args: allArgs,
        cwd: options ? options.cwd : undefined,
      });
      logger.silly({
        env: options ? options.env : undefined,
      });
      const child = spawn(this.binary, allArgs, options);
      let output = '';
      const appendOutput = (data) => {
        output += data.toString();
      };
      child.stdout.on('data', appendOutput);
      child.stderr.on('data', appendOutput);
      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Exited with code: ${code}\nOutput:\n\n${output}`));
        }
      });
      child.on('error', (error) => {
        reject(error);
      });
    });
  }
}
