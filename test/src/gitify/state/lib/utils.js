import {
  importObject,
  exportObject,
  parseAuthor,
} from '../../../../../src/gitify/state/lib/utils';

class MyClass {
  constructor({
    param,
    exported,
  }) {
    this.param = param;
    this.exported = exported;
  }

  export() {
    return {
      exported: {
        param: this.param,
      },
    };
  }
}

describe('src', () => {
  describe('gitify', () => {
    describe('state', () => {
      describe('lib', () => {
        describe('utils', () => {
          describe('importObject', () => {
            // eslint-disable-next-line max-len
            it('should construct an instance of the class with exported data', () => {
              const importMethod = importObject(MyClass, {
                param: 'param data',
              });
              const myInstance = importMethod('exported data');
              myInstance.param = 'param data';
              myInstance.exported = 'exported data';
            });
          });

          describe('exportObject', () => {
            it('should export an object', () => {
              const myInstance = new MyClass({
                param: 'param data',
              });
              exportObject(myInstance).should.eql({
                exported: {
                  param: 'param data',
                },
              });
            });
          });

          describe('parseAuthor', () => {
            it('should handle undefined', () => {
              parseAuthor().should.eql({});
            });

            it('should handle name only', () => {
              parseAuthor(' my name ').should.eql({
                name: 'my name',
              });
            });

            it('should handle name and email', () => {
              parseAuthor(' my name < name@email.com > ').should.eql({
                name: 'my name',
                email: 'name@email.com',
              });
            });
          });
        });
      });
    });
  });
});
