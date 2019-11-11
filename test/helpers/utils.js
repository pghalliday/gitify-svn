export const createInstance = (Class, overrides) => {
  return sinon.createStubInstance(Class, overrides);
};

export const createConstructor = () => {
  const constructor = sinon.stub();
  const create = sinon.stub();
  return Object.assign(constructor, {
    create,
  });
};

const stubCalls = (stub, method, values) => {
  stub.reset();
  if (!Array.isArray(values)) {
    values = [values];
  }
  let i;
  for (i = 0; i < values.length; i++) {
    stub.onCall(i)[method](values[i]);
  }
  stub.onCall(i).throws(new Error('No more values'));
};

export const stubReturns = (stub, values) => {
  stubCalls(stub, 'returns', values);
};

export const stubResolves = (stub, values) => {
  stubCalls(stub, 'resolves', values);
};

export const checkConstructed = (constructor, params) => {
  constructor.should.have.been.calledWithNew;
  if (params) constructor.should.have.been.calledWith(params);
};

export const checkCreated = (constructor, params) => {
  constructor.create.should.have.been.called;
  if (params) constructor.create.should.have.been.calledWith(params);
};
