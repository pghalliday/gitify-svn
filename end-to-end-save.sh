#!/bin/bash

set -e

DIR="$(dirname "$(readlink -f "$0")")"
cd $DIR/end-to-end

. svn-repos.sh
. git-repos.sh

# dump SVN repositories
for repo in "${SVN_REPOS[@]}"; do
  echo "dumping SVN repo: $repo"
  gitify-svn-dump $repo saved/$repo.dump
done

# save Git repository checksums
for repo in "${GIT_REPOS[@]}"; do
  echo "recording checksum for Git repo: $repo"
  gitify-git-checksum $repo | tee saved/$repo.checksum
done

# copy the prompts file to replay
echo "copying the prompt file to replay progress"
cp -f working/prompts.json saved/prompts.json
