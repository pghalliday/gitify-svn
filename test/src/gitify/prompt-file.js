import {
  PromptFile,
} from '../../../src/gitify/prompt-file';
import workingDirectory from '../../../src/gitify/working-directory';
import {
  PROMPT_FILE,
} from '../../../src/constants';
import {
  FsMock,
  FS_FILE,
} from '../../mocks/fs';
import {
  stubResolves,
} from '../../helpers/utils';
import {
  join,
} from 'path';
import {
  zipWith,
} from 'lodash';

const zipPrompt = (question, response) => ({
  question,
  response,
});

const workingDir = 'workingDir';
const promptFilePath = join(workingDir, PROMPT_FILE);

const question1 = 'question1';
const response1 = 'response1';
const question2 = 'question2';
const response2 = 'response2';
const question3 = 'question3';
const response3 = 'response3';
const question4 = 'question4';
const response4 = 'response4';
const question5 = 'question5';
const response5 = 'response5';
const question6 = 'question6';
const response6 = 'response6';
const questions = [
  question1,
  question2,
  question3,
];
const responses = [
  response1,
  response2,
  response3,
];
const prompts = zipWith(questions, responses, zipPrompt);
const promptsText = JSON.stringify(prompts, null, 2);
const newQuestions = [
  question4,
  question5,
  question6,
];
const newResponses = [
  response4,
  response5,
  response6,
];
const newPrompts = zipWith(newQuestions, newResponses, zipPrompt);
const newPromptsText = JSON.stringify([...prompts, ...newPrompts], null, 2);
const changedPrompts = zipWith(newQuestions, responses, zipPrompt);
const changedPromptsText = JSON.stringify(changedPrompts, null, 2);

describe('src', () => {
  describe('gitify', () => {
    describe('promptFile', () => {
      let promptFile;
      let callback;
      let fsMock;
      let next;

      beforeEach(() => {
        workingDirectory.path = workingDir;
        promptFile = new PromptFile();
        callback = sinon.stub();
      });

      describe('init', () => {
        beforeEach(() => {
          fsMock = new FsMock({
            [promptFilePath]: {
              type: FS_FILE,
              data: promptsText,
            },
          });
        });

        afterEach(() => {
          fsMock.restore();
        });

        describe('when not using prompts from the prompt file', () => {
          beforeEach(async () => {
            stubResolves(callback, newResponses);
            await promptFile.init({
              usePromptFile: false,
            });
            next = await Promise.all([
              promptFile.next({
                callback,
                question: question4,
              }),
              promptFile.next({
                callback,
                question: question5,
              }),
              promptFile.next({
                callback,
                question: question6,
              }),
            ]);
          });

          it('should not write the file', () => {
            fsMock.getEntry(promptFilePath).data.should.eql(promptsText);
          });

          it('should return responses from the callbacks', () => {
            next.should.eql(newResponses);
          });

          describe('then flush', () => {
            beforeEach(async () => {
              await promptFile.flush();
            });

            it('should write new prompts to the file', () => {
              fsMock.getEntry(promptFilePath).data
                  .should.eql(newPromptsText);
            });
          });
        });

        describe('when using prompts from the prompt file', () => {
          describe('when the questions have changed', () => {
            beforeEach(async () => {
              stubResolves(callback, []);
              await promptFile.init({
                usePromptFile: true,
              });
              next = await Promise.all([
                promptFile.next({
                  callback,
                  question: question4,
                }),
                promptFile.next({
                  callback,
                  question: question5,
                }),
                promptFile.next({
                  callback,
                  question: question6,
                }),
              ]);
            });

            it('should read in the prompts', () => {
              next.should.eql(responses);
            });

            describe('then flush', () => {
              beforeEach(async () => {
                await promptFile.flush();
              });

              it('should write updated prompts to the file', () => {
                fsMock.getEntry(promptFilePath).data
                    .should.eql(changedPromptsText);
              });
            });
          });

          describe('when the questions have not changed', () => {
            beforeEach(async () => {
              stubResolves(callback, []);
              await promptFile.init({
                usePromptFile: true,
              });
              next = await Promise.all([
                promptFile.next({
                  callback,
                  question: question1,
                }),
                promptFile.next({
                  callback,
                  question: question2,
                }),
                promptFile.next({
                  callback,
                  question: question3,
                }),
              ]);
            });

            it('should read in the prompts', () => {
              next.should.eql(responses);
            });

            describe('then next with no more prompts', () => {
              beforeEach(async () => {
                stubResolves(callback, newResponses);
                next = await Promise.all([
                  promptFile.next({
                    callback,
                    question: question4,
                  }),
                  promptFile.next({
                    callback,
                    question: question5,
                  }),
                  promptFile.next({
                    callback,
                    question: question6,
                  }),
                ]);
              });

              it('should not write the file', () => {
                fsMock.getEntry(promptFilePath).data.should.eql(promptsText);
              });

              it('should return responses from the callbacks', () => {
                next.should.eql(newResponses);
              });

              describe('then flush', () => {
                beforeEach(async () => {
                  await promptFile.flush();
                });

                it('should write new prompts to the file', () => {
                  fsMock.getEntry(promptFilePath).data
                      .should.eql(newPromptsText);
                });
              });
            });
          });
        });
      });
    });
  });
});
