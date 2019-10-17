import {
  spawn,
} from 'child_process';

const SVN = 'svn';

export class Svn {
  constructor({
    binary = SVN,
    username,
    password,
    repository,
  }) {
    console.log(binary);
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

  log({revision}) {
    return this.exec(['log', this.repository, '-v', '-r', revision]);
  }

  info({path, revision}) {
    return this.exec(['info', `${this.repository}${path}@${revision}`]);
  }
}
