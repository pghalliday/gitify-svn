import parse from '../../../../../src/gitify/state/lib/parse';
import {
  DEFAULT_NAME,
  DEFAULT_EMAIL,
} from '../../../../../src/constants';

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('lib', () => {
        describe('parse', () => {
          describe('author', () => {
            it('should handle undefined', () => {
              parse.author().should.eql({
                name: DEFAULT_NAME,
                email: DEFAULT_EMAIL,
              });
            });

            it('should handle empty', () => {
              parse.author('').should.eql({
                name: DEFAULT_NAME,
                email: DEFAULT_EMAIL,
              });
            });

            it('should handle name only', () => {
              parse.author(' my name ').should.eql({
                name: 'my name',
                email: DEFAULT_EMAIL,
              });
            });

            it('should handle name and email', () => {
              parse.author(' my name < name@email.com > ').should.eql({
                name: 'my name',
                email: 'name@email.com',
              });
            });

            it('should handle name and empty email', () => {
              parse.author(' my name <  > ').should.eql({
                name: 'my name',
                email: DEFAULT_EMAIL,
              });
            });

            it('should handle email only', () => {
              parse.author(' name@email.com ').should.eql({
                name: 'name',
                email: 'name@email.com',
              });
            });
          });
        });
      });
    });
  });
});
