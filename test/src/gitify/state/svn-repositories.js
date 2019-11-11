import {
  svnRepositoriesFactory,
} from '../../../../src/gitify/state/svn-repositories';
import SvnRepository from '../../../../src/gitify/state/svn-repository';
import prompt from '../../../../src/gitify/prompt';
// eslint-disable-next-line max-len
import repositoriesDirectory from '../../../../src/gitify/state/repositories-directory';
import {
  PROMPT_REPOSITORY_URL,
} from '../../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  checkCreated,
  stubResolves,
} from '../../../helpers/utils';

const url1 = 'url1';
const uuid1 = 'uuid1';
const revision1 = {
  date: new Date('2019-01-01'),
  uuid: uuid1,
};
const exported1 = 'exported1';

const url2 = 'url2';
const uuid2 = 'uuid2';
const revision2 = {
  date: new Date('2018-01-01'),
  uuid: uuid2,
};
const exported2 = 'exported2';

const url3 = 'url3';
const uuid3 = 'uuid3';
const revision3 = {
  date: new Date('2018-07-01'),
  uuid: uuid3,
};
const exported3 = 'exported3';

const url4 = 'url4';
const uuid4 = 'uuid4';
const revision4 = {
  date: new Date('2018-09-01'),
  uuid: uuid4,
};
const exported4 = 'exported4';

const url5 = 'url5';
const uuid5 = 'uuid5';
const revision5 = {
  date: new Date('2017-09-01'),
  uuid: uuid5,
};

const url6 = 'url6';

describe('src', () => {
  describe('gitify', () => {
    describe('State', () => {
      describe('SvnRepositories', () => {
        let svnRepository1;
        let svnRepository2;
        let svnRepository3;
        let svnRepository4;
        let svnRepository5;
        let svnRepository6;
        let FakeSvnRepository;
        let svnRepositories;
        let next;

        beforeEach(() => {
          sinon.stub(prompt, 'input');
          sinon.stub(repositoriesDirectory, 'init');
          svnRepository1 = createInstance(SvnRepository, {
            export: sinon.stub().returns(exported1),
            getNext: sinon.stub(),
          });
          svnRepository1.uuid = uuid1;
          svnRepository1.url = url1;
          svnRepository2 = createInstance(SvnRepository, {
            export: sinon.stub().returns(exported2),
            getNext: sinon.stub(),
          });
          svnRepository2.uuid = uuid2;
          svnRepository2.url = url2;
          svnRepository3 = createInstance(SvnRepository, {
            export: sinon.stub().returns(exported3),
            getNext: sinon.stub(),
          });
          svnRepository3.uuid = uuid3;
          svnRepository3.url = url3;
          svnRepository4 = createInstance(SvnRepository, {
            export: sinon.stub().returns(exported4),
            getNext: sinon.stub(),
          });
          svnRepository4.uuid = uuid4;
          svnRepository4.url = url4;
          svnRepository5 = createInstance(SvnRepository, {
            getNext: sinon.stub(),
          });
          svnRepository5.uuid = uuid5;
          svnRepository5.url = url5;
          svnRepository6 = createInstance(SvnRepository, {});
          // eslint-disable-next-line max-len
          svnRepository6.uuid = uuid3; // This will make it a duplicate of svnRepository3
          svnRepository6.url = url6;
          FakeSvnRepository = createConstructor([
            svnRepository1,
            svnRepository2,
            svnRepository3,
            svnRepository4,
            svnRepository5,
            svnRepository6,
          ]);
          const SvnRepositories = svnRepositoriesFactory({
            SvnRepository: FakeSvnRepository,
          });
          svnRepositories = new SvnRepositories;
        });

        afterEach(() => {
          prompt.input.restore();
          repositoriesDirectory.init.restore();
        });

        describe('init', () => {
          beforeEach(async () => {
            await svnRepositories.init({
              exported: {
                [uuid1]: exported1,
                [uuid2]: exported2,
              },
              urls: [
                url3,
                url4,
              ],
            });
          });

          it('should construct the exported respositories', () => {
            checkConstructed(FakeSvnRepository, {
              exported: exported1,
            });
            checkConstructed(FakeSvnRepository, {
              exported: exported2,
            });
          });

          it('should create the listed repositories', () => {
            checkCreated(FakeSvnRepository, {
              url: url3,
            });
            checkCreated(FakeSvnRepository, {
              url: url4,
            });
          });

          it('should report the correct length', () => {
            svnRepositories.length.should.eql(4);
          });

          describe('then export', () => {
            it('should export the repository states', () => {
              svnRepositories.export().should.eql({
                [uuid1]: exported1,
                [uuid2]: exported2,
                [uuid3]: exported3,
                [uuid4]: exported4,
              });
            });
          });

          describe('then add', () => {
            beforeEach(async () => {
              await svnRepositories.add({
                url: url5,
              });
            });

            it('should create the repository', () => {
              checkCreated(FakeSvnRepository, {
                url: url5,
              });
            });

            it('should report the correct length', () => {
              svnRepositories.length.should.eql(5);
            });

            describe('then add a known repository', () => {
              beforeEach(async () => {
                await svnRepositories.add({
                  url: url6,
                });
              });

              it('should create the repository', () => {
                checkCreated(SvnRepository, {
                  url: url6,
                });
              });

              it('should not add the duplicate', () => {
                svnRepositories.length.should.eql(5);
                svnRepositories.get(svnRepository6.uuid)
                    .should.equal(svnRepository3);
              });
            });
          });

          describe('then getNext', () => {
            describe('when no repository has a next revision', () => {
              beforeEach(async () => {
                stubResolves(svnRepository1.getNext, null);
                stubResolves(svnRepository2.getNext, null);
                stubResolves(svnRepository3.getNext, null);
                stubResolves(svnRepository4.getNext, null);
                stubResolves(svnRepository5.getNext, revision5);
                stubResolves(prompt.input, url5);
                next = svnRepositories.getNext();
              });

              it('should prompt for a new repository', () => {
                prompt.input.should.have.been.calledWith(PROMPT_REPOSITORY_URL);
              });

              it('should create the repository', () => {
                checkCreated(FakeSvnRepository, {
                  url5,
                });
              });

              it('should return the repository', () => {
                next.should.equal(svnRepository5);
              });
            });
          });
        });
      });
    });
  });
});
