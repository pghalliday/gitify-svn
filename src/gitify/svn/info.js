import {
  Parser,
} from 'xml2js';
import {
  nodeKindTranslator,
  dateTranslator,
  intTranslator,
  schemaMap,
  schemaSingleEntryList,
  schemaValue,
} from './shared';

const parser = new Parser();

const kind = schemaValue({
  field: 'nodeKind',
  translator: nodeKindTranslator,
});

const path = schemaValue({
  field: 'path',
});

const revision = schemaValue({
  field: 'revision',
  translator: intTranslator,
});

const entryAttributes = schemaMap({
  kind,
  path,
  revision,
});

const relativeUrl = schemaSingleEntryList(schemaValue({
  field: 'relativeUrl',
}));

const url = schemaSingleEntryList(schemaValue({
  field: 'url',
}));

const repositoryRoot = schemaSingleEntryList(schemaValue({
  field: 'repositoryRoot',
}));

const repositoryUuid = schemaSingleEntryList(schemaValue({
  field: 'repositoryUuid',
}));

const repository = schemaSingleEntryList(schemaMap({
  root: repositoryRoot,
  uuid: repositoryUuid,
}));

const lastChangedRev = schemaValue({
  field: 'lastChangedRev',
  translator: intTranslator,
});

const commitAttributes = schemaMap({
  revision: lastChangedRev,
});

const author = schemaSingleEntryList(schemaValue({
  field: 'lastChangedAuthor',
}));

const date = schemaSingleEntryList(schemaValue({
  field: 'lastChangedDate',
  translator: dateTranslator,
}));

const commit = schemaSingleEntryList(schemaMap({
  '$': commitAttributes,
  author,
  date,
}));

const entry = schemaSingleEntryList(schemaMap({
  '$': entryAttributes,
  'relative-url': relativeUrl,
  url,
  repository,
  commit,
}));

const info = schemaMap({
  entry,
});

const root = schemaMap({
  info,
});

export async function parse(xml) {
  const parsed = await parser.parseStringPromise(xml);
  const info = root(parsed);
  return info;
}
