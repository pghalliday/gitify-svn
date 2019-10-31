export const createInstance = (Class, overrides) => {
  return sinon.createStubInstance(Class, overrides);
};

export const createConstructor = (instance) => {
  const constructor = sinon.fake(() => instance);
  return Object.assign(constructor, {
    create: sinon.fake.resolves(instance),
  });
};

export const checkConstructed = (constructor, params) => {
  constructor.should.have.been.calledOnce;
  constructor.should.have.been.calledWithNew;
  constructor.should.have.been.calledWith(params);
};

export const checkCreated = (constructor, params) => {
  constructor.create.should.have.been.calledOnce;
  constructor.create.should.have.been.calledWith(params);
};
