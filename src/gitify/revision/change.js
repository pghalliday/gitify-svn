import External from './external';

export default class Change {
  constructor({
    path,
    action,
    type,
  }) {
    this.path = path;
    this.action = action;
    this.type = type;
    this.externals = {};
  }

  get externalCount() {
    return Object.keys(this.externals).length;
  }

  addExternal({
    name,
    url,
    revision,
    type,
    action,
  }) {
    // do we already know about this external
    if (this.externals[name]) {
      // was it removed already (in which case we must be
      // adding it here as modified)
      if (this.externals[name].action === ACTION.DELETED) {
        action = ACTION.MODIFIED;
      } else {
        // we added it already so this is just removing the old verion
        this.externals[name].action = ACTION.MODIFIED;
        return;
      }
    }
    this.externals[name] = new External({
      name,
      url,
      revision,
      type,
      action,
    });
  }
}
