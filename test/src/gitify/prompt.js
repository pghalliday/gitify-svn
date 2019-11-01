import prompt from '../../../src/gitify/prompt';
import inquirer from 'inquirer';
import {
  stubResolves,
} from '../../helpers/utils';

const response = 'response';
const answers = {
  response,
};
const question = 'question';
const def = 'default';

describe('src', () => {
  describe('gitify', () => {
    describe('prompt', () => {
      let p;

      beforeEach(() => {
        p = sinon.stub(inquirer, 'prompt');
        stubResolves(p, answers);
      });

      afterEach(() => {
        p.restore();
      });

      describe('input', () => {
        it('should prompt with an input', async () => {
          const res = await prompt.input(question, def);
          res.should.eql(response);
          p.should.have.been.calledWith({
            type: 'input',
            name: 'response',
            message: question,
            default: def,
          });
        });
      });

      describe('confirm', () => {
        it('should prompt with a confirm', async () => {
          const res = await prompt.confirm(question, def);
          res.should.eql(response);
          p.should.have.been.calledWith({
            type: 'confirm',
            name: 'response',
            message: question,
            default: def,
          });
        });
      });

      describe('password', () => {
        it('should prompt for a password', async () => {
          const res = await prompt.password(question);
          res.should.eql(response);
          p.should.have.been.calledWith({
            type: 'password',
            name: 'response',
            message: question,
          });
        });
      });
    });
  });
});
