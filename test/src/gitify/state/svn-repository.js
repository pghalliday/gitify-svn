import svnRepositoryFactory from '../../../../src/gitify/state/svn-repository';
import projectFactory from '../../../../src/gitify/state/project';
import Svn from '../../../../src/gitify/svn';
import {
  ROOT_PROJECT_NAME,
} from '../../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  checkCreated,
} from '../../../helpers/utils';

const Project = projectFactory({});

const url = 'url';
const name = 'name';
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
  last,
  projects: {
    [projectName]: exportedProject,
  },
};

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('SvnRepository', () => {
        let svn;
        let FakeSvn;
        let project;
        let FakeProject;
        let SvnRepository;

        beforeEach(() => {
          svn = createInstance(Svn, {
            revision: sinon.stub().callsFake(
                (params) => Promise.resolve(params)
            ),
          });
          FakeSvn = createConstructor(svn);
          project = createInstance(Project, {
            export: sinon.stub().returns(exportedProject),
          });
          FakeProject = createConstructor(project);
          SvnRepository = svnRepositoryFactory({
            Svn: FakeSvn,
            Project: FakeProject,
          });
        });

        describe('create', () => {
          it('should construct a new SvnRepository and init it', async () => {
            const svnRepository = await SvnRepository.create({
              url,
              name,
            });
            checkConstructed(FakeSvn, {
              url,
            });
            checkCreated(FakeProject, {
              svnRepository: name,
              svnPath: '/',
              name: ROOT_PROJECT_NAME,
            });
            svnRepository.url.should.eql(url);
            svnRepository.name.should.eql(name);
            svnRepository.last.should.eql(0);
            svnRepository.projects.should.eql({
              [ROOT_PROJECT_NAME]: project,
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
