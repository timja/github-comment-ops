export class Command {
  constructor(id, payload) {
    this.id = id;
    this.payload = payload;
  }

  get usage() {
    throw new Error("usage must be implemented");
  }

  get description() {
    throw new Error("description must be implemented");
  }

  matches() {
    throw new Error("matches() must be implemented");
  }

  // eslint-disable-next-line no-unused-vars
  enabled(config) {
    return {
      enabled: false,
    };
  }

  // eslint-disable-next-line no-unused-vars
  run(authToken) {
    throw new Error("run(authToken) must be implemented");
  }
}
