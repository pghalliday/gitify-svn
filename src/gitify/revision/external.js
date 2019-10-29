export default class External {
  constructor({
    remotePath,
    localPath,
    type,
    action,
  }) {
    this.remotePath = remotePath;
    this.localPath = localPath;
    this.type = type;
    this.action = action;
  }
}
