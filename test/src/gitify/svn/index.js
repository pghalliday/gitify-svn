import {
  Svn,
} from '../../../../src/gitify/svn';
import {
  SVN_MOCK,
  DIRECTORY_INFO,
  PARSED_DIRECTORY_INFO,
  VALID_LOG,
  PARSED_VALID_LOG,
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

      describe('when the svn executable can be found', () => {
        before(() => {
          svn = new Svn({
            svnBinary: SVN_MOCK,
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
          before(() => {
            sinon.stub(svn, 'exec').callsFake(() => VALID_LOG);
          });

          after(() => {
            svn.exec.restore();
          });

          it('should request a verbose xml log for the revision', async () => {
            const log = await svn.log({revision});
            svn.exec.should.have.been.calledWith([
              'log',
              `${encodeURI(repository)}`,
              '--xml',
              '-v',
              '-r',
              revision,
            ]);
            log.should.eql(PARSED_VALID_LOG);
          });
        });

        describe('info', () => {
          before(() => {
            sinon.stub(svn, 'exec').callsFake(() => DIRECTORY_INFO);
          });

          after(() => {
            svn.exec.restore();
          });

          it('should request xml info for the path and revision', async () => {
            const info = await svn.info({
              path,
              revision,
            });
            svn.exec.should.have.been.calledWith(
                ['info', `${encodeURI(repository+path)}@${revision}`, '--xml']
            );
            info.should.eql(PARSED_DIRECTORY_INFO);
          });
        });
      });

      describe('when the svn executable cannot be found', () => {
        before(() => {
          svn = new Svn({
            svnBinary: 'invalid-binary',
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
