import { transferMatcher } from "../matchers.js";
import { transferEnabled } from "../command-enabled.js";
import { transferIssue } from "../github.js";
import { Command } from "./command.js";
import { getLogger } from "../logger.js";

const classLogger = getLogger("commands/transfer-command");

export class TransferCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return transferMatcher(this.payload.comment.body);
  }

  enabled(config) {
    return transferEnabled(config);
  }

  async run(authToken) {
    const targetRepo = this.matches()[1];
    const sourceRepo = this.payload.repository.name;

    const logger = classLogger.child({
      user: this.payload.sender.login,
      id: this.id,
    });

    logger.info(
      `Transferring issue ${this.payload.issue.html_url} to repo ${targetRepo}`
    );
    try {
      await transferIssue(
        authToken,
        this.payload.repository.owner.login,
        sourceRepo,
        targetRepo,
        this.payload.issue.node_id
      );
    } catch (error) {
      logger.error(
        `Failed to transfer issue ${
          error.errors ? JSON.stringify(error.errors) : ""
        }`,
        error
      );
    }
  }
}
