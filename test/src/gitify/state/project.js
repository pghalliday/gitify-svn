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
const parent = 'parent';
const path = 'path';
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
          sinon.stub(git, 'addSubmodule');
          Project = projectFactory({
          });
        });

        afterEach(() => {
          git.addSubmodule.restore();
          prompt.input.restore();
        });

        describe('create', () => {
          let project;

          beforeEach(async () => {
            stubResolves(prompt.input, remote);
            stubResolves(git.addSubmodule, commit);
            project = await Project.create({
              svnUrl,
              parent,
              path,
            });
          });

          it('should prompt for a remote', () => {
            prompt.input.should.have.been.calledWith(
                promptProjectRemote(svnUrl)
            );
          });

          it('should add the submodule', async () => {
            git.addSubmodule.should.have.been.calledWith({
              remote,
              parent,
              path,
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
