import projectFactory from '../../../../src/gitify/state/project';
import Git from '../../../../src/gitify/git';
import {
  createInstance,
  createConstructor,
  checkConstructed,
} from '../../../helpers/utils';

const svnRepository = 'svnRepository';
const svnPath = 'svnPath';
const name = 'name';
const exported = {
  svnRepository,
  svnPath,
  name,
};

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('Project', () => {
        let FakeGit;
        let git;
        let Project;

        beforeEach(() => {
          git = createInstance(Git);
          FakeGit = createConstructor(git);
          Project = projectFactory({
            Git: FakeGit,
          });
        });

        describe('create', () => {
          it('should construct a new Project and init it', async () => {
            const project = await Project.create({
              svnRepository,
              svnPath,
              name,
            });
            checkConstructed(FakeGit, {
              folder: svnRepository,
              name,
            });
            git.init.should.have.been.calledOnce;
            project.svnRepository.should.eql(svnRepository);
            project.svnPath.should.eql(svnPath);
            project.name.should.eql(name);
          });
        });

        describe('with an instance created from an export', () => {
          let project;

          beforeEach(() => {
            project = new Project({
              exported,
            });
          });

          it('should create the git instance', () => {
            checkConstructed(FakeGit, {
              folder: svnRepository,
              name,
            });
          });

          it('should populate the instance', () => {
            project.svnRepository.should.eql(svnRepository);
            project.svnPath.should.eql(svnPath);
            project.name.should.eql(name);
          });

          describe('export', () => {
            it('should export an object that can be serialized', () => {
              project.export().should.eql(exported);
            });
          });
        });
      });
    });
  });
});
