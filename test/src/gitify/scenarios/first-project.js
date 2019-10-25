import run from '../../../../src/gitify/scenarios/first-project';
import mockInquirer from 'mock-inquirer';

describe('src', () => {
  describe('gitify', () => {
    describe('scenarios', () => {
      describe('first-project', () => {
        describe('run', () => {
          describe('when there are already projects', () => {
            it('should do nothing', async () => {
              const progress = {
                projectCount: 1,
              };
              const log = {};
              const diffProps = {};
              await run({
                progress,
                log,
                diffProps,
              }).should.eventually.eql(false);
            });
          });

          describe('when there are no projects', () => {
            let ret;
            let reset;

            // eslint-disable-next-line max-len
            describe('when the user wishes to create a project from the root', () => {
              describe('when the user wishes to use standard layout', () => {
                before(async () => {
                  reset = mockInquirer([{
                    createProjectFromRoot: true,
                  }, {
                    useStandardLayout: true,
                  }]);

                  const progress = {
                    projectCount: 0,
                  };
                  const log = {};
                  const diffProps = {};
                  ret = await run({progress, log, diffProps});
                });

                after(() => {
                  reset();
                });

                it('should return true', () => {
                  ret.should.eql(true);
                });
              });
            });
          });
        });
      });
    });
  });
});
