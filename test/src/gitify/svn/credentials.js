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

        describe('get', () => {
          let input;
          let password;
          let creds;

          beforeEach(async () => {
            input = sinon.stub(prompt, 'input');
            password = sinon.stub(prompt, 'password');
          });

          afterEach(() => {
            input.restore();
            password.restore();
          });

          describe('when the credentials have been supplied with init', () => {
            beforeEach(async () => {
              stubResolves(input, []);
              stubResolves(password, []);
              credentials.init({
                username: user,
                password: pass,
              });
              creds = await credentials.get();
            });

            it('should return the same credentials without prompting', () => {
              creds.should.eql({
                username: user,
                password: pass,
              });
            });
          });

          describe('when the credentials have not yet been supplied', () => {
            beforeEach(async () => {
              stubResolves(input, user);
              stubResolves(password, pass);
              creds = await credentials.get();
            });

            it('should prompt for the username and password', () => {
              input.should.have.been.calledWith(PROMPT_SVN_USERNAME);
              password.should.have.been.calledWith(promptSvnPassword(user));
              creds.should.eql({
                username: user,
                password: pass,
              });
            });
          });
        });
      });
    });
  });
});
