import {
  projectFactory,
} from '../../../../src/gitify/state/project';
import git from '../../../../src/gitify/git';
import prompt from '../../../../src/gitify/prompt';
import {
  promptProjectRemote,
} from '../../../../src/constants';
import {
  stubResolves,
} from '../../../helpers/utils';

const svnUrl = 'svnUrl';
const revision = 'revision';
const parent = 'parent';
const path = 'path';
const name = 'name';
const email = 'email';
const date = 'date';
const remote = 'remote';
const commit = 'commit';
const exported = {
  parent,
  path,
  remote,
  commit,
};

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('Project', () => {
        let Project;

        beforeEach(() => {
          sinon.stub(prompt, 'input');
          sinon.stub(git, 'newSubmodule');
          Project = projectFactory({
          });
        });

        afterEach(() => {
          git.newSubmodule.restore();
          prompt.input.restore();
        });

        describe('create', () => {
          let project;

          beforeEach(async () => {
            stubResolves(prompt.input, remote);
            stubResolves(git.newSubmodule, commit);
            project = await Project.create({
              svnUrl,
              revision,
              parent,
              path,
              name,
              email,
              date,
            });
          });

          it('should prompt for a remote', () => {
            prompt.input.should.have.been.calledWith(
                promptProjectRemote(svnUrl)
            );
          });

          it('should add the submodule', async () => {
            git.newSubmodule.should.have.been.calledWith({
              remote,
              parent,
              path,
              name,
              email,
              date,
              importedDescriptor: {
                svnUrl,
                revision,
              },
            });
          });

          it('should store the project properties', async () => {
            project.parent.should.eql(parent);
            project.path.should.eql(path);
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
            project.parent.should.eql(parent);
            project.path.should.eql(path);
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
