import {
  svnRepositoryFactory,
} from '../../../../src/gitify/state/svn-repository';
import Project from '../../../../src/gitify/state/project';
import workingDirectory from '../../../../src/gitify/working-directory';
import svn from '../../../../src/gitify/svn';
import prompt from '../../../../src/gitify/prompt';
import authors from '../../../../src/gitify/state/authors';
import {
  join,
} from 'path';
import {
  REPOSITORIES_DIR,
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
const author = 'author';
const name = 'name';
const email = 'email';
const date = 'date';
const last = 0;
const revision1 = {
  repository: url,
  revision: 1,
};
const revision2 = {
  repository: url,
  revision: 2,
};
const exportedProject = 'exportedProject';
const exported = {
  url,
  uuid,
  last,
  project: exportedProject,
};
const workingDir = 'workingDir';
const info = {
  repositoryRoot: url,
  repositoryUuid: uuid,
  lastChangedDate: date,
  lastChangedAuthor: author,
};

const project = createInstance(Project, {
  export: sinon.stub().returns(exportedProject),
});
const FakeProject = createConstructor();
const SvnRepository = svnRepositoryFactory({
  Project: FakeProject,
});

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('SvnRepository', () => {
        beforeEach(() => {
          workingDirectory.path = workingDir,
          sinon.stub(svn, 'revision').callsFake(
              (params) => Promise.resolve(params)
          );
          sinon.stub(svn, 'info').resolves(info);
          sinon.stub(prompt, 'confirm');
          sinon.stub(authors, 'get');
          stubResolves(FakeProject.create, project);
          stubReturns(FakeProject, project);
        });

        afterEach(() => {
          svn.revision.restore();
          svn.info.restore();
          prompt.confirm.restore();
          authors.get.restore();
        });

        describe('create', () => {
          let svnRepository;

          describe('with a non root url', () => {
            describe('and the user cancels', () => {
              beforeEach(async () => {
                stubResolves(prompt.confirm, false);
              });

              it('should throw an error', async () => {
                await SvnRepository.create({
                  url: incorrectUrl,
                }).should.be.rejectedWith(
                    'Can only convert the root of an SVN repository'
                );
              });
            });

            describe('and the user confirms', () => {
              beforeEach(async () => {
                stubResolves(prompt.confirm, true);
                svnRepository = await SvnRepository.create({
                  url: incorrectUrl,
                });
              });

              it('should prompt to confirm the root url', () => {
                prompt.confirm.should.have.been.calledWith(
                    promptConfirmRoot(url)
                );
              });

              // eslint-disable-next-line max-len
              it('should construct a new SvnRepository and init it', async () => {
                svnRepository.url.should.eql(url);
                svnRepository.uuid.should.eql(uuid);
                svnRepository.last.should.eql(0);
              });

              it('should not initialise the project yet', () => {
                expect(svnRepository.project).to.not.be.ok;
              });
            });
          });

          describe('with a root url', () => {
            beforeEach(async () => {
              svnRepository = await SvnRepository.create({
                url,
              });
            });

            // eslint-disable-next-line max-len
            it('should construct a new SvnRepository and init it', async () => {
              svnRepository.url.should.eql(url);
              svnRepository.uuid.should.eql(uuid);
              svnRepository.last.should.eql(0);
            });

            it('should not initialise the project yet', () => {
              expect(svnRepository.project).to.not.be.ok;
            });

            describe('and then initProject', () => {
              beforeEach(async () => {
                stubResolves(authors.get, {
                  name,
                  email,
                });
                await svnRepository.initProject();
              });

              it('should get the author data', () => {
                authors.get.should.have.been.calledWith(author);
              });

              it('should create the project', () => {
                checkCreated(FakeProject, {
                  svnUrl: url,
                  revision: 0,
                  parent: '.',
                  path: join(REPOSITORIES_DIR, uuid),
                  name,
                  email,
                  date,
                });
                svnRepository.project.should.eql(project);
              });
            });
          });
        });

        describe('with an instance created from an export', () => {
          let svnRepository;

          beforeEach(() => {
            svnRepository = new SvnRepository({
              exported,
            });
          });

          it('should populate the instance', () => {
            svnRepository.url.should.eql(url);
            svnRepository.uuid.should.eql(uuid);
            svnRepository.last.should.eql(last);
            checkConstructed(FakeProject, {
              exported: exportedProject,
            });
            svnRepository.project.should.eql(project);
          });

          describe('export', () => {
            it('should export an object that can be serialized', () => {
              svnRepository.export().should.eql(exported);
            });
          });

          describe('getNext', () => {
            let revision;

            beforeEach(async () => {
              revision = await svnRepository.getNext();
            });

            it('should get the next revision', async () => {
              svn.revision.should.have.been.calledOnce;
              svn.revision.should.have.been.calledWith(revision1);
              revision.should.eql(revision1);
            });

            describe('and then getNext again', () => {
              beforeEach(async () => {
                revision = await svnRepository.getNext();
              });

              it('should not need to hit SVN again', async () => {
                svn.revision.should.have.been.calledOnce;
                revision.should.eql(revision1);
              });
            });

            describe('and then processNext', () => {
              beforeEach(async () => {
                await svnRepository.processNext();
              });

              it('should update the last property', () => {
                svnRepository.last.should.eql(last + 1);
              });

              describe('and then getNext', () => {
                beforeEach(async () => {
                  revision = await svnRepository.getNext();
                });

                it('should get the next revision', async () => {
                  svn.revision.should.have.been.calledTwice;
                  svn.revision.should.have.been.calledWith(revision2);
                  revision.should.eql(revision2);
                });
              });
            });
          });
        });
      });
    });
  });
});
