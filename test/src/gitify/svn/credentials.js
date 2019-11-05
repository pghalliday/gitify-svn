import {
  Credentials,
} from '../../../../src/gitify/svn/credentials';
import prompt from '../../../../src/gitify/prompt';
import {
  stubResolves,
} from '../../../helpers/utils';
import {
  PROMPT_SVN_USERNAME,
  promptSvnPassword,
} from '../../../../src/constants';

const user = 'username';
const pass = 'password';

describe('src', () => {
  describe('gitify', () => {
    describe('svn', () => {
      describe('credentials', () => {
        let credentials;

        beforeEach(() => {
          credentials = new Credentials();
        });

        describe('init', () => {
          let input;
          let password;

          beforeEach(async () => {
            input = sinon.stub(prompt, 'input');
            password = sinon.stub(prompt, 'password');
          });

          afterEach(() => {
            input.restore();
            password.restore();
          });

          describe('when the credentials have been supplied', () => {
            beforeEach(async () => {
              stubResolves(input, []);
              stubResolves(password, []);
              credentials.init({
                username: user,
                password: pass,
              });
            });

            it('should set the credentials without prompting', () => {
              credentials.should.eql({
                auth: {
                  user,
                  pass,
                },
                args: [
                  '--username',
                  user,
                  '--password',
                  pass,
                ],
              });
            });
          });

          describe('when the credentials have not been supplied', () => {
            beforeEach(async () => {
              stubResolves(input, user);
              stubResolves(password, pass);
              await credentials.init({});
            });

            it('should prompt for the username and password', () => {
              input.should.have.been.calledWith(PROMPT_SVN_USERNAME);
              password.should.have.been.calledWith(promptSvnPassword(user));
              credentials.should.eql({
                auth: {
                  user,
                  pass,
                },
                args: [
                  '--username',
                  user,
                  '--password',
                  pass,
                ],
              });
            });
          });
        });
      });
    });
  });
});
