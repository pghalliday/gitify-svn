import {
  Authors,
} from '../../../../src/gitify/state/authors';
import workingDirectory from '../../../../src/gitify/working-directory';
import prompt from '../../../../src/gitify/prompt';
import parse from '../../../../src/gitify/state/lib/parse';
import {
  AUTHORS_FILE,
  promptAuthorName,
  promptAuthorEmail,
} from '../../../../src/constants';
import {
  FsMock,
  FS_FILE,
  FS_DIRECTORY,
} from '../../../mocks/fs';
import {
  join,
} from 'path';
import {
  stubResolves,
  stubReturns,
} from '../../../helpers/utils';

const workingDir = 'workingDir';
workingDirectory.path = workingDir;

const authorString = 'authorString';
const defaultName = 'defaultName';
const defaultEmail = 'defaultEmail';
const defaultAuthorsData = {
  name: defaultName,
  email: defaultEmail,
};
const name = 'name';
const email = 'email';
const authorData = {
  name,
  email,
};
const authorsData = {
  [authorString]: authorData,
};
const authorsString = JSON.stringify(authorsData, null, 2);

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('authors', () => {
        let authors;
        let fsMock;
        let data;

        beforeEach(() => {
          authors = new Authors();
          sinon.stub(prompt, 'input');
          sinon.stub(parse, 'author');
        });

        afterEach(() => {
          prompt.input.restore();
          parse.author.restore();
        });

        describe('init', () => {
          describe('with an invalid authors file', () => {
            beforeEach(async () => {
              fsMock = new FsMock({
                [workingDir]: {
                  type: FS_DIRECTORY,
                },
                [join(workingDir, AUTHORS_FILE)]: {
                  type: FS_FILE,
                  data: 'invalid data',
                },
              });
            });

            afterEach(() => {
              fsMock.restore();
            });

            it('should throw an error', async () => {
              await authors.init().should.be.rejectedWith('Unexpected token');
            });
          });

          describe('with an authors file', () => {
            beforeEach(async () => {
              fsMock = new FsMock({
                [workingDir]: {
                  type: FS_DIRECTORY,
                },
                [join(workingDir, AUTHORS_FILE)]: {
                  type: FS_FILE,
                  data: authorsString,
                },
              });
              await authors.init();
            });

            afterEach(() => {
              fsMock.restore();
            });

            describe('then get', () => {
              beforeEach(async () => {
                stubReturns(parse.author, []);
                stubResolves(prompt.input, []);
                data = await authors.get(authorString);
              });

              it('should return the author data', () => {
                data.should.eql(authorData);
              });

              it('should not change the authors file', () => {
                fsMock.getEntry(join(workingDir, AUTHORS_FILE)).data
                    .should.eql(authorsString);
              });
            });
          });

          describe('without an authors file', () => {
            beforeEach(async () => {
              fsMock = new FsMock({
                [workingDir]: {
                  type: FS_DIRECTORY,
                },
              });
              await authors.init();
            });

            afterEach(() => {
              fsMock.restore();
            });

            describe('then get with undefined', () => {
              beforeEach(async () => {
                stubReturns(parse.author, defaultAuthorsData);
                stubResolves(prompt.input, [
                  name,
                  email,
                ]);
                data = await authors.get();
              });

              it('should default to author text with empty string', () => {
                parse.author.should.have.been.calledWith('');
                data.should.eql({
                  name,
                  email,
                });
              });
            });

            describe('then get', () => {
              beforeEach(async () => {
                stubReturns(parse.author, defaultAuthorsData);
                stubResolves(prompt.input, [
                  name,
                  email,
                ]);
                data = await authors.get(authorString);
              });

              it('should parse the author string', () => {
                parse.author.should.have.been.calledWith(authorString);
              });

              // eslint-disable-next-line max-len
              it('should prompt for the correct name with the parsed default', () => {
                prompt.input.should.have.been.calledWith(
                    promptAuthorName(authorString),
                    defaultName,
                );
              });

              // eslint-disable-next-line max-len
              it('should prompt for the correct email with the parsed default', () => {
                prompt.input.should.have.been.calledWith(
                    promptAuthorEmail(authorString),
                    defaultEmail,
                );
              });

              it('should write the authors file', () => {
                fsMock.getEntry(join(workingDir, AUTHORS_FILE)).data
                    .should.eql(authorsString);
              });

              it('should return the author data', () => {
                data.should.eql(authorData);
              });

              describe('then get again', () => {
                beforeEach(async () => {
                  stubReturns(parse.author, []);
                  stubResolves(prompt.input, []);
                  data = await authors.get(authorString);
                });

                it('should return the same author data', () => {
                  data.should.eql(authorData);
                });

                it('should not change the authors file', () => {
                  fsMock.getEntry(join(workingDir, AUTHORS_FILE)).data
                      .should.eql(authorsString);
                });
              });
            });
          });
        });
      });
    });
  });
});
