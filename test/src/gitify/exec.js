import {
  exec,
} from '../../../src/gitify/exec';

const repository = 'repository';
const workingDir = 'workingDir';

describe('gitify', () => {
  describe('gitify', () => {
    describe('exec', () => {
      it('should do something', async () => {
        (await exec({
          repository,
          workingDir,
        })).should.eql({
          repository,
          workingDir,
        });
      });
    });
  });
});
