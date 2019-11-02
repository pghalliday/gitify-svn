import stateFactory from '../../../../src/gitify/state';
import svnRepositoryFactory from '../../../../src/gitify/state/svn-repository';
import prompt from '../../../../src/gitify/prompt';
import stateFile from '../../../../src/gitify/state/state-file';
// eslint-disable-next-line max-len
import repositoriesDirectory from '../../../../src/gitify/state/repositories-directory';
import {
  PROMPT_REPOSITORY_URL,
  PROMPT_REPOSITORY_NAME,
} from '../../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  checkCreated,
  stubReturns,
  stubResolves,
} from '../../../helpers/utils';

const SvnRepository = svnRepositoryFactory({});

const url = 'url';
const name = 'name';
const uuid = 'uuid';
const url2 = 'url2';
const name2 = 'name2';
const uuid2 = 'uuid2';
const url3 = 'url3';
const name3 = 'name3';
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

describe('src', () => {
  describe('gitify', () => {
    describe('State', () => {
      let read;
      let write;
      let input;
      let init;
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
        init = sinon.stub(repositoriesDirectory, 'init');
        getNext = sinon.stub();
        getNext2 = sinon.stub();
        getNext3 = sinon.stub();
        svnRepository = createInstance(SvnRepository, {
          export: sinon.stub().returns(exportedSvnRepository),
          getNext,
        });
        svnRepository.uuid = uuid;
        svnRepository2 = createInstance(SvnRepository, {
          getNext: getNext2,
        });
        svnRepository2.uuid = uuid2;
        svnRepository3 = createInstance(SvnRepository, {
          getNext: getNext3,
        });
        svnRepository3.uuid = uuid3;
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
        init.restore();
      });

      describe('init with no state file', () => {
        beforeEach(async () => {
          stubResolves(read, undefined);
          await state.init();
        });

        it('should initialise the repositories directory', () => {
          init.should.have.been.called;
        });

        it('should initialise a new state', () => {
          state.svnRepositories.should.eql({});
        });

        describe('then getNext', () => {
          beforeEach(async () => {
            stubReturns(input, [url, name]);
            stubResolves(getNext, revision);
            next = await state.getNext();
          });

          // eslint-disable-next-line max-len
          it('should prompt for an SVN repository to convert and add it', () => {
            prompt.input.getCall(0).should.have.been.calledWith(
                PROMPT_REPOSITORY_URL
            );
            prompt.input.getCall(1).should.have.been.calledWith(
                PROMPT_REPOSITORY_NAME
            );
            checkCreated(FakeSvnRepository, {
              name,
              url,
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
          beforeEach(async () => {
            await state.addSvnRepository({
              name,
              url,
            });
          });

          it('should add the SVN repository', () => {
            checkCreated(FakeSvnRepository, {
              name,
              url,
            });
            state.svnRepositories.should.eql({
              [uuid]: svnRepository,
            });
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

            it('should get the next revision from the SVN repository', () => {
              next.should.eql(revision);
            });
          });

          describe('then addSvnRepository again', () => {
            beforeEach(async () => {
              await state.addSvnRepository({
                name: name2,
                url: url2,
              });
            });

            it('should add the SVN repository', () => {
              checkCreated(FakeSvnRepository, {
                name: name2,
                url: url2,
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
                stubReturns(input, [url3, name3]);
                stubResolves(getNext, undefined);
                stubResolves(getNext2, undefined);
                stubResolves(getNext3, revision3);
                next = await state.getNext();
              });

              // eslint-disable-next-line max-len
              it('should prompt for an SVN repository to convert and add it', () => {
                prompt.input.getCall(0).should.have.been.calledWith(
                    PROMPT_REPOSITORY_URL
                );
                prompt.input.getCall(1).should.have.been.calledWith(
                    PROMPT_REPOSITORY_NAME
                );
                checkCreated(FakeSvnRepository, {
                  name: name3,
                  url: url3,
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
      });

      describe('init with a state file', () => {
        beforeEach(async () => {
          stubResolves(read, exported);
          await state.init();
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
