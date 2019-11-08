# Setup

An Ansible playbook to install and configure a development environment locally. This is currently targeted at a Ubuntu 18.04 development environment.

The following will be installed and configured:

- Node.js
- Subversion server
- Git server
- Gitify tools for creating, listing and deleting repositories
  - Git
    - `sudo gitify-git-create <NAME>` - create a Git remote repository
    - `gitify-git-list` - list the Git remote repositories
    - `sudo gitify-git-delete <NAME>` - delete a Git remote repository
    - `gitify-git-checksum <NAME>` - checksum the checksums for each ref in a Git remote repository (can be used to verify that 2 repositories are identical)
  - Subversion
    - `sudo gitify-svn-create <NAME>` - create a Subversion repository
    - `gitify-svn-list` - list the Subversion repositories
    - `sudo gitify-svn-delete <NAME>` - delete a Subversion repository
    - `gitify-svn-dump <NAME> <FILE>` - dump a Subversion repository to the given file
    - `sudo gitify-svn-load <NAME> <FILE>` - load a Subversion respository from the given file

## Usage

First install ansible using the provided bash script

```
sudo ./install-ansible
```

Then run the playbook

```
ansible-playbook --ask-become-pass playbook.yml
```

**NB: You will be asked for the password to use with sudo, so you should run this as a user with sudo privileges.**
