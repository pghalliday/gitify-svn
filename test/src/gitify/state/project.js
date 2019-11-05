import {
  projectFactory,
} from '../../../../src/gitify/state/project';
import git from '../../../../src/gitify/git';

const url = 'url';
const uuid = 'uuid';
const remote = 'remote';
const commit = 'commit';
const exported = {
  uuid,
  remote,
  commit,
};

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('Project', () => {
        let Project;

        beforeEach(() => {
          sinon.stub(git, 'create').resolves({
            remote,
            commit,
          });
          Project = projectFactory({
          });
        });

        afterEach(() => {
          git.create.restore();
        });

        describe('create', () => {
          it('should construct a new Project and init it', async () => {
            const project = await Project.create({
              uuid,
              url,
            });
            git.create.should.have.been.calledWith({
              uuid,
              url,
            });
            project.uuid.should.eql(uuid);
            project.remote.should.eql(remote);
            project.commit.should.eql(commit);
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
            project.uuid.should.eql(uuid);
            project.remote.should.eql(remote);
            project.commit.should.eql(commit);
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
