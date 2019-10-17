import {
  exec,
} from '../../../src/gitify/exec';

const repository = 'repository';
const workingDir = 'workingDir';
const username = 'username';
const password = 'password';

describe('src', () => {
  describe('gitify', () => {
    describe('exec', () => {
      it('should do something', async () => {
        (await exec({
          repository,
          workingDir,
          username,
          password,
        })).should.eql({
          repository,
          workingDir,
          username,
          password,
        });
      });
    });
  });
});
