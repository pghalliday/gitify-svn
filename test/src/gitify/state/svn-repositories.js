import {
  svnRepositoriesFactory,
} from '../../../../src/gitify/state/svn-repositories';
import SvnRepository from '../../../../src/gitify/state/svn-repository';
import prompt from '../../../../src/gitify/prompt';
// eslint-disable-next-line max-len
import repositoriesDirectory from '../../../../src/gitify/state/repositories-directory';
import stateFile from '../../../../src/gitify/state/state-file';
import {
  PROMPT_REPOSITORY_URL,
} from '../../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  checkCreated,
  stubResolves,
  stubReturns,
} from '../../../helpers/utils';

function fakeSvnRepository(index, uuid) {
  const svnRepository = createInstance(SvnRepository, {
    initProject: sinon.stub(),
    export: sinon.stub().returns(`exported${index}`),
    getNext: sinon.stub(),
    processNext: sinon.stub(),
  });
  svnRepository.uuid = `uuid${uuid || index}`;
  svnRepository.url = `url${index}`;
  return svnRepository;
}

function fakeRevision(index, date, uuid) {
  return {
    date: new Date(date),
    uuid: `uuid${uuid || index}`,
  };
}

const svnRepository1 = fakeSvnRepository(1);
const svnRepository2 = fakeSvnRepository(2);
const svnRepository3 = fakeSvnRepository(3);
const svnRepository4 = fakeSvnRepository(4);
const svnRepository5 = fakeSvnRepository(5);
// svnRepository6 should be a duplicate of svnRepository3
const svnRepository6 = fakeSvnRepository(6, 3);
const revision1 = fakeRevision(1, '2019-01-01');
const revision2 = fakeRevision(2, '2018-07-01');
const revision3 = fakeRevision(3, '2018-03-01');
const revision4 = fakeRevision(4, '2018-09-01');
const revision5 = fakeRevision(5, '2017-09-01');

const FakeSvnRepository = createConstructor();
const SvnRepositories = svnRepositoriesFactory({
  SvnRepository: FakeSvnRepository,
});

