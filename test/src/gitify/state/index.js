import {
  stateFactory,
} from '../../../../src/gitify/state';
import SvnRepository from '../../../../src/gitify/state/svn-repository';
import prompt from '../../../../src/gitify/prompt';
import svn from '../../../../src/gitify/svn';
import stateFile from '../../../../src/gitify/state/state-file';
// eslint-disable-next-line max-len
import repositoriesDirectory from '../../../../src/gitify/state/repositories-directory';
import {
  PROMPT_REPOSITORY_URL,
  promptConfirmRoot,
} from '../../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  checkCreated,
  stubReturns,
  stubResolves,
} from '../../../helpers/utils';

const url = 'url';
const incorrectUrl = 'incorrectUrl';
const uuid = 'uuid';
const url2 = 'url2';
const uuid2 = 'uuid2';
const url3 = 'url3';
const uuid3 = 'uuid3';
const revision = {
  date: new Date('2019-01-01'),
  uuid,
};
const revision2 = {
  date: new Date('2018-01-01'),
  uuid: uuid2,
};
const revision3 = {
  date: new Date('2018-07-01'),
  uuid: uuid3,
};
const exportedSvnRepository = 'exportedSvnRepository';
const exported = {
  svnRepositories: {
    [uuid]: exportedSvnRepository,
  },
};
const repositories = [
  url,
  url2,
  url3,
];
const info = {
  repositoryRoot: url,
  repositoryUuid: uuid,
};
const info2 = {
  repositoryRoot: url2,
  repositoryUuid: uuid2,
};
const info3 = {
  repositoryRoot: url3,
  repositoryUuid: uuid3,
};

