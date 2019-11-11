#!/bin/bash

set -e

DIR="$(dirname "$(readlink -f "$0")")"
cd $DIR/end-to-end

. git-repos.sh
. svn-repos.sh

# init Git repositories
for repo in "${GIT_REPOS[@]}"; do
  echo y | sudo gitify-git-delete $repo
  sudo gitify-git-create $repo
done

# init SVN repositories
for repo in "${SVN_REPOS[@]}"; do
  echo y | sudo gitify-svn-delete $repo
  sudo gitify-svn-load $repo saved/$repo.dump
done

# replay the progress starting with the
# first SVN repo in the list
rm -rf working
mkdir working
cp saved/prompts.json working/
../bin/index.js -l debug -q -u admin -p password -r http://localhost/svn/${SVN_REPOS[0]} working

# check the Git repository checksums
EXITCODE=0
for repo in "${GIT_REPOS[@]}"; do
  echo "Testing checksum for Git repo $repo"
  EXPECTED=$(cat saved/$repo.checksum)
  echo "EXPECTED: $EXPECTED"
  ACTUAL=$(gitify-git-checksum $repo)
  echo "ACTUAL: $ACTUAL"
  if [ "$EXPECTED" == "$ACTUAL" ]; then
    echo "PASS"
  else
    echo "FAIL"
    EXITCODE=1
  fi
done
exit $EXITCODE
