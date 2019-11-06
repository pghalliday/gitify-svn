import {
  svnRepositoryFactory,
} from '../../../../src/gitify/state/svn-repository';
import Project from '../../../../src/gitify/state/project';
import prompt from '../../../../src/gitify/prompt';
import workingDirectory from '../../../../src/gitify/working-directory';
import svn from '../../../../src/gitify/svn';
import {
  join,
} from 'path';
import {
  promptConfirmRoot,
  REPOSITORIES_DIR,
} from '../../../../src/constants';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  checkCreated,
  stubResolves,
} from '../../../helpers/utils';

const url = 'url';
const incorrectUrl = 'incorrectUrl';
const uuid = 'uuid';
const info = {
  repositoryRoot: url,
  repositoryUuid: uuid,
};
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

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('SvnRepository', () => {
        let confirm;
        let revisionMethod;
        let infoMethod;
        let project;
        let FakeProject;
        let SvnRepository;

        beforeEach(() => {
          workingDirectory.path = workingDir,
          confirm = sinon.stub(prompt, 'confirm');
          revisionMethod = sinon.stub(svn, 'revision').callsFake(
              (params) => Promise.resolve(params)
          );
          infoMethod = sinon.stub(svn, 'info').resolves(info);
          project = createInstance(Project, {
            export: sinon.stub().returns(exportedProject),
          });
          FakeProject = createConstructor(project);
          SvnRepository = svnRepositoryFactory({
            Project: FakeProject,
          });
        });

        afterEach(() => {
          confirm.restore();
          revisionMethod.restore();
          infoMethod.restore();
        });

        describe('create', () => {
          describe('when the url is the correct root url', () => {
            it('should construct a new SvnRepository and init it', async () => {
              const svnRepository = await SvnRepository.create({
                url,
              });
              infoMethod.should.have.been.calledWith({
                repository: url,
                revision: 0,
                path: '',
              });
              checkCreated(FakeProject, {
                svnUrl: url,
                parent: workingDir,
                path: join(REPOSITORIES_DIR, uuid),
              });
              svnRepository.url.should.eql(url);
              svnRepository.uuid.should.eql(uuid);
              svnRepository.last.should.eql(0);
              svnRepository.project.should.eql(project);
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
                });
                confirm.should.have.been.calledWith(
                    promptConfirmRoot(url),
                    true,
                );
                checkCreated(FakeProject, {
                  svnUrl: url,
                  parent: workingDir,
                  path: join(REPOSITORIES_DIR, uuid),
                });
                svnRepository.url.should.eql(url);
                svnRepository.uuid.should.eql(uuid);
                svnRepository.last.should.eql(0);
                svnRepository.project.should.eql(project);
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
              revisionMethod.should.have.been.calledOnce;
              revisionMethod.should.have.been.calledWith(revision1);
              revision.should.eql(revision1);
            });

            describe('and then getNext again', () => {
              beforeEach(async () => {
                revision = await svnRepository.getNext();
              });

              it('should not need to hit SVN again', async () => {
                revisionMethod.should.have.been.calledOnce;
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
                  revisionMethod.should.have.been.calledTwice;
                  revisionMethod.should.have.been.calledWith(revision2);
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
