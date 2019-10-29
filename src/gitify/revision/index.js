import Change from './change';
import External from './external';
import {
  relative,
} from 'path';

export default class Revision {
  constructor({
    number,
    author,
    date,
    message,
  }) {
    this.number = number;
    this.author = author;
    this.date = date;
    this.message = message;
    this.changes = {};
  }

  get changeCount() {
    return this.changes.length;
  }

  addChange({
    path,
    action,
    type,
  }) {
    this.changes[path] = new Change({
      path,
      action,
      type,
    });
  }

  addExternal({
    path,
    name,
    url,
    revision,
    type,
    action,
  }) {
    // a changed external should be associated with
    // a change of that path (directory)
    const change = this.changes[path];
    change.addExternal({
      name,
      url,
      revision,
      type,
      action,
    });
  }
}
