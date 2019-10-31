import Git from '../../../../src/gitify/git';

const folder = 'folder';
const name = 'name';

describe('src', () => {
  describe('gitify', () => {
    describe('git', () => {
      let git;

      beforeEach(() => {
        git = new Git({
          folder,
          name,
        });
      });

      describe('init', () => {
        it('should throw a not implemented error', async () => {
          await git.init().should.be.rejectedWith(
              'Git: init: not implemented yet'
          );
        });
      });
    });
  });
});
