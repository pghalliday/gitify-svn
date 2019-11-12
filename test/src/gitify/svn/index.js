import {
  svnFactory,
  NODE_KIND,
  ACTION,
} from '../../../../src/gitify/svn';
import {
  BinaryError,
} from '../../../../src/gitify/binary';
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
          let revision;

          beforeEach(() => {
            sinon.stub(svn, 'log');
            sinon.stub(svn, 'info');
            sinon.stub(svn, 'diffProps');
          });

          afterEach(() => {
            svn.log.restore();
            svn.info.restore();
            svn.diffProps.restore();
          });

          describe('when log throws an error', () => {
            beforeEach(() => {
              svn.log.rejects(new Error('oh noes!'));
            });

            it('should rethrow the error', async () => {
              await svn.revision({
                repository,
                revision: 100,
              }).should.be.rejectedWith('oh noes!');
            });
          });

          describe('when the revision does not exist', () => {
            beforeEach(async () => {
              svn.log.rejects(new BinaryError({
                message: 'message',
                code: 1,
                output: '\n\nsvn: E160006: No such revision 100\n',
              }));
              revision = await svn.revision({
                repository,
                revision: 100,
              });
            });

            it('should return undefined', () => {
              expect(revision).to.not.be.ok;
            });
          });

          describe('when the revision exists', () => {
            beforeEach(async () => {
              stubResolves(svn.log, {
                revision: 100,
                author: 'developer@company.com',
                date: new Date('2012-08-15T15:14:57.365Z'),
                message: 'message',
                changes: [{
                  action: ACTION.ADD,
                  path: '/new-path',
                  kind: NODE_KIND.DIRECTORY,
                }, {
                  action: ACTION.ADD,
                  path: '/moved-to-path',
                  copyFromPath: '/moved-from-path',
                  copyFromRevision: 75,
                  kind: NODE_KIND.UNSET,
                }],
              });
              stubResolves(svn.info, {
                path: '/move-to-path',
                url: 'http://path/to/repos/moved-to-path',
                relativeUrl: '^/moved-to-path',
                repositoryRoot: 'http://path/to/repos',
                repositoryUuid: 'UUID-UUID-UUID',
                revision: 100,
                nodeKind: NODE_KIND.DIRECTORY,
                lastChangedAuthor: 'developer@company.com',
                lastChangedRev: 100,
                lastChangedDate: new Date('2012-08-15T15:14:57.365Z'),
              });
              stubResolves(svn.diffProps, {
                '/path/to/directory1': {
                  'svn:externals': {
                    added: {
                      name6: {
                        url: 'url6',
                        revision: 234,
                      },
                    },
                    deleted: {
                      name3: 'url3',
                    },
                    modified: {
                      name1: 'url1',
                    },
                  },
                },
                '/path/to/directory2': {
                  'svn:externals': {
                    added: {
                      name5: 'url5',
                    },
                    deleted: {
                      name4: {
                        url: 'url4',
                        revision: 123,
                      },
                    },
                    modified: {
                    },
                  },
                },
              });
              revision = await svn.revision({
                repository,
                revision: 100,
              });
            });

            it('should get the log', () => {
              svn.log.should.have.been.calledWith({
                repository,
                revision: 100,
              });
            });

            it('should get the info for changes without kind', () => {
              svn.info.should.have.been.calledWith({
                repository,
                path: '/moved-to-path',
                revision: 100,
              });
            });

            it('should get the diffProps', () => {
              svn.diffProps.should.have.been.calledWith({
                repository,
                revision: 100,
              });
            });

            it('should compile the revision', () => {
              revision.should.eql({
                revision: 100,
                author: 'developer@company.com',
                date: new Date('2012-08-15T15:14:57.365Z'),
                message: 'message',
                changes: {
                  paths: [{
                    action: ACTION.ADD,
                    path: '/new-path',
                    kind: NODE_KIND.DIRECTORY,
                  }, {
                    action: ACTION.ADD,
                    path: '/moved-to-path',
                    copyFromPath: '/moved-from-path',
                    copyFromRevision: 75,
                    kind: NODE_KIND.DIRECTORY,
                  }],
                  externals: [{
                    action: ACTION.ADD,
                    path: '/path/to/directory1/name6',
                    url: 'url6',
                    revision: 234,
                  }, {
                    action: ACTION.DELETE,
                    path: '/path/to/directory1/name3',
                    url: 'url3',
                    revision: undefined,
                  }, {
                    action: ACTION.MODIFY,
                    path: '/path/to/directory1/name1',
                    url: 'url1',
                    revision: undefined,
                  }, {
                    action: ACTION.ADD,
                    path: '/path/to/directory2/name5',
                    url: 'url5',
                    revision: undefined,
                  }, {
                    action: ACTION.DELETE,
                    path: '/path/to/directory2/name4',
                    url: 'url4',
                    revision: 123,
                  }],
                },
              });
            });
          });
        });
      });
    });
  });
});
