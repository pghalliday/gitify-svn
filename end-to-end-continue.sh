#!/bin/bash

set -e

DIR="$(dirname "$(readlink -f "$0")")"
cd $DIR/end-to-end
. svn-repos.sh
../../bin/index.js -l debug -u admin -p password -r http://localhost/svn/${SVN_REPOS[0]} working