describe('src', () => {
  describe('gitify', () => {
    describe('State', () => {
      describe('SvnRepositories', () => {
        let svnRepositories;

        beforeEach(() => {
          sinon.stub(prompt, 'input');
          sinon.stub(repositoriesDirectory, 'init');
          sinon.stub(stateFile, 'read');
          sinon.stub(stateFile, 'write').resolves(undefined);
          stubResolves(stateFile.read, []);
          stubResolves(svnRepository1.initProject, []);
          stubResolves(svnRepository2.initProject, []);
          stubResolves(svnRepository3.initProject, []);
          stubResolves(svnRepository4.initProject, []);
          stubResolves(svnRepository5.initProject, []);
          stubResolves(svnRepository6.initProject, []);
          stubResolves(svnRepository1.processNext, []);
          stubResolves(svnRepository2.processNext, []);
          stubResolves(svnRepository3.processNext, []);
          stubResolves(svnRepository4.processNext, []);
          stubResolves(svnRepository5.processNext, []);
          stubResolves(svnRepository6.processNext, []);
          svnRepositories = new SvnRepositories();
        });

        afterEach(() => {
          prompt.input.restore();
          repositoriesDirectory.init.restore();
          stateFile.read.restore();
          stateFile.write.restore();
        });

        describe('init', () => {
          describe('without exported', () => {
            beforeEach(async () => {
              stubResolves(stateFile.read, undefined);
              stubResolves(FakeSvnRepository.create, [
                svnRepository1,
                svnRepository2,
              ]);
              stubResolves(svnRepository1.initProject, undefined);
              stubResolves(svnRepository2.initProject, undefined);
              await svnRepositories.init({
                repositories: [
                  'url1',
                  'url2',
                ],
              });
            });

            it('should create the listed repositories', () => {
              checkCreated(FakeSvnRepository, {
                url: 'url1',
              });
              checkCreated(FakeSvnRepository, {
                url: 'url2',
              });
            });

            it('should report the correct length', () => {
              svnRepositories.length.should.eql(2);
            });
          });

          describe('with exported', () => {
            beforeEach(async () => {
              stubResolves(stateFile.read, {
                'uuid1': 'exported1',
                'uuid2': 'exported2',
              });
              stubReturns(FakeSvnRepository, [
                svnRepository1,
                svnRepository2,
              ]);
              stubResolves(FakeSvnRepository.create, [
                svnRepository3,
                svnRepository4,
              ]);
              stubResolves(svnRepository3.initProject, undefined);
              stubResolves(svnRepository4.initProject, undefined);
              await svnRepositories.init({
                repositories: [
                  'url3',
                  'url4',
                ],
              });
            });

            it('should construct the exported respositories', () => {
              checkConstructed(FakeSvnRepository, {
                exported: 'exported1',
              });
              checkConstructed(FakeSvnRepository, {
                exported: 'exported2',
              });
            });

            it('should create the listed repositories', () => {
              checkCreated(FakeSvnRepository, {
                url: 'url3',
              });
              checkCreated(FakeSvnRepository, {
                url: 'url4',
              });
            });

            it('should report the correct length', () => {
              svnRepositories.length.should.eql(4);
            });

            describe('then add', () => {
              beforeEach(async () => {
                stubResolves(FakeSvnRepository.create, [
                  svnRepository5,
                ]);
                stubResolves(svnRepository5.initProject, undefined);
                await svnRepositories.add({
                  url: 'url5',
                });
              });

              it('should create the repository', () => {
                checkCreated(FakeSvnRepository, {
                  url: 'url5',
                });
              });

              it('should init the project', () => {
                svnRepository5.initProject.should.have.been.called;
              });

              it('should report the correct length', () => {
                svnRepositories.length.should.eql(5);
              });

              it('should write the stateFile', () => {
                stateFile.write.should.have.been.calledWith({
                  'uuid1': 'exported1',
                  'uuid2': 'exported2',
                  'uuid3': 'exported3',
                  'uuid4': 'exported4',
                  'uuid5': 'exported5',
                });
              });

              describe('then add a known repository', () => {
                beforeEach(async () => {
                  stubResolves(FakeSvnRepository.create, [
                    svnRepository6,
                  ]);
                  stubResolves(svnRepository6.initProject, []);
                  await svnRepositories.add({
                    url: 'url6',
                  });
                });

                it('should create the repository', () => {
                  checkCreated(FakeSvnRepository, {
                    url: 'url6',
                  });
                });

                it('should not add the duplicate', () => {
                  svnRepositories.length.should.eql(5);
                  svnRepositories.get(svnRepository6.uuid)
                      .should.equal(svnRepository3);
                });
              });
            });

            describe('then processNext', () => {
              describe('with revisions', () => {
                beforeEach(async () => {
                  svnRepository1.getNext.resolves(revision1);
                  svnRepository2.getNext.resolves(revision2);
                  svnRepository3.getNext.resolves(revision3);
                  svnRepository4.getNext.resolves(revision4);
                  stubResolves(prompt.input, []);
                  stubResolves(svnRepository3.processNext, undefined);
                  await svnRepositories.processNext();
                });

                it('should call processNext for the earliest revision', () => {
                  svnRepository3.processNext.should.have.been.called;
                });

                it('should write the stateFile', () => {
                  stateFile.write.should.have.been.calledWith({
                    'uuid1': 'exported1',
                    'uuid2': 'exported2',
                    'uuid3': 'exported3',
                    'uuid4': 'exported4',
                  });
                });
              });

              // eslint-disable-next-line max-len
              describe('when only the second repository has a next revision', () => {
                beforeEach(async () => {
                  svnRepository1.getNext.resolves(undefined);
                  svnRepository2.getNext.resolves(revision2);
                  svnRepository3.getNext.resolves(undefined);
                  svnRepository4.getNext.resolves(undefined);
                  stubResolves(prompt.input, []);
                  stubResolves(svnRepository2.processNext, undefined);
                  await svnRepositories.processNext();
                });

                it('should call processNext for the second repository', () => {
                  svnRepository2.processNext.should.have.been.called;
                });
              });

              // eslint-disable-next-line max-len
              describe('when only the last repository has a next revision', () => {
                beforeEach(async () => {
                  svnRepository1.getNext.resolves(undefined);
                  svnRepository2.getNext.resolves(undefined);
                  svnRepository3.getNext.resolves(undefined);
                  svnRepository4.getNext.resolves(revision4);
                  stubResolves(prompt.input, []);
                  stubResolves(svnRepository4.processNext, undefined);
                  await svnRepositories.processNext();
                });

                it('should call processNext for the last repository', () => {
                  svnRepository4.processNext.should.have.been.called;
                });
              });

              describe('when no repository has a next revision', () => {
                beforeEach(async () => {
                  svnRepository1.getNext.resolves(undefined);
                  svnRepository2.getNext.resolves(undefined);
                  svnRepository3.getNext.resolves(undefined);
                  svnRepository4.getNext.resolves(undefined);
                  svnRepository5.getNext.resolves(revision5);
                  stubResolves(prompt.input, 'url5');
                  stubResolves(FakeSvnRepository.create, [
                    svnRepository5,
                  ]);
                  stubResolves(svnRepository5.initProject, undefined);
                  stubResolves(svnRepository5.processNext, undefined);
                  await svnRepositories.processNext();
                });

                it('should prompt for a new repository', () => {
                  prompt.input.should.have.been.calledWith(
                      PROMPT_REPOSITORY_URL
                  );
                });

                it('should create the new repository', () => {
                  checkCreated(FakeSvnRepository, {
                    url: 'url5',
                  });
                });

                it('should call processNext for the new repository', () => {
                  svnRepository5.processNext.should.have.been.called;
                });
              });
            });
          });
        });
      });
    });
  });
});
