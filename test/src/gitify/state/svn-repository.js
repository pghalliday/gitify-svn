import svnRepositoryFactory from '../../../../src/gitify/state/svn-repository';
import projectFactory from '../../../../src/gitify/state/project';
import prompt from '../../../../src/gitify/prompt';
import Svn from '../../../../src/gitify/svn';
import {
  ROOT_PROJECT_NAME,
  promptConfirmRoot,
} from '../../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  checkCreated,
  stubResolves,
} from '../../../helpers/utils';

const Project = projectFactory({});

const url = 'url';
const incorrectUrl = 'incorrectUrl';
const name = 'name';
const uuid = 'uuid';
const info = {
  repositoryRoot: url,
  repositoryUuid: uuid,
};
const last = 0;
const revision1 = {
  revision: 1,
};
const revision2 = {
  revision: 2,
};
const projectName = 'projectName';
const exportedProject = 'exportedProject';
const exported = {
  url,
  name,
  uuid,
  last,
  projects: {
    [projectName]: exportedProject,
  },
};

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('SvnRepository', () => {
        let confirm;
        let svn;
        let svn2;
        let FakeSvn;
        let project;
        let FakeProject;
        let SvnRepository;

        beforeEach(() => {
          confirm = sinon.stub(prompt, 'confirm');
          svn = createInstance(Svn, {
            revision: sinon.stub().callsFake(
                (params) => Promise.resolve(params)
            ),
            info: sinon.stub().resolves(info),
          });
          svn2 = createInstance(Svn, {});
          FakeSvn = createConstructor([svn, svn2]);
          project = createInstance(Project, {
            export: sinon.stub().returns(exportedProject),
          });
          FakeProject = createConstructor(project);
          SvnRepository = svnRepositoryFactory({
            prompt,
            Svn: FakeSvn,
            Project: FakeProject,
          });
        });

        afterEach(() => {
          confirm.restore();
        });

        describe('create', () => {
          describe('when the url is the correct root url', () => {
            it('should construct a new SvnRepository and init it', async () => {
              const svnRepository = await SvnRepository.create({
                url,
                name,
              });
              checkConstructed(FakeSvn, {
                url,
              });
              svn.info.should.have.been.calledWith({
                revision: 0,
                path: '/',
              });
              checkCreated(FakeProject, {
                svnRepository: uuid,
                svnPath: '/',
                name: ROOT_PROJECT_NAME,
              });
              svnRepository.url.should.eql(url);
              svnRepository.name.should.eql(name);
              svnRepository.uuid.should.eql(uuid);
              svnRepository.last.should.eql(0);
              svnRepository.projects.should.eql({
                [ROOT_PROJECT_NAME]: project,
              });
            });
          });

          describe('when the url is not the root url', () => {
            // eslint-disable-next-line max-len
            describe('and the user chooses to switch to the correct root', () => {
              beforeEach(() => {
                stubResolves(confirm, true);
              });

              it('should switch to the correct root url', async () => {
                const svnRepository = await SvnRepository.create({
                  url: incorrectUrl,
                  name,
                });
                checkConstructed(FakeSvn, {
                  url: incorrectUrl,
                });
                checkConstructed(FakeSvn, {
                  url,
                });
                confirm.should.have.been.calledWith(promptConfirmRoot(url));
                checkCreated(FakeProject, {
                  svnRepository: uuid,
                  svnPath: '/',
                  name: ROOT_PROJECT_NAME,
                });
                svnRepository.url.should.eql(url);
                svnRepository.name.should.eql(name);
                svnRepository.uuid.should.eql(uuid);
                svnRepository.last.should.eql(0);
                svnRepository.projects.should.eql({
                  [ROOT_PROJECT_NAME]: project,
                });
              });
            });

            // eslint-disable-next-line max-len
            describe('and the user chooses not to switch to the correct root', () => {
              beforeEach(() => {
                stubResolves(confirm, false);
              });

              it('should throw an error', async () => {
                await SvnRepository.create({
                  url: incorrectUrl,
                  name,
                }).should.be.rejectedWith(
                    'Can only convert the root of an SVN repository'
                );
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

          it('should create the Svn instance', () => {
            checkConstructed(FakeSvn, {
              url,
            });
          });

          it('should populate the instance', () => {
            svnRepository.url.should.eql(url);
            svnRepository.name.should.eql(name);
            svnRepository.uuid.should.eql(uuid);
            svnRepository.last.should.eql(last);
            checkConstructed(FakeProject, {
              exported: exportedProject,
            });
            svnRepository.projects.should.eql({
              [projectName]: project,
            });
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

            describe('and then resolve', () => {
              beforeEach(() => {
                svnRepository.resolve();
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
