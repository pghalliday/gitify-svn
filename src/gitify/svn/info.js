import _ from 'lodash';

export const NODE_KIND_DIRECTORY = 'DIR';

const nodeKinds = {
  'directory': NODE_KIND_DIRECTORY,
};

const identityTranslator = (value) => value;
const dateTranslator = (value) => new Date(value);
const intTranslator = (value) => parseInt(value);
const nodeKindTranslator = (value) => {
  const nodeKind = nodeKinds[value];
  if (!nodeKind) throw new Error(`Unknown info Node Kind: ${value}`);
  return nodeKind;
};

const fields = {
  'Last Changed Author': {
    field: 'lastChangedAuthor',
    translator: identityTranslator,
  },
  'Last Changed Date': {
    field: 'lastChangedDate',
    translator: dateTranslator,
  },
  'Last Changed Rev': {
    field: 'lastChangedRev',
    translator: intTranslator,
  },
  'Node Kind': {
    field: 'nodeKind',
    translator: nodeKindTranslator,
  },
  'Path': {
    field: 'path',
    translator: identityTranslator,
  },
  'Relative URL': {
    field: 'relativeUrl',
    translator: identityTranslator,
  },
  'Repository Root': {
    field: 'repositoryRoot',
    translator: identityTranslator,
  },
  'Repository UUID': {
    field: 'repositoryUuid',
    translator: identityTranslator,
  },
  'Revision': {
    field: 'revision',
    translator: intTranslator,
  },
  'URL': {
    field: 'url',
    translator: identityTranslator,
  },
};

function getLine(lines) {
  const newline = lines.indexOf('\n');
  if (newline !== -1) {
    return [
      lines.substring(0, newline),
      lines.substring(newline + 1),
    ];
  }
  return [
    lines,
  ];
}

function getValue(line) {
  const colon = line.indexOf(':');
  if (colon !== -1) {
    return [
      line.substring(0, colon),
      line.substring(colon + 2),
    ];
  }
  return [
    line,
  ];
}

export function parse(lines) {
  const info = {};
  while (true) {
    let line;
    [line, lines] = getLine(lines);
    const [field, value] = getValue(line);
    if (value) {
      const knownField = fields[field];
      if (knownField) {
        info[knownField.field] = knownField.translator(value);
      } else {
        throw new Error(`Unknown info field: ${field}`);
      }
    }
    if (_.isUndefined(lines)) break;
  }
  return info;
}
