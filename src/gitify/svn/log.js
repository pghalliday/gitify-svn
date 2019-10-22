import {
  Parser,
} from 'xml2js';
import {
  actionTranslator,
  nodeKindTranslator,
  dateTranslator,
  intTranslator,
  schemaMap,
  schemaSingleEntryList,
  schemaValue,
  schemaList,
  schemaTest,
} from './shared';

const parser = new Parser();

const revision = schemaValue({
  field: 'revision',
  translator: intTranslator,
});

const logEntryAttributes = schemaMap({
  revision,
});

const author = schemaSingleEntryList(schemaValue({
  field: 'author',
}));

const date = schemaSingleEntryList(schemaValue({
  field: 'date',
  translator: dateTranslator,
}));

const pathField = schemaValue({
  field: 'path',
});

const copyFromPath = schemaValue({
  field: 'copyFromPath',
});

const copyFromRevision = schemaValue({
  field: 'copyFromRevision',
  translator: intTranslator,
});

const kind = schemaValue({
  field: 'kind',
  translator: nodeKindTranslator,
});

const action = schemaValue({
  field: 'action',
  translator: actionTranslator,
});

const pathAttributes = schemaTest([{
  test: (data) => data['copyfrom-path'],
  schema: schemaMap({
    'copyfrom-path': copyFromPath,
    'copyfrom-rev': copyFromRevision,
    kind,
    action,
  }),
}, {
  schema: schemaMap({
    kind,
    action,
  }),
}]);

const path = schemaList({
  field: 'changes',
  schema: schemaMap({
    '_': pathField,
    '$': pathAttributes,
  }),
});

const paths = schemaSingleEntryList(schemaMap({
  path,
}));

const msg = schemaSingleEntryList(schemaValue({
  field: 'message',
}));

const logentry = schemaSingleEntryList(schemaMap({
  '$': logEntryAttributes,
  author,
  date,
  paths,
  msg,
}));

const log = schemaMap({
  logentry,
});

const root = schemaMap({
  log,
});

export async function parse(xml) {
  const parsed = await parser.parseStringPromise(xml);
  const log = root(parsed);
  return log;
}