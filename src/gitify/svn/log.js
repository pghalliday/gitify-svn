import _ from 'lodash';

export const ADD = 'add';
export const DELETE = 'delete';
export const MODIFY = 'modify';
export const REPLACE = 'replace';

const actions = {
  'A': ADD,
  'D': DELETE,
  'M': MODIFY,
  'R': REPLACE,
};

const identityTranslator = (value) => value;
const dateTranslator = (value) => new Date(value);
const intTranslator = (value) => parseInt(value);
const actionTranslator = (value) => {
  const action = actions[value];
  if (!action) throw new Error(`Unknown log action: ${value}`);
  return action;
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

export function parse(lines) {
  const log = {};
  while (true) {
    let line;
    [line, lines] = getLine(lines);
    if (_.isUndefined(lines)) break;
  }
  return log;
}
