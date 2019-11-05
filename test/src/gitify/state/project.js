import {
  projectFactory,
} from '../../../../src/gitify/state/project';
import git from '../../../../src/gitify/git';

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
        let Project;

        beforeEach(() => {
          sinon.stub(git, 'create').resolves(undefined);
          Project = projectFactory({
          });
        });

        afterEach(() => {
          git.create.restore();
        });

        describe('create', () => {
          it('should construct a new Project and init it', async () => {
            const project = await Project.create({
              svnRepository,
              svnPath,
              name,
            });
            git.create.should.have.been.calledWith({
            });
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
