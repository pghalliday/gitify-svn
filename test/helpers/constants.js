/* eslint-disable max-len */

import {
  resolve,
} from 'path';
import {
  NODE_KIND,
  ACTION,
} from '../../src/gitify/svn';

export const BINARY = resolve('./test/mocks/binary.sh');
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
export const DIRECTORY_INFO_WITHOUT_AUTHOR = `
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
export const PARSED_DIRECTORY_INFO_WITHOUT_AUTHOR = {
  path: 'trunk',
  url: 'http://path/to/repos/trunk',
  relativeUrl: '^/trunk',
  repositoryRoot: 'http://path/to/repos',
  repositoryUuid: 'UUID-UUID-UUID',
  revision: 100,
  nodeKind: NODE_KIND.DIRECTORY,
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
   prop-mods="true"
   text-mods="false"
   copyfrom-path="/moved-from-path"
   copyfrom-rev="75"
   action="A">/moved-to-path</path>
<path
   prop-mods="true"
   text-mods="false"
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
    propMods: true,
    textMods: false,
    kind: NODE_KIND.DIRECTORY,
    copyFromPath: '/moved-from-path',
    copyFromRevision: 75,
  }, {
    propMods: true,
    textMods: false,
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
export const VALID_DIFF_PROPS = `
Index: path/to/directory1
===================================================================
--- path/to/directory1  (revision 100)
+++ path/to/directory1  (revision 101)

Property changes on: path/to/directory1
___________________________________________________________________
Modified: svn:externals
## -1,2 +1,2 ##
 url1 name1
 url2 name2
-url3 name3
-url4@123 name4
+url5@test@ name5
+url6@test@234 name6
Index: path/to/directory2
===================================================================
--- path/to/directory2  (revision 100)
+++ path/to/directory2  (revision 101)

Property changes on: path/to/directory2
___________________________________________________________________
Added: svn:externals
## -1,2 +1,2 ##
-url3 name1
+url1 name1
+url2 name2
Index: path/to/directory3
===================================================================
--- path/to/directory3  (revision 100)
+++ path/to/directory3  (revision 101)

Property changes on: path/to/directory3
___________________________________________________________________
Deleted: svn:externals
## -1,2 +1,2 ##
-url1 name1
-url2 name2
`;
export const PARSED_VALID_DIFF_PROPS = {
  '/path/to/directory1': {
    'svn:externals': {
      added: {
        name5: 'url5@test',
        name6: {
          url: 'url6@test',
          revision: 234,
        },
      },
      deleted: {
        name3: 'url3',
        name4: {
          url: 'url4',
          revision: 123,
        },
      },
      modified: {
      },
    },
  },
  '/path/to/directory2': {
    'svn:externals': {
      added: {
        name2: 'url2',
      },
      deleted: {
      },
      modified: {
        name1: 'url1',
      },
    },
  },
  '/path/to/directory3': {
    'svn:externals': {
      added: {
      },
      deleted: {
        name1: 'url1',
        name2: 'url2',
      },
      modified: {
      },
    },
  },
};
export const UNKNOWN_DIFF_PROPS = `
Index: path/to/directory1
===================================================================
--- path/to/directory1  (revision 100)
+++ path/to/directory1  (revision 101)

Property changes on: path/to/directory1
___________________________________________________________________
Modified: svn:externals
## -1,2 +1,2 ##
 url1 name1
 url2 name2
-url3 name3
-url4 name4
+url5 name5
+url6 name6
Index: path/to/directory2
===================================================================
--- path/to/directory2  (revision 100)
+++ path/to/directory2  (revision 101)

Property changes on: path/to/directory2
___________________________________________________________________
Added: svn:unknown
## -1,2 +1,2 ##
+url1 name1
+url2 name2
Index: path/to/directory3
===================================================================
--- path/to/directory3  (revision 100)
+++ path/to/directory3  (revision 101)

Property changes on: path/to/directory3
___________________________________________________________________
Deleted: svn:externals
## -1,2 +1,2 ##
-url1 name1
-url2 name2
`;
export const INVALID_EXTERNAL_TUPLE_DIFF_PROPS = `
Index: path/to/directory1
===================================================================
--- path/to/directory1  (revision 100)
+++ path/to/directory1  (revision 101)

Property changes on: path/to/directory1
___________________________________________________________________
Modified: svn:externals
## -1,2 +1,2 ##
 url1 name1
 url2 name2
-url3 name3
-url4 name4
+url5 name5
+url6 name6
Index: path/to/directory2
===================================================================
--- path/to/directory2  (revision 100)
+++ path/to/directory2  (revision 101)

Property changes on: path/to/directory2
___________________________________________________________________
Added: svn:externals
## -1,2 +1,2 ##
+url1 name1 hello
+url2 name2
Index: path/to/directory3
===================================================================
--- path/to/directory3  (revision 100)
+++ path/to/directory3  (revision 101)

Property changes on: path/to/directory3
___________________________________________________________________
Deleted: svn:externals
## -1,2 +1,2 ##
-url1 name1
-url2 name2
`;
export const INVALID_LINE_PREFIX_DIFF_PROPS = `
Index: path/to/directory1
===================================================================
--- path/to/directory1  (revision 100)
+++ path/to/directory1  (revision 101)

Property changes on: path/to/directory1
___________________________________________________________________
Modified: svn:externals
## -1,2 +1,2 ##
url1 name1
 url2 name2
-url3 name3
-url4 name4
+url5 name5
+url6 name6
Index: path/to/directory2
===================================================================
--- path/to/directory2  (revision 100)
+++ path/to/directory2  (revision 101)

Property changes on: path/to/directory2
___________________________________________________________________
Added: svn:externals
## -1,2 +1,2 ##
+url1 name1 hello
+url2 name2
Index: path/to/directory3
===================================================================
--- path/to/directory3  (revision 100)
+++ path/to/directory3  (revision 101)

Property changes on: path/to/directory3
___________________________________________________________________
Deleted: svn:externals
## -1,2 +1,2 ##
-url1 name1
-url2 name2
`;
export const REPOSITORY_URL = 'repositoryUrl';
export const NEW_REPOSITORY_URL = 'newUrl';
export const REPOSITORY_UUID = 'repositoryUuid';
export const NEW_REPOSITORY_UUID = 'newUuid';
export const HEAD_REVISION = 300;
export const NEW_HEAD_REVISION = 400;
export const LAST_REVISION = 100;
export const NEW_LAST_REVISION = 200;
export const PROGRESS_TEST_DATA = {
  repositoryUrl: REPOSITORY_URL,
  repositoryUuid: REPOSITORY_UUID,
  headRevision: HEAD_REVISION,
  lastRevision: LAST_REVISION,
  projects: {},
};
