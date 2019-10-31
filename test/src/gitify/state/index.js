import stateFactory from '../../../../src/gitify/state';
import svnRepositoryFactory from '../../../../src/gitify/state/svn-repository';
import {
  createInstance,
  createConstructor,
  checkConstructed,
  checkCreated,
} from '../../../helpers/utils';

const SvnRepository = svnRepositoryFactory({});

const url = 'url';
const name = 'name';
const exportedSvnRepository = 'exportedSvnRepository';
const exported = {
  svnRepositories: {
    [name]: exportedSvnRepository,
  },
};

describe('src', () => {
  describe('gitify', () => {
    describe('State', () => {
      let svnRepository;
      let FakeSvnRepository;
      let State;
      let state;

      beforeEach(() => {
        svnRepository = createInstance(SvnRepository, {
          export: sinon.stub().returns(exportedSvnRepository),
        });
        FakeSvnRepository = createConstructor(svnRepository);
        State = stateFactory({
          SvnRepository: FakeSvnRepository,
        });
      });

      describe('with an instance created without an export', () => {
        beforeEach(() => {
          state = new State({
          });
        });

        it('should initialise a new state', () => {
          state.svnRepositories.should.eql({});
        });

        describe('addSvnRepository', () => {
          beforeEach(async () => {
            await state.addSvnRepository({
              name,
              url,
            });
          });

          it('should add the SVN repository', () => {
            checkCreated(FakeSvnRepository, {
              name,
              url,
            });
            state.svnRepositories.should.eql({
              [name]: svnRepository,
            });
          });
        });
      });

      describe('with an instance created from an export', () => {
        beforeEach(() => {
          state = new State({
            exported,
          });
        });

        it('should populate the instance', () => {
          checkConstructed(FakeSvnRepository, {
            exported: exportedSvnRepository,
          });
          state.svnRepositories.should.eql({
            [name]: svnRepository,
          });
        });

        describe('export', () => {
          it('should export an object that can be serialized', () => {
            state.export().should.eql(exported);
          });
        });
      });
    });
  });
});
