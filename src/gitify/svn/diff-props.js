import _ from 'lodash';
import {
  getLogger,
} from '../../logger';

const logger = getLogger(__filename);

const STATE_GET_PATH = {
  'Index: ': (path, state) => {
    path = '/' + path;
    const diffProps = state.diffProps;
    diffProps[path] = diffProps[path] || {};
    state.path = path;
    state.handler = STATE_GET_PROPERTY;
  },
};

const handleProperty = (name, state) => {
  const props = state.diffProps[state.path];
  const property = properties[name];
  if (property) {
    props[name] = props[name] || property.init();
    state.property = name;
    state.handler = property.handler;
  } else {
    throw new Error(`diff-props: unknown property: ${name}`);
  }
};

const ignore = () => {};

const STATE_GET_PROPERTY_BASE = {
  'Added: ': handleProperty,
  'Deleted: ': handleProperty,
  'Modified: ': handleProperty,
};

const STATE_GET_PROPERTY = {
  ...STATE_GET_PROPERTY_BASE,
  '===': ignore,
  '+++': ignore,
  '---': ignore,
  'Property changes on: ': ignore,
  '___': ignore,
};

const handleExternalChange = (field) => (text, state) => {
  const tuple = text.split(' ');
  if (tuple.length != 2) {
    throw new Error(`diff-props: invalid external tuple: ${text}`);
  }
  const atParts = tuple[0].split('@');
  let revision;
  if (atParts.length > 1) {
    const lastPart = atParts.pop();
    if (lastPart !== '') {
      revision = parseInt(lastPart);
    }
  }
  const url = atParts.join('@');
  const changes = state.diffProps[state.path][state.property];
  const name = tuple[1];
  let change;
  if (revision) {
    change = {
      url,
      revision,
    };
  } else {
    change = url;
  }
  changes[field][name] = change;
  // if both added and deleted then move to modified
  if (changes.added[name] && changes.deleted[name]) {
    changes.modified[name] = changes.added[name];
    delete changes.added[name];
    delete changes.deleted[name];
  }
};

const STATE_GET_EXTERNAL_CHANGES_PROPERTY_OR_PATH = {
  ...STATE_GET_PATH,
  ...STATE_GET_PROPERTY_BASE,
  '+': handleExternalChange('added'),
  '-': handleExternalChange('deleted'),
  ' ': ignore,
  '#': ignore,
};

const properties = {
  'svn:externals': {
    handler: STATE_GET_EXTERNAL_CHANGES_PROPERTY_OR_PATH,
    init: () => ({
      added: {},
      deleted: {},
      modified: {},
    }),
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

function parseLine(line, state) {
  if (line.length > 0) {
    const handler = state.handler;
    const prefixes = Object.keys(handler);
    for (let i = 0; i < prefixes.length; i++) {
      const prefix = prefixes[i];
      if (line.startsWith(prefix)) {
        return handler[prefix](line.substring(prefix.length), state);
      }
    }
    throw new Error(`diff-props: unexpected line prefix: ${line}`);
  }
}

export function parse(lines) {
  logger.debug(lines);
  const state = {
    handler: STATE_GET_PATH,
    diffProps: {},
  };
  while (true) {
    let line;
    [line, lines] = getLine(lines);
    parseLine(line, state);
    if (_.isUndefined(lines)) break;
  }
  return state.diffProps;
}
