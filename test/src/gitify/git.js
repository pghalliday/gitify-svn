import {
  gitFactory,
} from '../../../src/gitify/git';
import Binary from '../../../src/gitify/binary';
import {
  createInstance,
  createConstructor,
  checkConstructed,
} from '../../helpers/utils';

const bin = 'bin';

describe('src', () => {
  describe('gitify', () => {
    describe('git', () => {
      let binary;
      let FakeBinary;
      let Git;
      let git;

      beforeEach(() => {
        binary = createInstance(Binary, {
          exec: sinon.stub(),
        });
        FakeBinary = createConstructor([
          binary,
        ]);
        Git = gitFactory({
          Binary: FakeBinary,
        });
        git = new Git();
      });

      describe('init', () => {
        beforeEach(() => {
          git.init({
            binary: bin,
          });
        });

        it('should create the Binary instance', () => {
          checkConstructed(FakeBinary, {
            binary: bin,
            args: [],
          });
        });

        describe('create', () => {
          it('should throw not implemented', async () => {
            await git.create().should.be.rejectedWith('');
          });
        });
      });
    });
  });
});
