# Scenarios

trunk aliases: [trunk, Trunk]
branches aliases: [branches, Branches, branch, Branch]
tags aliases: [tags, Tags, tag, Tag]

- Create a new top level project for the repository
- Do all work in this parent project which should maintain the same directory stucture as SVN
  - tags and branches will not be present
  - external files will have to be converted to directories
  - some submodules may be different to their external counterparts (TVLib)
    - Even for TVLib additional submodules could be used to maintain the same structure?

For each change in log
- Is it a svn:mergeinfo
  - collect the changes under the merge
  - try a fast forward merge (git merge --ff-only)
  - try a recursive merge with the theirs startegy but without a commit (git merge -s recursive -X theirs --no-commit)
    - apply the changes as if we started again (ignoring changes that were already applied)
    - then commit
- Is it a svn:ignore
  - add or modify .gitignore for the correct directory
- Did a tag change
  - collect all changes to tag
  - convert/switch to a branch
  - apply the commits as if on that branch
  - retag
- Was a new directory added
  - is it a tag
    - process the tag (was it a tagFromTrunk?)
  - is it a branch
    - create the branch
  - is it a moved project
    - move the project
  - is it a copied project
    - create a new project with the same git history
  - is it a new project
    - does it have trunk, branches, tags
  - else just commit the change to the existing parent project
- Was an external added or changed
  - is it a directory
    - does it already exist as a project
      - add/modify/update-peg submodule
    - else create new project from sub-directory (git filter-branch)
      - add/modify/update-peg submodule to both locations
  - is it a file
    - does it exist in another submodule
      - do nothing and add to list of external files in submodule?
    - else choose parent directory to be project
      - does it already exist as a project
        - add/modify/update-peg submodule
      - else create new project from parent directory (git filter-branch)
        - add/modify/update-peg submodule to both locations
    - make a note of the changed path of external in file in directory
- Was an external deleted
  - remove submodule
- Was a file added, modified deleted
  - apply change to project

- When commiting any change
  - Update submodules in project (unless pegged)
  - Update submodules in parent projects (unless pegged)
