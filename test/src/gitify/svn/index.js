import {
  Svn,
} from '../../../../src/gitify/svn';
import {
  SVN_MOCK,
  DIRECTORY_INFO,
  PARSED_DIRECTORY_INFO,
  VALID_LOG,
  PARSED_VALID_LOG,
  VALID_DIFF_PROPS,
  PARSED_VALID_DIFF_PROPS,
} from '../../../helpers/constants';
import {
  FsMock,
  FS_FILE,
  FS_DIRECTORY,
} from '../../../mocks/fs';
import {
  RequestMock,
} from '../../../mocks/request';
import credentials from '../../../../src/gitify/svn/credentials';

const username = 'username';
const password = 'password';
const auth = 'auth';
const args = ['args'];
const repository = 'the repository';
const revision = 'revision';
const path = 'the path';
const destination = 'destination';

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      let init;
      let svn;

      before(() => {
        init = sinon.stub(credentials, 'init');
        init.resolves(undefined);
        credentials.auth = auth;
        credentials.args = args;
      });

      describe('init', () => {
        before(async () => {
          svn = new Svn();
          await svn.init({
            username,
            password,
            svnBinary: SVN_MOCK,
          });
        });

        it('should initialise the credentials', () => {
          init.should.have.been.calledWith({
            username,
            password,
          });
        });

        describe('download', () => {
          let fsMock;
          let requestMock;

          describe('when the request is invalid', () => {
            before(() => {
              fsMock = new FsMock({});
              requestMock = new RequestMock({
                error: new Error('FAIL'),
              });
            });

            after(() => {
              fsMock.restore();
              requestMock.restore();
            });

            it('should fail', async () => {
              await svn.download({
                repository,
                path,
                revision,
                destination,
              }).should.be.rejectedWith('FAIL');
              const entry = fsMock.getEntry(destination);
              expect(entry).to.not.be.ok;
            });
          });

          describe('when the request fails', () => {
            before(() => {
              fsMock = new FsMock({});
              requestMock = new RequestMock({
                statusCode: 404,
              });
            });

            after(() => {
              fsMock.restore();
              requestMock.restore();
            });

            it('should fail', async () => {
              await svn.download({
                repository,
                path,
                revision,
                destination,
              }).should.be.rejectedWith(
                  // eslint-disable-next-line max-len
                  `Failed to download file: ${repository}/!svn/bc/${revision}${path}: statusCode: 404`
              );
              const entry = fsMock.getEntry(destination);
              entry.type.should.eql(FS_FILE);
              entry.data.should.eql(JSON.stringify({
                statusCode: 404,
              }), null, 2);
            });
          });

          describe('when the destination cannot be written', () => {
            before(() => {
              fsMock = new FsMock({
                [destination]: {
                  type: FS_DIRECTORY,
                },
              });
              requestMock = new RequestMock({});
            });

            after(() => {
              fsMock.restore();
              requestMock.restore();
            });

            it('should fail', async () => {
              await svn.download({
                repository,
                path,
                revision,
                destination,
              }).should.be.rejectedWith(
                  // eslint-disable-next-line max-len
                  `EISDIR: illegal operation on a directory, open '${destination}'`
              );
            });
          });

          describe('when the request succeeds', () => {
            before(async () => {
              fsMock = new FsMock({});
              requestMock = new RequestMock({});
              await svn.download({
                repository,
                path,
                revision,
                destination,
              });
            });

            after(() => {
              fsMock.restore();
              requestMock.restore();
            });

            it('should download a file to the specified destination', () => {
              const entry = fsMock.getEntry(destination);
              entry.type.should.eql(FS_FILE);
              entry.data.should.eql(JSON.stringify({
                url: `${repository}/!svn/bc/${revision}${path}`,
                options: {
                  auth,
                },
              }), null, 2);
            });
          });
        });

        describe('when the svn executable can be found', () => {
          describe('exec', () => {
            it('should return the output on zero exit code', async () => {
              const output = await svn.exec(['arg1', 'arg2']);
              output.should.eql(
                  'args arg1 arg2\n'
              );
            });

            it('should error on non-zero exit code', async () => {
              await svn.exec(['error'])
                  .should.be.rejectedWith(
                      'Exited with code: 1\nOutput:\n\nargs error\n'
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

            // eslint-disable-next-line max-len
            it('should request a verbose xml log for the revision', async () => {
              const log = await svn.log({repository, revision});
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

            // eslint-disable-next-line max-len
            it('should request xml info for the path and revision', async () => {
              const info = await svn.info({
                repository,
                path,
                revision,
              });
              svn.exec.should.have.been.calledWith(
                  ['info', `${encodeURI(repository+path)}@${revision}`, '--xml']
              );
              info.should.eql(PARSED_DIRECTORY_INFO);
            });
          });

          describe('diffProps', () => {
            before(() => {
              sinon.stub(svn, 'exec').callsFake(() => VALID_DIFF_PROPS);
            });

            after(() => {
              svn.exec.restore();
            });

            // eslint-disable-next-line max-len
            it('should request diff of SVN propertiesfor the revision', async () => {
              const diffProps = await svn.diffProps({
                repository,
                revision,
              });
              svn.exec.should.have.been.calledWith([
                'diff',
                `${encodeURI(repository)}`,
                '-c',
                revision,
                '--properties-only',
              ]);
              diffProps.should.eql(PARSED_VALID_DIFF_PROPS);
            });
          });

          describe('revision', () => {
            it('should throw a not implemented error', async () => {
              await svn.revision({
                repository,
                revision: 1,
              }).should.be.rejectedWith('Svn: revision: not yet implemented');
            });
          });
        });

        describe('when the svn executable cannot be found', () => {
          before(async () => {
            svn = new Svn();
            await svn.init({
              username,
              password,
              svnBinary: 'invalid-binary',
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
});
