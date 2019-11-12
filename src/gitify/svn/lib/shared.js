export const ACTION = {
  ADD: 'add',
  DELETE: 'delete',
  MODIFY: 'modify',
  REPLACE: 'replace',
};

const actions = {
  'A': ACTION.ADD,
  'D': ACTION.DELETE,
  'M': ACTION.MODIFY,
  'R': ACTION.REPLACE,
};

export const NODE_KIND = {
  DIRECTORY: 'directory',
  FILE: 'file',
  UNSET: 'unset',
};

const nodeKinds = {
  'dir': NODE_KIND.DIRECTORY,
  'file': NODE_KIND.FILE,
  '': NODE_KIND.UNSET,
};

export const actionTranslator = (value) => {
  const action = actions[value];
  if (!action) throw new Error(`Unknown action: ${value}`);
  return action;
};
export const nodeKindTranslator = (value) => {
  const nodeKind = nodeKinds[value];
  if (!nodeKind) throw new Error(`Unknown node kind: ${value}`);
  return nodeKind;
};
export const dateTranslator = (value) => new Date(value);
export const intTranslator = (value) => parseInt(value);
export const boolTranslator = (value) => {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    // istanbul ignore next
    default:
      throw new Error('invalid boolean value');
  }
};

const checkArray = (data) => {
  // istanbul ignore next
  if (!Array.isArray(data)) {
    throw new Error('Expected array');
  }
};

const checkSingleEntryArray = (data) => {
  checkArray(data);
  // istanbul ignore next
  if (data.length !== 1) {
    throw new Error('Expected array of length 1');
  }
};

export const schemaMap = (schema) => (data) => {
  let translated = {};
  const keys = Object.keys(data);
  if (keys.length !== Object.keys(schema).length) {
    throw new Error(`Unexpected keys: ${keys}`);
  }
  keys.forEach((key) => {
    const translator = schema[key];
    if (translator) {
      translated = {
        ...translated,
        ...translator(data[key]),
      };
    } else {
      throw new Error(`Unknown key: ${key}`);
    }
  });
  return translated;
};

export const schemaSingleEntryList = (schema) => (data) => {
  checkSingleEntryArray(data);
  return schema(data[0]);
};

export const schemaList = (params) => (data) => {
  checkArray(data);
  return {
    [params.field]: data.map(params.schema),
  };
};

export const schemaTest = (tests) => (data) => {
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    if (!test.test || test.test(data)) {
      return test.schema(data);
    }
  }
  // istanbul ignore next
  throw new Error('No matching schema');
};

export const schemaValue = (params) => (data) => {
  return {
    [params.field]: params.translator ? params.translator(data) : data,
  };
};
