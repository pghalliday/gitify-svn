import {
  Svn,
} from '../../../../src/gitify/svn';
import {
  SVN_MOCK,
  DIRECTORY_INFO,
  PARSED_DIRECTORY_INFO,
} from '../../../helpers/constants';

const username = 'username';
const password = 'password';
const repository = 'the repository';
const revision = 'revision';
const path = 'the path';

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      let svn;

      it('should default to the system svn executable', () => {
        svn = new Svn({
          username,
          password,
          repository,
        });
        svn.binary.should.eql('svn');
      });

      describe('when the svn executable can be found', () => {
        before(() => {
          svn = new Svn({
            binary: SVN_MOCK,
            username,
            password,
            repository,
          });
        });

        describe('exec', () => {
          it('should return the output on zero exit code', async () => {
            const output = await svn.exec(['arg1', 'arg2']);
            output.should.eql(
                '--username username --password password arg1 arg2\n'
            );
          });

          it('should error on non-zero exit code', async () => {
            await svn.exec(['error'])
                .should.be.rejectedWith(
                    // eslint-disable-next-line max-len
                    'Exited with code: 1\nOutput:\n\n--username username --password password error\n'
                );
          });
        });

        describe('log', () => {
          it('should request a verbose log for the revision', async () => {
            const output = await svn.log({revision});
            output.should.eql(
                // eslint-disable-next-line max-len
                `--username username --password password log ${encodeURI(repository)} -v -r ${revision}\n`
            );
          });
        });

        describe('info', () => {
          before(() => {
            sinon.stub(svn, 'exec').callsFake(() => DIRECTORY_INFO);
          });

          after(() => {
            svn.exec.restore();
          });

          it('should request info for the path at the revision', async () => {
            const info = await svn.info({
              path,
              revision,
            });
            svn.exec.should.have.been.calledWith(
                ['info', `${encodeURI(repository+path)}@${revision}`]
            );
            info.should.eql(PARSED_DIRECTORY_INFO);
          });
        });
      });

      describe('when the svn executable cannot be found', () => {
        before(() => {
          svn = new Svn({
            binary: 'invalid-binary',
            username,
            password,
            repository,
          });
        });

        describe('exec', () => {
          it('should error', async () => {
            await svn.exec([0, 'arg']).should.be.rejectedWith('ENOENT');
          });
        });
      });
    });
  });
});
