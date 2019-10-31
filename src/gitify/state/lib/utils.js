export const exportObject = (object) => object.export();
export const importObject = (Class) => (exported) => new Class({
  exported,
});
