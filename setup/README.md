# Setup

An Ansible playbook to install and configure a development environment locally. This is currently targeted at a Ubuntu 18.04 development environment.

The following will be installed and configured:

- Node.js
- Subversion server
- Git server
- Gitify tools for creating, listing and deleting repositories

First install ansible using the provided bash script

```
sudo ./install-ansible
```

Then run the playbook

```
ansible-playbook --ask-become-pass playbook.yml
```

**NB: You will be asked for the password to use with sudo, so you should run this as a user with sudo privileges.**
