/* eslint-disable max-len */

import {
  NODE_KIND_DIRECTORY,
} from '../../src/gitify/svn/info';

import {
  ADD,
  DELETE,
  MODIFY,
  REPLACE,
} from '../../src/gitify/svn/log';

export const SVN_MOCK = './test/mocks/svn.sh';
export const DIRECTORY_INFO = `
svn
Path: trunk
URL: http://path/to/repos/trunk
Relative URL: ^/trunk
Repository Root: http://path/to/repos
Repository UUID: UUID-UUID-UUID
Revision: 100
Node Kind: directory
Last Changed Author: developer@company.com
Last Changed Rev: 50
Last Changed Date: 2004-06-25 17:50:25 +0200 (Fri, 25 Jun 2004)
`;
export const PARSED_DIRECTORY_INFO = {
  path: 'trunk',
  url: 'http://path/to/repos/trunk',
  relativeUrl: '^/trunk',
  repositoryRoot: 'http://path/to/repos',
  repositoryUuid: 'UUID-UUID-UUID',
  revision: 100,
  nodeKind: NODE_KIND_DIRECTORY,
  lastChangedAuthor: 'developer@company.com',
  lastChangedRev: 50,
  lastChangedDate: new Date('2004-06-25T17:50:25.000+0200'),
};
export const UNEXPECTED_INFO = `
svn
Path: trunk
URL: http://path/to/repos/trunk
Relative URL: ^/trunk
Repository Root: http://path/to/repos
Repository UUID: UUID-UUID-UUID
Revision: 100
Node Kind: directory
Last Changed Author: developer@company.com
Last Changed Rev: 50
Last Changed Date: 2004-06-25 17:50:25 +0200 (Fri, 25 Jun 2004)
Unexpected Field: Boo
`;
export const UNKNOWN_INFO = `
svn
Path: trunk
URL: http://path/to/repos/trunk
Relative URL: ^/trunk
Repository Root: http://path/to/repos
Repository UUID: UUID-UUID-UUID
Revision: 100
Node Kind: unknown
Last Changed Author: developer@company.com
Last Changed Rev: 50
Last Changed Date: 2004-06-25 17:50:25 +0200 (Fri, 25 Jun 2004)
`;
const LOG_MESSAGE =`Comment line 1
Comment line 2
Comment line 3
`;
export const VALID_LOG = `
------------------------------------------------------------------------
r100 | developer@company.com | 2004-06-25 17:50:25 +0200 (Fri, 25 Jun 2004) | 3 lines
Changed paths:
   A /new-file
   D /replaced-from-file
   A /moved-to-file (from /moved-from-file:75)
   D /moved-from-file
   M /another-modified-file
   R /replaced-file
   M /modified-file
   R /replaced-to-file (from /replaced-from-file:50)

${LOG_MESSAGE}------------------------------------------------------------------------

`;
export const PARSED_VALID_LOG = {
  revision: 100,
  author: 'developer@company.com',
  date: new Date('2004-06-25T17:50:25.000+0200'),
  message: LOG_MESSAGE,
  changes: [{
    action: ADD,
    path: '/new-file',
  }, {
    action: DELETE,
    path: '/replaced-from-file',
  }, {
    action: ADD,
    path: '/moved-to-file',
    from: {
      path: '/moved-from-file',
      revision: 75,
    },
  }, {
    action: DELETE,
    path: '/moved-from-file',
  }, {
    action: MODIFY,
    path: '/another-modified-file',
  }, {
    action: REPLACE,
    path: '/replaced-file',
  }, {
    action: MODIFY,
    path: '/modified-file',
  }, {
    action: REPLACE,
    path: '/replaced-to-file',
    from: {
      path: '/replaced-from-file',
      revision: 50,
    },
  }],
};
