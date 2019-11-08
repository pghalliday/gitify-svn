import prompt from '../../../src/gitify/prompt';
import promptFile from '../../../src/gitify/prompt-file';
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
      beforeEach(() => {
        sinon.stub(inquirer, 'prompt');
        sinon.stub(promptFile, 'next');
        stubResolves(inquirer.prompt, answers);
      });

      afterEach(() => {
        inquirer.prompt.restore();
        promptFile.next.restore();
      });

      describe('when the prompt file has a response', () => {
        beforeEach(() => {
          stubResolves(promptFile.next, response);
        });

        describe('input', () => {
          it('should return the response from the prompt file', async () => {
            const res = await prompt.input(question, def);
            res.should.eql(response);
            inquirer.prompt.should.not.have.been.called;
            promptFile.next.should.have.been.calledWithMatch({
              question,
            });
          });
        });

        describe('confirm', () => {
          it('should return the response from the prompt file', async () => {
            const res = await prompt.confirm(question, def);
            res.should.eql(response);
            inquirer.prompt.should.not.have.been.called;
            promptFile.next.should.have.been.calledWithMatch({
              question,
            });
          });
        });

        describe('password', () => {
          it('should return the response from the prompt file', async () => {
            const res = await prompt.password(question, def);
            res.should.eql(response);
            inquirer.prompt.should.not.have.been.called;
            promptFile.next.should.have.been.calledWithMatch({
              question,
            });
          });
        });
      });

      describe('when the prompt file does not have a response', () => {
        let innerResponse;

        beforeEach(() => {
          innerResponse = undefined;
          promptFile.next.callsFake(async ({
            callback,
          }) => {
            innerResponse = await callback();
            return innerResponse;
          });
        });

        describe('input', () => {
          it('should prompt with an input', async () => {
            const res = await prompt.input(question, def);
            res.should.eql(response);
            inquirer.prompt.should.have.been.calledWith({
              type: 'input',
              name: 'response',
              message: question,
              default: def,
            });
            innerResponse.should.eql(response);
          });
        });

        describe('confirm', () => {
          it('should prompt with a confirm', async () => {
            const res = await prompt.confirm(question, def);
            res.should.eql(response);
            inquirer.prompt.should.have.been.calledWith({
              type: 'confirm',
              name: 'response',
              message: question,
              default: def,
            });
            innerResponse.should.eql(response);
          });
        });

        describe('password', () => {
          it('should prompt for a password', async () => {
            const res = await prompt.password(question);
            res.should.eql(response);
            inquirer.prompt.should.have.been.calledWith({
              type: 'password',
              name: 'response',
              message: question,
            });
            innerResponse.should.eql(response);
          });
        });
      });
    });
  });
});