describe('src', () => {
  describe('gitify', () => {
    describe('State', () => {
      let read;
      let write;
      let input;
      let confirm;
      let init;
      let infoMethod;
      let getNext;
      let getNext2;
      let getNext3;
      let svnRepository;
      let svnRepository2;
      let svnRepository3;
      let FakeSvnRepository;
      let State;
      let state;
      let next;

      beforeEach(() => {
        read = sinon.stub(stateFile, 'read');
        write = sinon.stub(stateFile, 'write');
        input = sinon.stub(prompt, 'input');
        confirm = sinon.stub(prompt, 'confirm');
        init = sinon.stub(repositoriesDirectory, 'init');
        infoMethod = sinon.stub(svn, 'info');
        getNext = sinon.stub();
        getNext2 = sinon.stub();
        getNext3 = sinon.stub();
        svnRepository = createInstance(SvnRepository, {
          export: sinon.stub().returns(exportedSvnRepository),
          getNext,
        });
        svnRepository.uuid = uuid;
        svnRepository.url = url;
        svnRepository2 = createInstance(SvnRepository, {
          getNext: getNext2,
        });
        svnRepository2.uuid = uuid2;
        svnRepository2.url = url2;
        svnRepository3 = createInstance(SvnRepository, {
          getNext: getNext3,
        });
        svnRepository3.uuid = uuid3;
        svnRepository3.url = url3;
        FakeSvnRepository = createConstructor([
          svnRepository,
          svnRepository2,
          svnRepository3,
        ]);
        State = stateFactory({
          SvnRepository: FakeSvnRepository,
        });
        state = new State();
      });

      afterEach(() => {
        read.restore();
        write.restore();
        input.restore();
        infoMethod.restore();
        confirm.restore();
        init.restore();
      });

      describe('init with repositories', () => {
        beforeEach(async () => {
          stubResolves(read, undefined);
          stubResolves(infoMethod, [
            info,
            info2,
            info3,
          ]);
          await state.init({repositories});
        });

        it('should initialise the repositories directory', () => {
          init.should.have.been.called;
        });

        it('should add the given repositories', () => {
          state.svnRepositories.should.eql({
            [uuid]: svnRepository,
            [uuid2]: svnRepository2,
            [uuid3]: svnRepository3,
          });
        });
      });

      describe('init with no state file', () => {
        beforeEach(async () => {
          stubResolves(read, undefined);
          await state.init({repositories: []});
        });

        it('should initialise the repositories directory', () => {
          init.should.have.been.called;
        });

        it('should init the state', () => {
          state.svnRepositories.should.eql({
          });
        });

        describe('then getNext', () => {
          beforeEach(async () => {
            stubResolves(infoMethod, [
              info,
            ]);
            stubReturns(input, [url]);
            stubResolves(getNext, revision);
            next = await state.getNext();
          });

          // eslint-disable-next-line max-len
          it('should prompt for an SVN repository to convert and add it', () => {
            prompt.input.getCall(0).should.have.been.calledWith(
                PROMPT_REPOSITORY_URL
            );
            checkCreated(FakeSvnRepository, {
              url,
              uuid,
            });
            state.svnRepositories.should.eql({
              [uuid]: svnRepository,
            });
          });

          it('should get the next revision from the SVN repository', () => {
            next.should.eql(revision);
          });
        });

        describe('then addSvnRepository', () => {
          describe('when the url is the correct root url', () => {
            beforeEach(async () => {
              stubResolves(infoMethod, [
                info,
              ]);
              await state.addSvnRepository({
                url,
              });
            });

            it('should get the rpository info', () => {
              infoMethod.should.have.been.calledWith({
                repository: url,
                revision: 0,
                path: '',
              });
            });

            it('should add the svn repository', () => {
              checkCreated(FakeSvnRepository, {
                url,
                uuid,
              });
              state.svnRepositories.should.eql({
                [uuid]: svnRepository,
              });
            });

            it('should write the state file', () => {
              stateFile.write.should.have.been.calledWith(exported);
            });

            describe('then getNext', () => {
              let next;

              beforeEach(async () => {
                stubResolves(getNext, revision);
                next = await state.getNext();
              });

              it('should not prompt and add a repository', () => {
                input.should.not.have.been.called;
                state.svnRepositories.should.eql({
                  [uuid]: svnRepository,
                });
              });

              it('should get the next revision from the svn repository', () => {
                next.should.eql(revision);
              });
            });

            describe('then addSvnRepository again with the same url', () => {
              beforeEach(async () => {
                stubResolves(infoMethod, [
                  info,
                ]);
                await state.addSvnRepository({
                  url,
                });
              });

              it('should not add the svn repository', () => {
                state.svnRepositories.should.eql({
                  [uuid]: svnRepository,
                });
              });
            });

            describe('then addSvnRepository again', () => {
              beforeEach(async () => {
                stubResolves(infoMethod, [
                  info2,
                ]);
                await state.addSvnRepository({
                  url: url2,
                });
              });

              it('should add the svn repository', () => {
                checkCreated(FakeSvnRepository, {
                  url: url2,
                  uuid: uuid2,
                });
                state.svnRepositories.should.eql({
                  [uuid]: svnRepository,
                  [uuid2]: svnRepository2,
                });
              });

              describe('then getNext', () => {
                let next;

                beforeEach(async () => {
                  stubResolves(getNext, revision);
                  stubResolves(getNext2, revision2);
                  next = await state.getNext();
                });

                it('should not prompt and add a repository', () => {
                  input.should.not.have.been.called;
                  state.svnRepositories.should.eql({
                    [uuid]: svnRepository,
                    [uuid2]: svnRepository2,
                  });
                });

                // eslint-disable-next-line max-len
                it('should get the next revision with the earliest timestamp', () => {
                  next.should.eql(revision2);
                });
              });

              // eslint-disable-next-line max-len
              describe('then getNext when the second repository has no next revision', () => {
                let next;

                beforeEach(async () => {
                  stubResolves(getNext, revision);
                  stubResolves(getNext2, undefined);
                  next = await state.getNext();
                });

                it('should not prompt and add a repository', () => {
                  input.should.not.have.been.called;
                  state.svnRepositories.should.eql({
                    [uuid]: svnRepository,
                    [uuid2]: svnRepository2,
                  });
                });

                // eslint-disable-next-line max-len
                it('should get the next revision from the first repository', () => {
                  next.should.eql(revision);
                });
              });

              // eslint-disable-next-line max-len
              describe('then getNext when no repository has a next revision', () => {
                let next;

                beforeEach(async () => {
                  stubResolves(infoMethod, [
                    info3,
                  ]);
                  stubReturns(input, [url3]);
                  stubResolves(getNext, undefined);
                  stubResolves(getNext2, undefined);
                  stubResolves(getNext3, revision3);
                  next = await state.getNext();
                });

                // eslint-disable-next-line max-len
                it('should prompt for an svn repository to convert and add it', () => {
                  prompt.input.getCall(0).should.have.been.calledWith(
                      PROMPT_REPOSITORY_URL
                  );
                  checkCreated(FakeSvnRepository, {
                    url: url3,
                    uuid: uuid3,
                  });
                  state.svnRepositories.should.eql({
                    [uuid]: svnRepository,
                    [uuid2]: svnRepository2,
                    [uuid3]: svnRepository3,
                  });
                });

                // eslint-disable-next-line max-len
                it('should get the next revision from the new SVN repository', () => {
                  next.should.eql(revision3);
                });

                // eslint-disable-next-line max-len
                describe('then getNext with all 3 revisions', () => {
                  let next;

                  beforeEach(async () => {
                    stubResolves(input, []);
                    stubResolves(getNext, revision);
                    stubResolves(getNext2, revision2);
                    stubResolves(getNext3, revision3);
                    next = await state.getNext();
                  });

                  it('should not prompt and add a repository', () => {
                    input.should.not.have.been.called;
                    state.svnRepositories.should.eql({
                      [uuid]: svnRepository,
                      [uuid2]: svnRepository2,
                      [uuid3]: svnRepository3,
                    });
                  });

                  // eslint-disable-next-line max-len
                  it('should get the next revision with the earliest timestamp', () => {
                    next.should.eql(revision2);
                  });
                });
              });
            });
          });

          describe('when the url is not the root url', () => {
            // eslint-disable-next-line max-len
            describe('and the user chooses to switch to the correct root', () => {
              beforeEach(async () => {
                stubResolves(infoMethod, [
                  info,
                ]);
                stubResolves(confirm, true);
                await state.addSvnRepository({
                  url: incorrectUrl,
                });
              });

              it('should add the svn repository', () => {
                confirm.should.have.been.calledWith(
                    promptConfirmRoot(url),
                    true,
                );
                checkCreated(FakeSvnRepository, {
                  url,
                  uuid,
                });
                state.svnRepositories.should.eql({
                  [uuid]: svnRepository,
                });
              });

              it('should write the state file', () => {
                stateFile.write.should.have.been.calledWith(exported);
              });
            });

            // eslint-disable-next-line max-len
            describe('and the user chooses not to switch to the correct root', () => {
              beforeEach(() => {
                stubResolves(infoMethod, [
                  info,
                ]);
                stubResolves(confirm, false);
              });

              it('should throw an error', async () => {
                await state.addSvnRepository({
                  url: incorrectUrl,
                }).should.be.rejectedWith(
                    'Can only convert the root of an SVN repository'
                );
              });
            });
          });
        });
      });

      describe('init with a state file', () => {
        beforeEach(async () => {
          stubResolves(read, exported);
          await state.init({repositories: []});
        });

        it('should populate the instance', () => {
          checkConstructed(FakeSvnRepository, {
            exported: exportedSvnRepository,
          });
          state.svnRepositories.should.eql({
            [uuid]: svnRepository,
          });
        });

        describe('then getNext', () => {
          beforeEach(async () => {
            stubResolves(getNext, revision);
            next = await state.getNext();
          });

          it('should get the next revision', () => {
            next.should.eql(revision);
          });

          describe('then resolve', () => {
            beforeEach(async () => {
              await state.resolve();
            });

            it('should resolve the repository revision', () => {
              svnRepository.resolve.should.have.been.called;
            });

            it('should write the state file', () => {
              stateFile.write.should.have.been.calledWith(exported);
            });
          });
        });
      });
    });
  });
});
