/* eslint-disable max-len */

import {
  NODE_KIND,
  ACTION,
} from '../../src/gitify/svn';

export const SVN_MOCK = './test/mocks/svn.sh';
export const DIRECTORY_INFO = `
<?xml version="1.0" encoding="UTF-8"?>
<info>
<entry
   revision="100"
   kind="dir"
   path="trunk">
<url>http://path/to/repos/trunk</url>
<relative-url>^/trunk</relative-url>
<repository>
<root>http://path/to/repos</root>
<uuid>UUID-UUID-UUID</uuid>
</repository>
<commit
   revision="50">
<author>developer@company.com</author>
<date>2004-06-25T15:50:25.449194Z</date>
</commit>
</entry>
</info>
`;
export const PARSED_DIRECTORY_INFO = {
  path: 'trunk',
  url: 'http://path/to/repos/trunk',
  relativeUrl: '^/trunk',
  repositoryRoot: 'http://path/to/repos',
  repositoryUuid: 'UUID-UUID-UUID',
  revision: 100,
  nodeKind: NODE_KIND.DIRECTORY,
  lastChangedAuthor: 'developer@company.com',
  lastChangedRev: 50,
  lastChangedDate: new Date('2004-06-25T15:50:25.449Z'),
};
export const UNEXPECTED_INFO_KEYS = `
<?xml version="1.0" encoding="UTF-8"?>
<info>
<entry
   revision="100"
   kind="dir"
   path="trunk">
<url>http://path/to/repos/trunk</url>
<relative-url>^/trunk</relative-url>
<repository>
<root>http://path/to/repos</root>
<uuid>UUID-UUID-UUID</uuid>
</repository>
<commit
   revision="50">
<author>developer@company.com</author>
<date>2004-06-25T15:50:25.449194Z</date>
</commit>
<unexpected>boo</unexpected>
</entry>
</info>
`;
export const UNEXPECTED_INFO_KEY = `
<?xml version="1.0" encoding="UTF-8"?>
<info>
<entry
   revision="100"
   kind="dir"
   path="trunk">
<relative-url>^/trunk</relative-url>
<repository>
<root>http://path/to/repos</root>
<uuid>UUID-UUID-UUID</uuid>
</repository>
<commit
   revision="50">
<author>developer@company.com</author>
<date>2004-06-25T15:50:25.449194Z</date>
</commit>
<unexpected>boo</unexpected>
</entry>
</info>
`;
export const UNKNOWN_INFO = `
<?xml version="1.0" encoding="UTF-8"?>
<info>
<entry
   revision="100"
   kind="unknown"
   path="trunk">
<url>http://path/to/repos/trunk</url>
<relative-url>^/trunk</relative-url>
<repository>
<root>http://path/to/repos</root>
<uuid>UUID-UUID-UUID</uuid>
</repository>
<commit
   revision="50">
<author>developer@company.com</author>
<date>2004-06-25T15:50:25.449194Z</date>
</commit>
</entry>
</info>
`;
const LOG_MESSAGE =`Comment line 1
Comment line 2
Comment line 3
`;
export const VALID_LOG = `
<?xml version="1.0" encoding="UTF-8"?>
<log>
<logentry
   revision="100">
<author>developer@company.com</author>
<date>2012-08-15T15:14:57.365053Z</date>
<paths>
<path
   kind="dir"
   action="A">/new-path</path>
<path
   kind="dir"
   action="D">/replaced-from-path</path>
<path
   kind="dir"
   copyfrom-path="/moved-from-path"
   copyfrom-rev="75"
   action="A">/moved-to-path</path>
<path
   kind="dir"
   action="D">/moved-from-path</path>
<path
   kind="dir"
   action="M">/another-modified-path</path>
<path
   kind="dir"
   action="R">/replaced-path</path>
<path
   kind="dir"
   action="M">/modified-path</path>
<path
   kind="dir"
   copyfrom-path="/replaced-from-path"
   copyfrom-rev="50"
   action="R">/replaced-to-path</path>
</paths>
<msg>${LOG_MESSAGE}</msg>
</logentry>
</log>
`;
export const PARSED_VALID_LOG = {
  revision: 100,
  author: 'developer@company.com',
  date: new Date('2012-08-15T15:14:57.365Z'),
  message: LOG_MESSAGE,
  changes: [{
    action: ACTION.ADD,
    path: '/new-path',
    kind: NODE_KIND.DIRECTORY,
  }, {
    action: ACTION.DELETE,
    path: '/replaced-from-path',
    kind: NODE_KIND.DIRECTORY,
  }, {
    action: ACTION.ADD,
    path: '/moved-to-path',
    kind: NODE_KIND.DIRECTORY,
    copyFromPath: '/moved-from-path',
    copyFromRevision: 75,
  }, {
    action: ACTION.DELETE,
    path: '/moved-from-path',
    kind: NODE_KIND.DIRECTORY,
  }, {
    action: ACTION.MODIFY,
    path: '/another-modified-path',
    kind: NODE_KIND.DIRECTORY,
  }, {
    action: ACTION.REPLACE,
    path: '/replaced-path',
    kind: NODE_KIND.DIRECTORY,
  }, {
    action: ACTION.MODIFY,
    path: '/modified-path',
    kind: NODE_KIND.DIRECTORY,
  }, {
    action: ACTION.REPLACE,
    path: '/replaced-to-path',
    kind: NODE_KIND.DIRECTORY,
    copyFromPath: '/replaced-from-path',
    copyFromRevision: 50,
  }],
};
export const INVALID_ACTION_LOG = `
<?xml version="1.0" encoding="UTF-8"?>
<log>
<logentry
   revision="100">
<author>developer@company.com</author>
<date>2012-08-15T15:14:57.365053Z</date>
<paths>
<path
   kind="dir"
   action="A">/new-path</path>
<path
   kind="dir"
   action="X">/replaced-from-path</path>
<path
   kind="dir"
   copyfrom-path="/moved-from-path"
   copyfrom-rev="75"
   action="A">/moved-to-path</path>
<path
   kind="dir"
   action="D">/moved-from-path</path>
<path
   kind="dir"
   action="M">/another-modified-path</path>
<path
   kind="dir"
   action="R">/replaced-path</path>
<path
   kind="dir"
   action="M">/modified-path</path>
<path
   kind="dir"
   copyfrom-path="/replaced-from-path"
   copyfrom-rev="50"
   action="R">/replaced-to-path</path>
</paths>
<msg>${LOG_MESSAGE}</msg>
</logentry>
</log>
`;
