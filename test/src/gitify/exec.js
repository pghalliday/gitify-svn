import {
  exec,
} from '../../../src/gitify/exec';
import {
  SVN_MOCK,
} from '../../helpers/constants';

const repository = 'repository';
const workingDir = 'workingDir';
const username = 'username';
const password = 'password';

describe('src', () => {
  describe('gitify', () => {
    describe('exec', () => {
      it.skip('should do something', async () => {
        (await exec({
          repository,
          workingDir,
          username,
          password,
          binary: SVN_MOCK,
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
