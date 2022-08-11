import { reopenMatcher } from "../matchers.js";
import { reopenEnabled } from "../command-enabled.js";
import { reopenIssue } from "../github.js";
import { Command } from "./command.js";
import { getLogger } from "../logger.js";

const classLogger = getLogger("commands/reopen-command");

export class ReopenCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return reopenMatcher(this.payload.comment.body);
  }

  enabled(config) {
    return reopenEnabled(config);
  }

  async run(authToken) {
    const sourceRepo = this.payload.repository.name;

    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    logger.info(`Re-opening issue ${this.payload.issue.html_url}`);

    try {
      await reopenIssue(authToken, sourceRepo, this.payload.issue.node_id);
    } catch (error) {
      logger.error(
        `Failed to reopen issue ${
          error.errors ? JSON.stringify(error.errors) : ""
        }`,
        error
      );
    }
  }
}
