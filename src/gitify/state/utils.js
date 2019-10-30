export const exportObject = (object) => object.export();
export const importObject = (Class, params) => (exported) => new Class({
  ...params,
  exported,
});
