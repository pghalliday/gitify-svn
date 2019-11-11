import {
  svnFactory,
} from '../../../../src/gitify/svn';
import {
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
import Binary from '../../../../src/gitify/binary';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  stubReturns,
  stubResolves,
} from '../../../helpers/utils';

const bin = 'bin';

const username = 'username';
const password = 'password';
const auth = 'auth';
const args = ['args'];
const repository = 'the repository';
const revision = 'revision';
const path = 'the path';
const destination = 'destination';

const binary = createInstance(Binary, {
  exec: sinon.stub(),
});
const FakeBinary = createConstructor();
const Svn = svnFactory({
  Binary: FakeBinary,
});

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      let svn;

      before(() => {
        sinon.stub(credentials, 'init');
        credentials.init.resolves(undefined);
        credentials.auth = auth;
        credentials.args = args;
        stubReturns(FakeBinary, binary);
        svn = new Svn();
      });

      after(() => {
        credentials.init.restore();
      });

      describe('init', () => {
        before(async () => {
          await svn.init({
            username,
            password,
            binary: bin,
          });
        });

        it('should initialise the credentials', () => {
          credentials.init.should.have.been.calledWith({
            username,
            password,
          });
        });

        it('should create the Binary instance', () => {
          checkConstructed(FakeBinary, {
            binary: bin,
            args: credentials.args,
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

        describe('log', () => {
          before(() => {
            stubResolves(binary.exec, VALID_LOG);
          });

          // eslint-disable-next-line max-len
          it('should request a verbose xml log for the revision', async () => {
            const log = await svn.log({repository, revision});
            binary.exec.should.have.been.calledWith([
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
            stubResolves(binary.exec, DIRECTORY_INFO);
          });

          // eslint-disable-next-line max-len
          it('should request xml info for the path and revision', async () => {
            const info = await svn.info({
              repository,
              path,
              revision,
            });
            binary.exec.should.have.been.calledWith(
                ['info', `${encodeURI(repository+path)}@${revision}`, '--xml']
            );
            info.should.eql(PARSED_DIRECTORY_INFO);
          });
        });

        describe('diffProps', () => {
          before(() => {
            stubResolves(binary.exec, VALID_DIFF_PROPS);
          });

          // eslint-disable-next-line max-len
          it('should request diff of SVN propertiesfor the revision', async () => {
            const diffProps = await svn.diffProps({
              repository,
              revision,
            });
            binary.exec.should.have.been.calledWith([
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
    });
  });
});
